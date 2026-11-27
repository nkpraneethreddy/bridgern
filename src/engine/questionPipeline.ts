/**
 * Dual-AI Question Pipeline Batch Orchestrator.
 *
 * Coordinates the full loop:
 * Generator Agent -> Evaluator Agent -> Quality Gate Check -> Output Pack / DB.
 */

import { PipelineBatchReport } from './aiPipelineTypes';
import { GenerationPromptConfig, questionGenerator } from './questionGenerator';
import { questionEvaluator } from './questionEvaluator';

export class QuestionPipelineOrchestrator {
  /**
   * Run a batch of generation prompts through the dual-agent loop.
   */
  async runBatch(configs: GenerationPromptConfig[]): Promise<PipelineBatchReport> {
    const report: PipelineBatchReport = {
      totalGenerated: configs.length,
      approvedCount: 0,
      rejectedCount: 0,
      averageScore: 0,
      items: [],
    };

    let totalScoreSum = 0;

    for (const config of configs) {
      // 1. First AI generates question
      const draft = await questionGenerator.generateQuestion(config);

      // 2. Second AI audits and scores against rubric
      const evaluation = await questionEvaluator.evaluateQuestion(draft);

      totalScoreSum += evaluation.overallScore;

      if (evaluation.approved) {
        report.approvedCount += 1;
      } else {
        report.rejectedCount += 1;
      }

      report.items.push({
        question: draft,
        evaluation,
      });
    }

    report.averageScore =
      configs.length > 0 ? Math.round((totalScoreSum / configs.length) * 10) / 10 : 0;

    return report;
  }
}

export const pipelineOrchestrator = new QuestionPipelineOrchestrator();
