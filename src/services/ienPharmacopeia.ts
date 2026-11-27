/**
 * IEN Pharmacopeia & US Drug Cross-Reference Service.
 *
 * Specifically designed for Internationally Educated Nurses (IENs):
 * 1. Cross-references US Generic Names (USAN) with British (BAN), Commonwealth,
 *    and International Nonproprietary Names (rINN) used worldwide.
 * 2. Provides phonetic pronunciation guides for complex US pharmaceutical names.
 * 3. Highlights ISMP High-Alert Medication safety checks and NCLEX Priority Nursing Rules.
 * 4. Automatic medication detection engine to contextualize question rationales.
 */

export interface IENDrugEntry {
  usGeneric: string;
  phonetic: string;
  intlEquivalents: string[];
  drugClass: string;
  isHighAlert: boolean;
  nclexPriorityRule: string;
  commonIndications: string;
}

export const IEN_DRUG_DATABASE: IENDrugEntry[] = [
  {
    usGeneric: 'Acetaminophen',
    phonetic: 'uh-see-tuh-MIN-oh-fen',
    intlEquivalents: ['Paracetamol', 'Panadol', 'Calpol'],
    drugClass: 'Non-opioid Analgesic / Antipyretic',
    isHighAlert: false,
    nclexPriorityRule:
      'Max 4,000 mg/24h (2,000 mg in hepatic impairment). Antidote is Acetylcysteine (Mucomyst). Monitor ALT/AST.',
    commonIndications: 'Mild-moderate pain, fever reduction.',
  },
  {
    usGeneric: 'Albuterol',
    phonetic: 'al-BYOO-ter-ol',
    intlEquivalents: ['Salbutamol', 'Ventolin', 'Asmol'],
    drugClass: 'Short-acting Beta-2 Agonist (SABA) Bronchodilator',
    isHighAlert: false,
    nclexPriorityRule:
      'Rescue inhaler for acute bronchospasm. Expected adverse effects: tachycardia, tremors, palpitations. Inhale bronchodilator BEFORE steroid.',
    commonIndications: 'Asthma exacerbation, COPD bronchospasm.',
  },
  {
    usGeneric: 'Epinephrine',
    phonetic: 'ep-ih-NEF-rin',
    intlEquivalents: ['Adrenaline', 'EpiPen', 'Adrenalin'],
    drugClass: 'Non-selective Adrenergic Agonist / Sympathomimetic',
    isHighAlert: true,
    nclexPriorityRule:
      'First-line drug for anaphylaxis given IM in the anterolateral mid-thigh. Repeat q5-15 min if symptoms persist.',
    commonIndications: 'Anaphylaxis, cardiac arrest, severe bronchospasm.',
  },
  {
    usGeneric: 'Norepinephrine',
    phonetic: 'nor-ep-ih-NEF-rin',
    intlEquivalents: ['Noradrenaline', 'Levophed'],
    drugClass: 'Vasopressor / Alpha-1 and Beta-1 Agonist',
    isHighAlert: true,
    nclexPriorityRule:
      'First-line vasopressor for septic shock refractory to fluid boluses. Target Mean Arterial Pressure (MAP) >=65 mmHg. Infuse via central line.',
    commonIndications: 'Septic shock, profound distributive hypotension.',
  },
  {
    usGeneric: 'Meperidine',
    phonetic: 'meh-PER-ih-deen',
    intlEquivalents: ['Pethidine', 'Demerol'],
    drugClass: 'Opioid Analgesic',
    isHighAlert: true,
    nclexPriorityRule:
      'Avoid in older adults and renal dysfunction. Toxic metabolite normeperidine accumulates, causing neurotoxicity and seizures.',
    commonIndications: 'Short-term acute procedural pain, rigors.',
  },
  {
    usGeneric: 'Furosemide',
    phonetic: 'fyoo-ROH-seh-myde',
    intlEquivalents: ['Frusemide', 'Lasix'],
    drugClass: 'Loop Diuretic',
    isHighAlert: false,
    nclexPriorityRule:
      'Risk of severe hypokalemia (normal K+ 3.5-5.0 mEq/L) and ototoxicity if pushed faster than 20 mg/min IV. Monitor BP and daily weight.',
    commonIndications: 'Heart failure fluid overload, acute pulmonary edema, renal edema.',
  },
  {
    usGeneric: 'Digoxin',
    phonetic: 'dih-JOX-in',
    intlEquivalents: ['Lanoxin'],
    drugClass: 'Cardiac Glycoside / Inotrope',
    isHighAlert: true,
    nclexPriorityRule:
      'Check apical pulse for 1 full minute; hold if HR <60 bpm. Therapeutic level 0.5-0.9 ng/mL. Hypokalemia increases digoxin toxicity (visual halos, nausea).',
    commonIndications: 'Heart failure, atrial fibrillation rate control.',
  },
  {
    usGeneric: 'Levothyroxine',
    phonetic: 'lee-voh-thy-ROX-een',
    intlEquivalents: ['Synthroid', 'Eltroxin', 'Thyroxine'],
    drugClass: 'Synthetic Thyroid Hormone (T4)',
    isHighAlert: false,
    nclexPriorityRule:
      'Take in morning on an empty stomach with a full glass of water 30-60 min before breakfast. Lifelong therapy; report palpitations/chest pain.',
    commonIndications: 'Hypothyroidism, myxedema coma.',
  },
  {
    usGeneric: 'Metoprolol',
    phonetic: 'meh-TOH-proh-lol',
    intlEquivalents: ['Lopressor', 'Toprol XL', 'Betaloc'],
    drugClass: 'Beta-1 Selective Adrenergic Blocker',
    isHighAlert: true,
    nclexPriorityRule:
      'Check HR and BP prior to giving. Hold if HR <60 bpm or systolic BP <100 mmHg. Can mask hypoglycemic symptoms (except diaphoresis).',
    commonIndications: 'Hypertension, post-myocardial infarction, angina.',
  },
  {
    usGeneric: 'Lisinopril',
    phonetic: 'ly-SIN-oh-pril',
    intlEquivalents: ['Prinivil', 'Zestril', 'Carace'],
    drugClass: 'ACE Inhibitor',
    isHighAlert: false,
    nclexPriorityRule:
      'Adverse effects: Dry nagging cough (expected), Hyperkalemia, Angioedema (life-threatening emergency - airway edema). Teratogenic (Category X).',
    commonIndications: 'Hypertension, heart failure, post-MI.',
  },
  {
    usGeneric: 'Warfarin',
    phonetic: 'WAR-fer-in',
    intlEquivalents: ['Coumadin', 'Jantoven', 'Marevan'],
    drugClass: 'Vitamin K Antagonist Anticoagulant',
    isHighAlert: true,
    nclexPriorityRule:
      'Target INR 2.0-3.0 (2.5-3.5 for mechanical heart valves). Antidote: Vitamin K (Phytonadione). Maintain consistent dietary Vitamin K intake.',
    commonIndications: 'DVT/PE prophylaxis and treatment, atrial fibrillation.',
  },
  {
    usGeneric: 'Heparin',
    phonetic: 'HEP-uh-rin',
    intlEquivalents: ['Unfractionated Heparin (UFH)'],
    drugClass: 'Parenteral Anticoagulant',
    isHighAlert: true,
    nclexPriorityRule:
      'Monitor aPTT (therapeutic target: 1.5-2x baseline / 46-70 sec). Antidote: Protamine sulfate. Watch for Heparin-Induced Thrombocytopenia (HIT: >50% drop in platelets).',
    commonIndications: 'Acute coronary syndrome, DVT/PE treatment and prophylaxis.',
  },
  {
    usGeneric: 'Vancomycin',
    phonetic: 'van-koh-MY-sin',
    intlEquivalents: ['Vancocin'],
    drugClass: 'Glycopeptide Antibacterial',
    isHighAlert: true,
    nclexPriorityRule:
      'Infuse over minimum 60 min (>=10 mg/min) to prevent Red Man Syndrome. Monitor trough levels (10-20 mcg/mL), BUN, creatinine, and hearing (ototoxicity).',
    commonIndications: 'MRSA bacteremia, severe Clostridioides difficile colitis (oral).',
  },
  {
    usGeneric: 'Naloxone',
    phonetic: 'nuh-LOX-ohn',
    intlEquivalents: ['Narcan'],
    drugClass: 'Opioid Antagonist',
    isHighAlert: false,
    nclexPriorityRule:
      'Rapidly reverses opioid respiratory depression (RR <8-10). Half-life is shorter than most opioids (re-sedation common); repeat doses often needed.',
    commonIndications: 'Opioid overdose, post-op opioid-induced respiratory depression.',
  },
  {
    usGeneric: 'Spironolactone',
    phonetic: 'speer-on-oh-LAK-tone',
    intlEquivalents: ['Aldactone', 'Spiroctan'],
    drugClass: 'Potassium-Sparing Diuretic / Aldosterone Antagonist',
    isHighAlert: false,
    nclexPriorityRule:
      'Risk of hyperkalemia. Avoid potassium supplements and salt substitutes containing potassium chloride. Caution when combined with ACE inhibitors.',
    commonIndications: 'Heart failure, cirrhosis ascites, hypertension.',
  },
  {
    usGeneric: 'Hydrochlorothiazide',
    phonetic: 'hy-droh-klor-oh-THY-uh-zide',
    intlEquivalents: ['HCTZ', 'Microzide', 'Dichlotride', 'Esidrex'],
    drugClass: 'Thiazide Diuretic',
    isHighAlert: false,
    nclexPriorityRule:
      'Wastes potassium and sodium. Can cause hyperuricemia (gout flare-up) and hyperglycemia. Sulfa cross-sensitivity precaution.',
    commonIndications: 'Essential hypertension, mild peripheral edema.',
  },
  {
    usGeneric: 'Morphine',
    phonetic: 'MOR-feen',
    intlEquivalents: ['MS Contin', 'Oramorph', 'Sevredol'],
    drugClass: 'Opioid Agonist',
    isHighAlert: true,
    nclexPriorityRule:
      'Hold if respiratory rate <12 breaths/min. Constipation is a universal side effect — always co-prescribe a bowel regimen (stool softener + stimulant).',
    commonIndications: 'Severe acute and chronic pain, end-of-life dyspnea.',
  },
  {
    usGeneric: 'Regular Insulin',
    phonetic: 'IN-suh-lin',
    intlEquivalents: ['Humulin R', 'Novolin R', 'Actrapid'],
    drugClass: 'Short-acting Insulin',
    isHighAlert: true,
    nclexPriorityRule:
      'ONLY insulin that can be administered intravenously (IV). Peak effect 2-4 hours (highest risk of hypoglycemia). Check bedside blood glucose.',
    commonIndications: 'Diabetic ketoacidosis (DKA), hyperkalemia (shifts K+ into cells), sliding scale.',
  },
  {
    usGeneric: 'Potassium Chloride',
    phonetic: 'poh-TASS-ee-um KLOR-ide',
    intlEquivalents: ['KCl', 'K-Dur', 'Slow-K', 'Micro-K'],
    drugClass: 'Electrolyte Supplement',
    isHighAlert: true,
    nclexPriorityRule:
      'NEVER administer via IV Push / Bolus (causes fatal cardiac arrest). Max peripheral IV rate 10 mEq/hr via infusion pump. Assess renal function first.',
    commonIndications: 'Treatment and prevention of hypokalemia.',
  },
  {
    usGeneric: 'Lithium',
    phonetic: 'LITH-ee-um',
    intlEquivalents: ['Lithobid', 'Camcolit', 'Priadel'],
    drugClass: 'Mood Stabilizer',
    isHighAlert: true,
    nclexPriorityRule:
      'Narrow therapeutic range: 0.6-1.2 mEq/L. Toxic at >1.5 mEq/L (coarse tremors, ataxia, confusion). Low sodium levels or dehydration precipitate toxicity.',
    commonIndications: 'Bipolar affective disorder mania maintenance.',
  },
  {
    usGeneric: 'Rifampin',
    phonetic: 'rif-AM-pin',
    intlEquivalents: ['Rifampicin', 'Rifadin'],
    drugClass: 'Antitubercular / Rifamycin',
    isHighAlert: false,
    nclexPriorityRule:
      'Causes red-orange discoloration of urine, tears, sweat, and saliva (normal/expected; stains contact lenses). Reduces efficacy of oral contraceptives.',
    commonIndications: 'Active and latent Tuberculosis (TB).',
  },
  {
    usGeneric: 'Phenytoin',
    phonetic: 'FEN-ih-toyn',
    intlEquivalents: ['Dilantin', 'Epanutin'],
    drugClass: 'Hydantoin Anticonvulsant',
    isHighAlert: true,
    nclexPriorityRule:
      'Therapeutic range: 10-20 mcg/mL. Early toxicity sign: horizontal nystagmus and ataxia. Good oral hygiene prevents gingival hyperplasia.',
    commonIndications: 'Tonic-clonic seizures, status epilepticus.',
  },
];

/**
 * Automatically scans a block of text (question stem, options, rationale)
 * and returns all matching IEN drug entries.
 */
export function detectMedicationsInText(text: string): IENDrugEntry[] {
  if (!text) return [];

  const lower = text.toLowerCase();
  const matched = new Map<string, IENDrugEntry>();

  for (const entry of IEN_DRUG_DATABASE) {
    // Check US Generic
    if (lower.includes(entry.usGeneric.toLowerCase())) {
      matched.set(entry.usGeneric, entry);
      continue;
    }

    // Check international aliases
    for (const alt of entry.intlEquivalents) {
      // Word boundary match to prevent false partial matches
      const regex = new RegExp(`\\b${alt.toLowerCase()}\\b`, 'i');
      if (regex.test(lower)) {
        matched.set(entry.usGeneric, entry);
        break;
      }
    }
  }

  return Array.from(matched.values());
}

/**
 * Searches the IEN Pharmacopeia by US generic or international brand/generic name.
 */
export function searchIENPharmacopeia(query: string): IENDrugEntry[] {
  const q = query.trim().toLowerCase();
  if (!q) return IEN_DRUG_DATABASE;

  return IEN_DRUG_DATABASE.filter((entry) => {
    if (entry.usGeneric.toLowerCase().includes(q)) return true;
    if (entry.drugClass.toLowerCase().includes(q)) return true;
    return entry.intlEquivalents.some((intl) => intl.toLowerCase().includes(q));
  });
}
