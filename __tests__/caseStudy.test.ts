import { createPlaceholderPool } from '../src/engine/placeholderPool';
import { scoreAnswer } from '../src/engine/scoring';
import type { QuestionWithOptions } from '../src/engine/types';

describe('NGN Clinical Case Study Engine', () => {
  let pool: QuestionWithOptions[];
  let sepsisCase: QuestionWithOptions;
  let chfCase: QuestionWithOptions;

  beforeEach(() => {
    pool = createPlaceholderPool();
    sepsisCase = pool.find((q) => q.topic.includes('Sepsis'))!;
    chfCase = pool.find((q) => q.topic.includes('Pulmonary Edema'))!;
  });

  it('includes authentic NGN case study questions in the question pool', () => {
    const caseStudies = pool.filter((q) => q.item_type === 'case_study');
    expect(caseStudies.length).toBeGreaterThanOrEqual(2);
    expect(sepsisCase).toBeDefined();
    expect(chfCase).toBeDefined();
  });

  it('contains complete Electronic Health Record (EHR) chart structures', () => {
    const clinicalData = sepsisCase.clinical_data as Record<string, any>;
    expect(clinicalData.patient).toBeDefined();
    expect(clinicalData.patient.name).toBe('Harold Vance');
    expect(clinicalData.patient.admissionDiagnosis).toContain('Pneumonia');
    expect(clinicalData.patient.allergies).toContain('Penicillin');

    // Nurses' notes
    expect(clinicalData.nursesNotes.length).toBeGreaterThanOrEqual(2);
    expect(clinicalData.nursesNotes[0].timestamp).toBe('08:00');

    // Vital signs
    expect(clinicalData.vitalSigns.length).toBeGreaterThanOrEqual(2);
    expect(clinicalData.vitalSigns[1].bp).toBe('84/52');
    expect(clinicalData.vitalSigns[1].hr).toBe(122);

    // Labs with flags
    expect(clinicalData.labs.length).toBeGreaterThanOrEqual(4);
    const lactate = clinicalData.labs.find((l: any) => l.test.includes('Lactate'));
    expect(lactate).toBeDefined();
    expect(lactate.flag).toBe('CRITICAL');

    // Provider orders
    expect(clinicalData.orders.length).toBeGreaterThanOrEqual(3);
    const statOrders = clinicalData.orders.filter((o: any) => o.status === 'STAT');
    expect(statOrders.length).toBeGreaterThanOrEqual(2);
  });

  it('scores case study with inner multiple_choice response correctly', () => {
    // Eleanor Chen CHF case: sub_type is multiple_choice
    const correctResponse = {
      type: 'case_study' as const,
      step: 1,
      inner: {
        type: 'multiple_choice' as const,
        selected: 'A', // Oxygen
      },
    };

    const result = scoreAnswer(chfCase, correctResponse);
    expect(result.isCorrect).toBe(true);
    expect(result.pointsEarned).toBe(1);
    expect(result.pointsPossible).toBe(1);
    expect(result.optionFeedback['A']).toBe('correct');

    // Incorrect choice
    const incorrectResponse = {
      type: 'case_study' as const,
      step: 1,
      inner: {
        type: 'multiple_choice' as const,
        selected: 'B', // Furosemide before oxygen
      },
    };

    const incorrectResult = scoreAnswer(chfCase, incorrectResponse);
    expect(incorrectResult.isCorrect).toBe(false);
    expect(incorrectResult.pointsEarned).toBe(0);
  });

  it('scores case study with inner sata plus_minus scoring correctly', () => {
    // Sepsis case: 4 correct options (A, B, C, D)
    const allCorrectResponse = {
      type: 'case_study' as const,
      step: 1,
      inner: {
        type: 'sata' as const,
        selected: ['A', 'B', 'C', 'D'],
      },
    };

    const result = scoreAnswer(sepsisCase, allCorrectResponse);
    expect(result.isCorrect).toBe(true);
    expect(result.pointsEarned).toBe(4);
    expect(result.pointsPossible).toBe(4);

    // Partial response: selects 3 correct (A, B, C) and misses D
    // +1 (A) + 1 (B) + 1 (C) - 1 (D missed) = 2 points
    const partialResponse = {
      type: 'case_study' as const,
      step: 1,
      inner: {
        type: 'sata' as const,
        selected: ['A', 'B', 'C'],
      },
    };

    const partialResult = scoreAnswer(sepsisCase, partialResponse);
    expect(partialResult.pointsEarned).toBe(2);
    expect(partialResult.optionFeedback['A']).toBe('correct');
    expect(partialResult.optionFeedback['B']).toBe('correct');
    expect(partialResult.optionFeedback['C']).toBe('correct');
    expect(partialResult.optionFeedback['D']).toBe('missed');
  });

  it('rejects mismatched response type gracefully', () => {
    const mismatchedResponse = {
      type: 'multiple_choice' as const,
      selected: 'A',
    };

    const result = scoreAnswer(sepsisCase, mismatchedResponse as any);
    expect(result.isCorrect).toBe(false);
    expect(result.pointsEarned).toBe(0);
  });
});
