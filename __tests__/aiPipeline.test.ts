import { pipelineOrchestrator } from '../src/engine/questionPipeline';
import { questionEvaluator } from '../src/engine/questionEvaluator';
import { questionGenerator } from '../src/engine/questionGenerator';

describe('Dual-AI Question Generation & Evaluation Pipeline', () => {
  it('generates an original question draft meeting structural requirements', async () => {
    const draft = await questionGenerator.generateQuestion({
      categorySlug: 'pharmacological-therapies',
      topic: 'Digoxin Toxicity',
      difficulty: 3,
      itemType: 'multiple_choice',
    });

    expect(draft.categorySlug).toBe('pharmacological-therapies');
    expect(draft.topic).toBe('Digoxin Toxicity');
    expect(draft.options.length).toBe(4);
    expect(draft.options.some((o) => o.isCorrect)).toBe(true);
    expect(draft.stem).toContain('Digoxin Toxicity');
  });

  it('evaluator approves high-quality question drafts with score >= 8.0', async () => {
    const draft = await questionGenerator.generateQuestion({
      categorySlug: 'management-of-care',
      topic: 'Delegation to UAP',
      difficulty: 4,
      itemType: 'multiple_choice',
    });

    const evaluation = await questionEvaluator.evaluateQuestion(draft);

    expect(evaluation.overallScore).toBeGreaterThanOrEqual(8.0);
    expect(evaluation.approved).toBe(true);
    expect(evaluation.criticalFlags.length).toBe(0);
    expect(evaluation.feedbackForRevision).toBeNull();
  });

  it('evaluator rejects flawed drafts and generates revision feedback', () => {
    const flawedDraft = {
      categorySlug: 'safety-infection-control',
      topic: 'Airborne Precautions',
      itemType: 'multiple_choice' as const,
      difficulty: 2,
      cognitiveLevel: 'apply' as const,
      stem: 'Too short', // < 30 chars
      clinicalData: {},
      rationale: 'Short',
      scoringRule: 'dichotomous' as const,
      options: [
        { optionKey: 'A', label: 'Option A', explanation: '', isCorrect: false },
      ], // Only 1 option, no correct option, empty explanation
    };

    const evaluation = questionEvaluator.evaluateSyntheticDraft(flawedDraft);

    expect(evaluation.approved).toBe(false);
    expect(evaluation.overallScore).toBeLessThan(8.0);
    expect(evaluation.criticalFlags.length).toBeGreaterThan(0);
    expect(evaluation.feedbackForRevision).toContain('Item rejected due to');
  });

  it('orchestrator runs a batch pipeline and produces an aggregated report', async () => {
    const batchConfigs = [
      {
        categorySlug: 'pharmacological-therapies',
        topic: 'Insulin Regimens',
        difficulty: 3,
        itemType: 'multiple_choice' as const,
      },
      {
        categorySlug: 'physiological-adaptation',
        topic: 'Acute Myocardial Infarction',
        difficulty: 4,
        itemType: 'multiple_choice' as const,
      },
    ];

    const report = await pipelineOrchestrator.runBatch(batchConfigs);

    expect(report.totalGenerated).toBe(2);
    expect(report.approvedCount).toBe(2);
    expect(report.rejectedCount).toBe(0);
    expect(report.averageScore).toBeGreaterThanOrEqual(8.0);
    expect(report.items.length).toBe(2);
  });
});
