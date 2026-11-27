import { offlineStorage } from '../src/services/offlineStorage';

describe('offlineStorage', () => {
  beforeEach(async () => {
    await offlineStorage.clearAll();
  });

  it('enqueues answers when offline and provides pending count', async () => {
    expect(offlineStorage.getPendingSyncCount()).toBe(0);

    await offlineStorage.enqueueAnswer({
      userId: 'test-user-123',
      sessionId: 'session-abc',
      questionId: 'q-456',
      response: { type: 'multiple_choice', selectedOptionKey: 'A' },
      score: { pointsEarned: 1, pointsPossible: 1, isCorrect: true },
      timeSpentSeconds: 30,
    });

    expect(offlineStorage.getPendingSyncCount()).toBe(1);
    const queued = offlineStorage.getQueuedItems();
    expect(queued.length).toBe(1);
    expect(queued[0].questionId).toBe('q-456');
    expect(queued[0].score.isCorrect).toBe(true);
  });

  it('flushes queue and clears pending items when synced', async () => {
    await offlineStorage.enqueueAnswer({
      userId: 'test-user-123',
      sessionId: 'session-abc',
      questionId: 'q-1',
      response: { type: 'multiple_choice', selectedOptionKey: 'B' },
      score: { pointsEarned: 0, pointsPossible: 1, isCorrect: false },
      timeSpentSeconds: 40,
    });

    expect(offlineStorage.getPendingSyncCount()).toBe(1);

    offlineStorage.setOnline(true);
    const syncResult = await offlineStorage.flushQueue();

    expect(syncResult.synced).toBe(1);
    expect(syncResult.remaining).toBe(0);
    expect(offlineStorage.getPendingSyncCount()).toBe(0);
  });

  it('caches question pool in memory for offline retrieval', async () => {
    const mockQuestions = [
      {
        id: 'q-cache-1',
        category_id: 'cat-1',
        case_study_id: null,
        case_study_step: null,
        topic: 'Pharmacology',
        item_type: 'multiple_choice' as const,
        difficulty: 3,
        cognitive_level: 'apply' as const,
        stem: 'What is the dosage?',
        clinical_data: {},
        rationale: 'Correct because...',
        max_points: 1,
        scoring_rule: 'dichotomous' as const,
        is_placeholder: true,
        status: 'published' as const,
        author_id: null,
        reviewer_id: 'rev-1',
        published_at: null,
        pack_version: 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        options: [],
      },
    ];

    await offlineStorage.cacheQuestionPool(mockQuestions);
    const cached = offlineStorage.getCachedQuestions();
    expect(cached.length).toBe(1);
    expect(cached[0].id).toBe('q-cache-1');
  });
});
