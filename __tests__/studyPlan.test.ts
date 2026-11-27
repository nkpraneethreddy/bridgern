import { useStudyPlanStore } from '../src/stores/studyPlanStore';

describe('studyPlanStore', () => {
  beforeEach(() => {
    useStudyPlanStore.setState({
      currentPlan: null,
      diagnosticCompleted: false,
      categoryBreakdowns: {},
    });
  });

  it('generates a personalized study plan from diagnostic scores', () => {
    const store = useStudyPlanStore.getState();

    const plan = store.generatePlanFromDiagnostic({
      examDate: '2027-01-15',
      weeklyHours: 20,
      categoryScores: {
        'Management of Care': { answered: 10, correct: 8 }, // 80%
        'Pharmacological & Parenteral Therapies': { answered: 10, correct: 4 }, // 40% - weak
        'Reduction of Risk Potential': { answered: 10, correct: 5 }, // 50% - weak
      },
    });

    expect(plan).toBeDefined();
    expect(plan.source).toBe('diagnostic');
    expect(plan.focusCategories).toContain('Pharmacological & Parenteral Therapies');
    expect(plan.dailyQuestionGoal).toBeGreaterThanOrEqual(15);
    expect(plan.dailyQuestionGoal).toBeLessThanOrEqual(80);
    expect(plan.scheduleBlocks.length).toBe(7);

    const state = useStudyPlanStore.getState();
    expect(state.diagnosticCompleted).toBe(true);
    expect(state.categoryBreakdowns['Pharmacological & Parenteral Therapies'].status).toBe('below_passing');
    expect(state.categoryBreakdowns['Management of Care'].status).toBe('above_passing');
  });

  it('records incremental category answers and updates accuracy', () => {
    const store = useStudyPlanStore.getState();

    store.recordCategoryAnswer('Management of Care', true);
    store.recordCategoryAnswer('Management of Care', false);

    const updated = useStudyPlanStore.getState().categoryBreakdowns['Management of Care'];
    expect(updated.totalAnswered).toBe(2);
    expect(updated.totalCorrect).toBe(1);
    expect(updated.accuracy).toBe(50);
    expect(updated.status).toBe('below_passing');
  });
});
