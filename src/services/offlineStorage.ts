/**
 * Zero-dependency offline storage and sync queue service for BridgeRN.
 *
 * Implements Phase 4 offline requirements using existing Expo primitives
 * (expo-secure-store for sensitive keys / small state & JSON serialization)
 * with robust in-memory fallbacks for test & web environments.
 *
 * Capabilities:
 * 1. Question bank local cache (allows full offline test taking)
 * 2. Offline attempt & answer sync queue (records offline progress)
 * 3. Automatic flushing / syncing when connectivity returns
 */

import * as SecureStore from 'expo-secure-store';
import type { AnswerRecord, QuestionWithOptions } from '../engine/types';
import { supabase, supabaseConfigured } from '../lib/supabase';

const OFFLINE_QUEUE_KEY = 'bridgern_offline_answers_queue';
const CACHED_QUESTIONS_KEY = 'bridgern_cached_question_bank';

export interface QueuedAnswerPayload {
  id: string;
  userId: string;
  sessionId: string;
  questionId: string;
  response: unknown;
  score: {
    pointsEarned: number;
    pointsPossible: number;
    isCorrect: boolean;
  };
  timeSpentSeconds: number;
  recordedAt: string;
}

class OfflineStorageService {
  private inMemoryQueue: QueuedAnswerPayload[] = [];
  private inMemoryQuestions: QuestionWithOptions[] = [];
  private isOnlineState = true;

  constructor() {
    this.hydrate();
  }

  /**
   * Load stored queue from persistent storage on startup
   */
  async hydrate(): Promise<void> {
    try {
      const queueData = await SecureStore.getItemAsync(OFFLINE_QUEUE_KEY);
      if (queueData) {
        this.inMemoryQueue = JSON.parse(queueData);
      }
    } catch {
      // In web or restricted environments, keep memory queue
    }

    try {
      const qData = await SecureStore.getItemAsync(CACHED_QUESTIONS_KEY);
      if (qData) {
        this.inMemoryQuestions = JSON.parse(qData);
      }
    } catch {
      // Fallback to in-memory
    }
  }

  /**
   * Cache question pool locally for offline practice
   */
  async cacheQuestionPool(questions: QuestionWithOptions[]): Promise<void> {
    this.inMemoryQuestions = questions;
    try {
      // Chunk or store top questions to stay within storage limits
      const serialized = JSON.stringify(questions.slice(0, 100));
      await SecureStore.setItemAsync(CACHED_QUESTIONS_KEY, serialized);
    } catch (e) {
      if (__DEV__) console.warn('Failed to cache question pool locally', e);
    }
  }

  /**
   * Get cached questions for offline usage
   */
  getCachedQuestions(): QuestionWithOptions[] {
    return this.inMemoryQuestions;
  }

  /**
   * Enqueue an offline answer for future sync
   */
  async enqueueAnswer(payload: Omit<QueuedAnswerPayload, 'id' | 'recordedAt'>): Promise<void> {
    const item: QueuedAnswerPayload = {
      ...payload,
      id: `offline-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      recordedAt: new Date().toISOString(),
    };

    this.inMemoryQueue.push(item);

    try {
      await SecureStore.setItemAsync(OFFLINE_QUEUE_KEY, JSON.stringify(this.inMemoryQueue));
    } catch {
      // In-memory retains item
    }
  }

  /**
   * Get pending queue count
   */
  getPendingSyncCount(): number {
    return this.inMemoryQueue.length;
  }

  /**
   * Get all queued items
   */
  getQueuedItems(): QueuedAnswerPayload[] {
    return [...this.inMemoryQueue];
  }

  /**
   * Set network connectivity state
   */
  setOnline(online: boolean): void {
    this.isOnlineState = online;
  }

  /**
   * Check if client believes it is online
   */
  isOnline(): boolean {
    return this.isOnlineState;
  }

  /**
   * Flush pending queued answers to Supabase when back online
   */
  async flushQueue(): Promise<{ synced: number; remaining: number }> {
    if (!this.isOnlineState || this.inMemoryQueue.length === 0) {
      return { synced: 0, remaining: this.inMemoryQueue.length };
    }

    if (!supabaseConfigured) {
      // Dev mode without live supabase: simulate successful sync
      const syncedCount = this.inMemoryQueue.length;
      this.inMemoryQueue = [];
      try {
        await SecureStore.deleteItemAsync(OFFLINE_QUEUE_KEY);
      } catch {}
      return { synced: syncedCount, remaining: 0 };
    }

    const itemsToSync = [...this.inMemoryQueue];
    const remainingItems: QueuedAnswerPayload[] = [];
    let synced = 0;

    for (const item of itemsToSync) {
      try {
        const { error } = await supabase.from('answers').insert({
          user_id: item.userId,
          exam_session_id: item.sessionId,
          question_id: item.questionId,
          user_response: item.response,
          points_earned: item.score.pointsEarned,
          points_possible: item.score.pointsPossible,
          is_correct: item.score.isCorrect,
          time_spent_seconds: item.timeSpentSeconds,
          created_at: item.recordedAt,
        });

        if (error) {
          remainingItems.push(item);
        } else {
          synced += 1;
        }
      } catch {
        remainingItems.push(item);
      }
    }

    this.inMemoryQueue = remainingItems;

    try {
      if (remainingItems.length === 0) {
        await SecureStore.deleteItemAsync(OFFLINE_QUEUE_KEY);
      } else {
        await SecureStore.setItemAsync(OFFLINE_QUEUE_KEY, JSON.stringify(remainingItems));
      }
    } catch {}

    return { synced, remaining: remainingItems.length };
  }

  /**
   * Reset store (used for tests & logout)
   */
  async clearAll(): Promise<void> {
    this.inMemoryQueue = [];
    this.inMemoryQuestions = [];
    try {
      await SecureStore.deleteItemAsync(OFFLINE_QUEUE_KEY);
      await SecureStore.deleteItemAsync(CACHED_QUESTIONS_KEY);
    } catch {}
  }
}

export const offlineStorage = new OfflineStorageService();
