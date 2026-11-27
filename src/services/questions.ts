/**
 * Question fetching service — loads questions with their options from Supabase.
 */

import { supabase, supabaseConfigured } from '../lib/supabase';
import type { Question, QuestionOption } from '../types/database';
import type { QuestionWithOptions } from '../engine/types';

interface FetchQuestionsParams {
  /** Filter by category IDs (empty = all) */
  categoryIds?: string[];
  /** Filter by item type */
  itemType?: string;
  /** Filter by difficulty range */
  minDifficulty?: number;
  maxDifficulty?: number;
  /** Only published questions */
  status?: string;
  /** Max number to fetch */
  limit?: number;
}

/**
 * Fetch published questions with their options.
 */
export async function fetchQuestions(
  params: FetchQuestionsParams = {},
): Promise<QuestionWithOptions[]> {
  if (!supabaseConfigured) {
    if (__DEV__) console.warn('Supabase not configured — returning empty question pool');
    return [];
  }

  const {
    categoryIds = [],
    itemType,
    minDifficulty = 1,
    maxDifficulty = 5,
    status = 'published',
    limit = 200,
  } = params;

  let query = supabase
    .from('questions')
    .select('*')
    .eq('status', status)
    .gte('difficulty', minDifficulty)
    .lte('difficulty', maxDifficulty)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (categoryIds.length > 0) {
    query = query.in('category_id', categoryIds);
  }

  if (itemType) {
    query = query.eq('item_type', itemType);
  }

  const { data: questions, error: qError } = await query;
  if (qError) throw qError;
  if (!questions || questions.length === 0) return [];

  // Fetch all options for these questions in one query
  const questionIds = questions.map((q: Question) => q.id);
  const { data: options, error: oError } = await supabase
    .from('question_options')
    .select('*')
    .in('question_id', questionIds)
    .order('sort_order', { ascending: true });

  if (oError) throw oError;

  // Group options by question
  const optionsByQuestion: Record<string, QuestionOption[]> = {};
  for (const opt of (options ?? []) as QuestionOption[]) {
    if (!optionsByQuestion[opt.question_id]) {
      optionsByQuestion[opt.question_id] = [];
    }
    optionsByQuestion[opt.question_id].push(opt);
  }

  // Merge
  return (questions as Question[]).map((q) => ({
    ...q,
    options: optionsByQuestion[q.id] ?? [],
  }));
}

/**
 * Fetch questions for a specific category (used for category-based practice).
 */
export async function fetchQuestionsByCategory(
  categoryId: string,
  limit = 50,
): Promise<QuestionWithOptions[]> {
  return fetchQuestions({ categoryIds: [categoryId], limit });
}
