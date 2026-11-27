import { useRetakeStore } from '../src/stores/retakeStore';
import { useStudyPlanStore } from '../src/stores/studyPlanStore';

describe('retakeStore', () => {
  beforeEach(() => {
    useRetakeStore.setState({
      pastReport: null,
      isRetakeModeActive: false,
      isModalOpen: false,
    });
  });

  it('submits CPR ratings and automatically activates retake mode with identified weak categories', async () => {
    const store = useRetakeStore.getState();

    await store.submitCPR({
      examDate: '2026-10-15',
      targetState: 'IL-RN',
      questionsStoppedAt: 85,
      ratings: {
        'Management of Care': 'above_passing',
        'Pharmacological & Parenteral Therapies': 'below_passing',
        'Reduction of Risk Potential': 'below_passing',
        'Basic Care & Comfort': 'near_passing',
      },
    });

    const state = useRetakeStore.getState();
    expect(state.isRetakeModeActive).toBe(true);
    expect(state.pastReport?.questionsStoppedAt).toBe(85);
    expect(state.pastReport?.weakCategories).toContain('Pharmacological & Parenteral Therapies');
    expect(state.pastReport?.weakCategories).toContain('Reduction of Risk Potential');
    expect(state.pastReport?.weakCategories).toContain('Basic Care & Comfort');
    expect(state.pastReport?.weakCategories).not.toContain('Management of Care');

    // Confirm study plan was recalibrated
    const plan = useStudyPlanStore.getState().currentPlan;
    expect(plan).toBeDefined();
    expect(plan?.focusCategories).toContain('Pharmacological & Parenteral Therapies');
  });

  it('manages CPR modal open and close actions', () => {
    expect(useRetakeStore.getState().isModalOpen).toBe(false);
    useRetakeStore.getState().openModal();
    expect(useRetakeStore.getState().isModalOpen).toBe(true);
    useRetakeStore.getState().closeModal();
    expect(useRetakeStore.getState().isModalOpen).toBe(false);
  });

  it('resets retake mode when requested', async () => {
    await useRetakeStore.getState().submitCPR({
      examDate: '2026-10-15',
      targetState: 'CA-RN',
      questionsStoppedAt: 150,
      ratings: { 'Management of Care': 'below_passing' },
    });

    expect(useRetakeStore.getState().isRetakeModeActive).toBe(true);
    useRetakeStore.getState().resetRetakeMode();
    expect(useRetakeStore.getState().isRetakeModeActive).toBe(false);
    expect(useRetakeStore.getState().pastReport).toBeNull();
  });
});
