import {
  diagnoseShutOffMechanism,
  generate45DayRetakeRoadmap,
} from '../src/engine/retakeAutopsy';

describe('diagnoseShutOffMechanism', () => {
  it('returns minimum_length_deficit when exam stopped at 85 items', () => {
    const result = diagnoseShutOffMechanism(85);
    expect(result.mechanism).toBe('minimum_length_deficit');
    expect(result.title).toContain('85');
    expect(result.prescribedStrategy.length).toBeGreaterThan(0);
    expect(result.clinicalImplication).toBeTruthy();
  });

  it('returns minimum_length_deficit for any value <= 85', () => {
    const result = diagnoseShutOffMechanism(80);
    expect(result.mechanism).toBe('minimum_length_deficit');
  });

  it('returns maximum_length_marginal when exam stopped at exactly 150 items', () => {
    const result = diagnoseShutOffMechanism(150);
    expect(result.mechanism).toBe('maximum_length_marginal');
    expect(result.title).toContain('150');
    expect(result.prescribedStrategy.length).toBeGreaterThan(0);
  });

  it('returns mid_length_drop for a value between 86 and 149', () => {
    const result = diagnoseShutOffMechanism(115);
    expect(result.mechanism).toBe('mid_length_drop');
    expect(result.title).toContain('115');
    expect(result.summary).toContain('115');
    expect(result.prescribedStrategy.length).toBeGreaterThan(0);
  });

  it('returns mid_length_drop for edge value 86', () => {
    const result = diagnoseShutOffMechanism(86);
    expect(result.mechanism).toBe('mid_length_drop');
  });

  it('returns mid_length_drop for edge value 149', () => {
    const result = diagnoseShutOffMechanism(149);
    expect(result.mechanism).toBe('mid_length_drop');
  });
});

describe('generate45DayRetakeRoadmap', () => {
  const weakCats = ['Pharmacological & Parenteral Therapies', 'Management of Care'];

  it('generates exactly 45 days', () => {
    const roadmap = generate45DayRetakeRoadmap(weakCats);
    expect(roadmap.length).toBe(45);
  });

  it('assigns Phase 1 to days 1–14', () => {
    const roadmap = generate45DayRetakeRoadmap(weakCats);
    const phase1 = roadmap.filter((d) => d.phase === 1);
    expect(phase1.length).toBe(14);
    expect(phase1[0].dayNumber).toBe(1);
    expect(phase1[13].dayNumber).toBe(14);
  });

  it('assigns Phase 2 to days 15–30', () => {
    const roadmap = generate45DayRetakeRoadmap(weakCats);
    const phase2 = roadmap.filter((d) => d.phase === 2);
    expect(phase2.length).toBe(16);
    expect(phase2[0].dayNumber).toBe(15);
    expect(phase2[15].dayNumber).toBe(30);
  });

  it('assigns Phase 3 to days 31–45', () => {
    const roadmap = generate45DayRetakeRoadmap(weakCats);
    const phase3 = roadmap.filter((d) => d.phase === 3);
    expect(phase3.length).toBe(15);
    expect(phase3[0].dayNumber).toBe(31);
    expect(phase3[14].dayNumber).toBe(45);
  });

  it('targets primary weak category in Phase 1', () => {
    const roadmap = generate45DayRetakeRoadmap(weakCats);
    const phase1 = roadmap.filter((d) => d.phase === 1);
    phase1.forEach((day) => {
      expect(day.focusArea).toBe('Pharmacological & Parenteral Therapies');
    });
  });

  it('targets secondary weak category in Phase 2', () => {
    const roadmap = generate45DayRetakeRoadmap(weakCats);
    const phase2 = roadmap.filter((d) => d.phase === 2);
    phase2.forEach((day) => {
      expect(day.focusArea).toBe('Management of Care');
    });
  });

  it('targets comprehensive CAT in Phase 3', () => {
    const roadmap = generate45DayRetakeRoadmap(weakCats);
    const phase3 = roadmap.filter((d) => d.phase === 3);
    phase3.forEach((day) => {
      expect(day.focusArea).toContain('CAT');
      expect(day.targetItems).toBeGreaterThanOrEqual(85);
    });
  });

  it('uses fallback primary category when weakCategories is empty', () => {
    const roadmap = generate45DayRetakeRoadmap([]);
    expect(roadmap.length).toBe(45);
    const phase1 = roadmap.filter((d) => d.phase === 1);
    expect(phase1[0].focusArea).toBe('Pharmacological & Parenteral Therapies');
  });

  it('assigns increasing target item counts across phases', () => {
    const roadmap = generate45DayRetakeRoadmap(weakCats);
    const p1Items = roadmap.find((d) => d.phase === 1)!.targetItems;
    const p2Items = roadmap.find((d) => d.phase === 2)!.targetItems;
    const p3Items = roadmap.find((d) => d.phase === 3)!.targetItems;
    expect(p1Items).toBeLessThan(p2Items);
    expect(p2Items).toBeLessThan(p3Items);
  });
});
