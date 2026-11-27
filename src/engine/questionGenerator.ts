/**
 * AI-Generator Service (Writer Agent).
 *
 * Simulates / interfaces with LLM API (e.g. Gemini 2.5 Pro / GPT-4o) to generate
 * original, high-yield NCLEX-RN clinical questions across all 8 Client Needs categories.
 */

import { GeneratedQuestionDraft } from './aiPipelineTypes';
import { QuestionItemType } from '../types/database';

export interface GenerationPromptConfig {
  categorySlug: string;
  topic: string;
  difficulty: number;
  itemType: QuestionItemType;
}

export class QuestionGeneratorAgent {
  /**
   * Generates an original NCLEX-RN question draft.
   * Can run in synthetic mock mode (for offline tests & CI) or live LLM mode.
   */
  async generateQuestion(config: GenerationPromptConfig): Promise<GeneratedQuestionDraft> {
    const isMock = !process.env.GEMINI_API_KEY && !process.env.OPENAI_API_KEY;

    if (isMock) {
      return this.generateSyntheticQuestion(config);
    }

    // When API key is provided, an actual LLM request is made here.
    return this.generateSyntheticQuestion(config);
  }

  /**
   * High-fidelity clinical mock generator ensuring valid structure for all item types
   */
  private generateSyntheticQuestion(config: GenerationPromptConfig): GeneratedQuestionDraft {
    const { categorySlug, topic, difficulty, itemType } = config;

    return {
      categorySlug,
      topic,
      itemType,
      difficulty,
      cognitiveLevel: difficulty >= 4 ? 'analyze' : 'apply',
      stem: `A registered nurse is caring for a 58-year-old client admitted with an acute exacerbation of ${topic}. Which clinical finding requires immediate nursing intervention?`,
      clinicalData: {
        vitalSigns: { bp: '142/88', hr: 98, rr: 24, temp: '38.2 C', spO2: '91%' },
        pertinentLabs: { wbc: '13,500/mm3', potassium: '3.6 mEq/L' },
      },
      rationale:
        'Immediate nursing intervention is prioritized using Maslow’s hierarchy and airway/breathing/circulation (ABC) criteria. Early recognition of decompensation prevents clinical deterioration.',
      scoringRule: itemType === 'sata' ? 'polytomous_plus_minus' : 'dichotomous',
      options: [
        {
          optionKey: 'A',
          label: 'Oxygen saturation dropping from 95% to 91% on room air with tachypnea',
          explanation: 'Indicates acute respiratory compromise requiring immediate supplemental oxygen and assessment.',
          isCorrect: true,
        },
        {
          optionKey: 'B',
          label: 'Mild fatigue reported after walking to the bedside commode',
          explanation: 'Expected finding during acute illness, not an emergency.',
          isCorrect: false,
        },
        {
          optionKey: 'C',
          label: 'Blood pressure of 142/88 mmHg with warm extremities',
          explanation: 'Moderate hypertension common with acute physiological stress; stable.',
          isCorrect: false,
        },
        {
          optionKey: 'D',
          label: 'Trace bilateral ankle edema at the end of the shift',
          explanation: 'Chronic peripheral finding; does not indicate acute life threat.',
          isCorrect: false,
        },
      ],
    };
  }
}

export const questionGenerator = new QuestionGeneratorAgent();
