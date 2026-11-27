/**
 * QuestionRenderer — dispatches to the correct item-type component.
 *
 * Unslop: quiet chrome, one accent for the selected state,
 * consistent 4px grid spacing throughout.
 */

import React from 'react';
import type { QuestionWithOptions, QuestionResponse, ScoreResult } from '../../engine/types';
import { MCQuestion } from './MCQuestion';
import { SATAQuestion } from './SATAQuestion';
import { MatrixQuestion } from './MatrixQuestion';
import { OrderedQuestion } from './OrderedQuestion';
import { HotSpotQuestion } from './HotSpotQuestion';
import { BowtieQuestion } from './BowtieQuestion';
import { CaseStudyQuestion } from './CaseStudyQuestion';

interface QuestionRendererProps {
  question: QuestionWithOptions;
  onSubmit: (response: QuestionResponse) => void;
  /** Feedback from scoring (tutor mode only, null during answering) */
  feedback: ScoreResult | null;
  /** Whether submit is disabled (e.g. already submitted) */
  disabled: boolean;
}

export function QuestionRenderer({
  question,
  onSubmit,
  feedback,
  disabled,
}: QuestionRendererProps) {
  switch (question.item_type) {
    case 'multiple_choice':
      return (
        <MCQuestion
          question={question}
          onSubmit={onSubmit}
          feedback={feedback}
          disabled={disabled}
        />
      );
    case 'sata':
      return (
        <SATAQuestion
          question={question}
          onSubmit={onSubmit}
          feedback={feedback}
          disabled={disabled}
        />
      );
    case 'matrix':
      return (
        <MatrixQuestion
          question={question}
          onSubmit={onSubmit}
          feedback={feedback}
          disabled={disabled}
        />
      );
    case 'ordered_response':
      return (
        <OrderedQuestion
          question={question}
          onSubmit={onSubmit}
          feedback={feedback}
          disabled={disabled}
        />
      );
    case 'hot_spot':
      return (
        <HotSpotQuestion
          question={question}
          onSubmit={onSubmit}
          feedback={feedback}
          disabled={disabled}
        />
      );
    case 'bowtie':
      return (
        <BowtieQuestion
          question={question}
          onSubmit={onSubmit}
          feedback={feedback}
          disabled={disabled}
        />
      );
    case 'case_study':
      return (
        <CaseStudyQuestion
          question={question}
          onSubmit={onSubmit}
          feedback={feedback}
          disabled={disabled}
        />
      );
    default:
      return null;
  }
}
