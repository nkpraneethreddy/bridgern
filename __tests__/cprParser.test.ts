import { parseCPRText } from '../src/services/cprParser';

describe('parseCPRText', () => {
  it('parses a full Pearson VUE CPR text with all 8 categories', () => {
    const sample = `
      Candidate Performance Report
      NCLEX-RN Examination
      Items Administered: 85
      
      Management of Care                    Above the Passing Standard
      Pharmacological & Parenteral Therapies  Below the Passing Standard
      Physiological Adaptation              Near the Passing Standard
      Safety & Infection Control            Above the Passing Standard
      Reduction of Risk Potential           Below the Passing Standard
      Basic Care & Comfort                  Near the Passing Standard
      Psychosocial Integrity                Above the Passing Standard
      Health Promotion & Maintenance        Near the Passing Standard
    `;

    const result = parseCPRText(sample);
    expect(result.success).toBe(true);
    expect(result.questionsStoppedAt).toBe(85);
    expect(result.ratings['Management of Care']).toBe('above_passing');
    expect(result.ratings['Pharmacological & Parenteral Therapies']).toBe('below_passing');
    expect(result.ratings['Physiological Adaptation']).toBe('near_passing');
    expect(result.ratings['Reduction of Risk Potential']).toBe('below_passing');
    expect(result.confidence).toBe('high');
  });

  it('handles short-form rating labels (without "the Passing Standard")', () => {
    const text = `
      Number of Items: 150
      Management of Care    Above Passing
      Pharmacological       Below Passing
      Physiological Adaptation  Near Passing
    `;
    const result = parseCPRText(text);
    expect(result.questionsStoppedAt).toBe(150);
    expect(result.ratings['Management of Care']).toBe('above_passing');
    expect(result.ratings['Pharmacological & Parenteral Therapies']).toBe('below_passing');
    expect(result.ratings['Physiological Adaptation']).toBe('near_passing');
  });

  it('extracts questions stopped at from various CPR header formats', () => {
    expect(parseCPRText('exam stopped at 115 questions').questionsStoppedAt).toBe(115);
    expect(parseCPRText('Total Items: 85').questionsStoppedAt).toBe(85);
    expect(parseCPRText('Items Administered: 150').questionsStoppedAt).toBe(150);
    expect(parseCPRText('Number of Items: 130').questionsStoppedAt).toBe(130);
  });

  it('returns success=false and low confidence for empty/garbage input', () => {
    const result = parseCPRText('This is not a CPR document at all.');
    expect(result.success).toBe(false);
    expect(result.confidence).toBe('low');
    expect(Object.keys(result.ratings).length).toBe(0);
  });

  it('returns medium confidence when only 4-6 categories found', () => {
    const partial = `
      Management of Care        Above the Passing Standard
      Pharmacological           Below the Passing Standard
      Physiological Adaptation  Near the Passing Standard
      Safety & Infection        Above the Passing Standard
    `;
    const result = parseCPRText(partial);
    expect(result.confidence).toBe('medium');
  });

  it('ignores Pearson VUE header noise lines', () => {
    const noisy = `
      Pearson VUE Candidate Performance Report
      Test Center: Chicago, IL
      Authorization Number: 12345-ABCDE
      Date: 2026-10-15
      Management of Care    Above the Passing Standard
      Pharmacological       Below the Passing Standard
    `;
    const result = parseCPRText(noisy);
    expect(result.success).toBe(true);
    // Header noise should not appear in unrecognized lines
    expect(result.unrecognizedLines.every((l) => !/pearson|authorization|test\s+center/i.test(l))).toBe(true);
  });

  it('handles multi-line CPR where rating is on the next line after category', () => {
    const multiLine = `
      Management of Care
      Above the Passing Standard
      Pharmacological & Parenteral Therapies
      Below the Passing Standard
    `;
    const result = parseCPRText(multiLine);
    expect(result.ratings['Management of Care']).toBe('above_passing');
    expect(result.ratings['Pharmacological & Parenteral Therapies']).toBe('below_passing');
  });
});
