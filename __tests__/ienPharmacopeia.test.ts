import {
  detectMedicationsInText,
  IEN_DRUG_DATABASE,
  searchIENPharmacopeia,
} from '../src/services/ienPharmacopeia';

describe('IEN Pharmacopeia & Drug Cross-Reference', () => {
  it('contains comprehensive high-yield NCLEX medications with phonetics and rules', () => {
    expect(IEN_DRUG_DATABASE.length).toBeGreaterThanOrEqual(20);

    for (const drug of IEN_DRUG_DATABASE) {
      expect(drug.usGeneric).toBeTruthy();
      expect(drug.phonetic).toBeTruthy();
      expect(drug.intlEquivalents.length).toBeGreaterThan(0);
      expect(drug.drugClass).toBeTruthy();
      expect(drug.nclexPriorityRule).toBeTruthy();
      expect(typeof drug.isHighAlert).toBe('boolean');
    }
  });

  describe('detectMedicationsInText', () => {
    it('detects medications mentioned by US Generic name', () => {
      const stem = 'The nurse prepares to administer furosemide 40 mg IV for pulmonary edema.';
      const detected = detectMedicationsInText(stem);
      expect(detected.length).toBe(1);
      expect(detected[0].usGeneric).toBe('Furosemide');
      expect(detected[0].intlEquivalents).toContain('Frusemide');
      expect(detected[0].phonetic).toBe('fyoo-ROH-seh-myde');
    });

    it('detects medications mentioned by International Commonwealth name', () => {
      const stem = 'Client reports taking paracetamol 1000 mg every 4 hours at home.';
      const detected = detectMedicationsInText(stem);
      expect(detected.length).toBe(1);
      expect(detected[0].usGeneric).toBe('Acetaminophen');
      expect(detected[0].intlEquivalents).toContain('Paracetamol');
    });

    it('detects multiple medications in clinical text without duplicates', () => {
      const text =
        'Client prescribed digoxin 0.25 mg daily and albuterol inhaler PRN. Prior medication was salbutamol.';
      const detected = detectMedicationsInText(text);
      expect(detected.length).toBe(2);
      const names = detected.map((d) => d.usGeneric);
      expect(names).toContain('Digoxin');
      expect(names).toContain('Albuterol');
    });

    it('returns empty array when no medications are mentioned', () => {
      const text = 'The nurse assesses bilateral lower extremities for peripheral pulses.';
      expect(detectMedicationsInText(text)).toEqual([]);
    });

    it('handles empty or null string gracefully', () => {
      expect(detectMedicationsInText('')).toEqual([]);
    });
  });

  describe('searchIENPharmacopeia', () => {
    it('searches by US Generic name', () => {
      const results = searchIENPharmacopeia('levo');
      expect(results.length).toBeGreaterThanOrEqual(1);
      expect(results.some((r) => r.usGeneric === 'Levothyroxine')).toBe(true);
    });

    it('searches by International / Brand name', () => {
      const results = searchIENPharmacopeia('ventolin');
      expect(results.length).toBe(1);
      expect(results[0].usGeneric).toBe('Albuterol');
    });

    it('searches by drug class', () => {
      const results = searchIENPharmacopeia('diuretic');
      expect(results.length).toBeGreaterThanOrEqual(2);
      const names = results.map((d) => d.usGeneric);
      expect(names).toContain('Furosemide');
      expect(names).toContain('Spironolactone');
    });

    it('returns full database when query is empty', () => {
      const results = searchIENPharmacopeia('');
      expect(results.length).toBe(IEN_DRUG_DATABASE.length);
    });

    it('returns empty array when no matches found', () => {
      const results = searchIENPharmacopeia('nonexistentdrugxyz');
      expect(results).toEqual([]);
    });
  });

  describe('High-Alert Safety Categorization', () => {
    it('correctly identifies ISMP high-alert medications', () => {
      const highAlertDrugs = IEN_DRUG_DATABASE.filter((d) => d.isHighAlert).map(
        (d) => d.usGeneric
      );
      expect(highAlertDrugs).toContain('Epinephrine');
      expect(highAlertDrugs).toContain('Norepinephrine');
      expect(highAlertDrugs).toContain('Heparin');
      expect(highAlertDrugs).toContain('Warfarin');
      expect(highAlertDrugs).toContain('Regular Insulin');
      expect(highAlertDrugs).toContain('Potassium Chloride');
      expect(highAlertDrugs).toContain('Morphine');
      expect(highAlertDrugs).toContain('Digoxin');
    });
  });
});
