/**
 * In-memory placeholder question pool for local development and testing.
 *
 * These 40 ORIGINAL questions are clearly marked as placeholders.
 * They are NOT real NCLEX questions and do NOT reproduce any
 * copyrighted content. They cover all 8 client-needs categories
 * (5 per category) and all 7 item types.
 *
 * In production, questions come from Supabase via fetchQuestions().
 */

import type { QuestionWithOptions } from './types';
import type { QuestionItemType, CognitiveLevel, QuestionScoringRule } from '../types/database';

let idCounter = 0;
function uid(): string {
  idCounter += 1;
  return `placeholder-${idCounter.toString().padStart(3, '0')}`;
}

function optionId(): string {
  idCounter += 1;
  return `opt-${idCounter.toString().padStart(4, '0')}`;
}

interface QDef {
  category: string;
  topic: string;
  itemType: QuestionItemType;
  difficulty: number;
  cognitiveLevel: CognitiveLevel;
  stem: string;
  rationale: string;
  scoringRule?: QuestionScoringRule;
  maxPoints?: number;
  clinicalData?: Record<string, unknown>;
  options: {
    key: string;
    label: string;
    explanation?: string;
    isCorrect: boolean;
    correctOrder?: number;
    metadata?: Record<string, unknown>;
  }[];
}

function buildQuestion(def: QDef): QuestionWithOptions {
  const qId = uid();
  return {
    id: qId,
    category_id: def.category,
    case_study_id: null,
    case_study_step: null,
    topic: def.topic,
    item_type: def.itemType,
    difficulty: def.difficulty,
    cognitive_level: def.cognitiveLevel,
    stem: def.stem,
    clinical_data: def.clinicalData ?? {},
    rationale: def.rationale,
    max_points: def.maxPoints ?? 1,
    scoring_rule: def.scoringRule ?? 'dichotomous',
    is_placeholder: true,
    status: 'published',
    author_id: null,
    reviewer_id: null,
    published_at: new Date().toISOString(),
    pack_version: 1,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    options: def.options.map((o, i) => ({
      id: optionId(),
      question_id: qId,
      option_key: o.key,
      label: o.label,
      explanation: o.explanation ?? null,
      is_correct: o.isCorrect,
      correct_order: o.correctOrder ?? null,
      metadata: o.metadata ?? {},
      sort_order: i,
      created_at: new Date().toISOString(),
    })),
  };
}

// ─── Category slugs ─────────────────────────────────────────────────
const CAT = {
  MGT: 'management-of-care',
  SAF: 'safety-infection-control',
  HP: 'health-promotion',
  PSY: 'psychosocial-integrity',
  BCC: 'basic-care-comfort',
  PHARM: 'pharmacological-therapies',
  RISK: 'reduction-of-risk',
  ADAPT: 'physiological-adaptation',
};

const QUESTIONS: QDef[] = [
  // ═══ Management of Care (5) ═══════════════════════════════════════
  {
    category: CAT.MGT,
    topic: 'Delegation',
    itemType: 'multiple_choice',
    difficulty: 2,
    cognitiveLevel: 'apply',
    stem: '[PLACEHOLDER] The registered nurse is assigning tasks to the nursing team. Which task can be delegated to an unlicensed assistive personnel (UAP)?',
    rationale: 'UAPs may perform routine, non-invasive tasks such as measuring intake and output. Assessment, teaching, and evaluation require RN judgment.',
    options: [
      { key: 'A', label: 'Measure and record the client\'s oral fluid intake', isCorrect: true, explanation: 'Measuring I&O is a routine task within UAP scope.' },
      { key: 'B', label: 'Assess a newly admitted client\'s pain level', isCorrect: false, explanation: 'Initial pain assessment requires RN clinical judgment.' },
      { key: 'C', label: 'Teach a client about a new medication', isCorrect: false, explanation: 'Patient education is an RN responsibility.' },
      { key: 'D', label: 'Evaluate the effectiveness of an intervention', isCorrect: false, explanation: 'Evaluation is a step of the nursing process reserved for the RN.' },
    ],
  },
  {
    category: CAT.MGT,
    topic: 'Informed consent',
    itemType: 'sata',
    difficulty: 3,
    cognitiveLevel: 'analyze',
    scoringRule: 'polytomous_plus_minus',
    maxPoints: 3,
    stem: '[PLACEHOLDER] Which elements must be included for a client\'s informed consent to be valid? (Select all that apply)',
    rationale: 'Valid informed consent requires the client to be competent, receive a clear explanation of the procedure, risks, benefits, and alternatives, and voluntarily agree.',
    options: [
      { key: 'A', label: 'Description of the proposed procedure', isCorrect: true, explanation: 'The client must know what will be done.' },
      { key: 'B', label: 'Potential risks and benefits', isCorrect: true, explanation: 'Risks and benefits are core informed consent elements.' },
      { key: 'C', label: 'Signature of the attending physician only', isCorrect: false, explanation: 'The client must sign; the physician witnesses.' },
      { key: 'D', label: 'Available alternatives', isCorrect: true, explanation: 'Alternatives allow the client to make a truly informed decision.' },
      { key: 'E', label: 'Guarantee of a successful outcome', isCorrect: false, explanation: 'No medical procedure can guarantee success.' },
    ],
  },
  {
    category: CAT.MGT,
    topic: 'Advance directives',
    itemType: 'multiple_choice',
    difficulty: 2,
    cognitiveLevel: 'remember_understand',
    stem: '[PLACEHOLDER] A client asks about a durable power of attorney for health care. Which response by the nurse is accurate?',
    rationale: 'A durable power of attorney designates a person to make health care decisions when the client is unable to do so.',
    options: [
      { key: 'A', label: 'It allows a designated person to make health care decisions on your behalf if you become incapacitated', isCorrect: true, explanation: 'This correctly describes the purpose of a durable power of attorney.' },
      { key: 'B', label: 'It is a document that lists your financial assets', isCorrect: false, explanation: 'Financial matters are covered by a separate legal document.' },
      { key: 'C', label: 'It automatically expires after one year', isCorrect: false, explanation: 'A durable power of attorney remains in effect until revoked.' },
      { key: 'D', label: 'It can only be created while in the hospital', isCorrect: false, explanation: 'It can be created at any time by a competent adult.' },
    ],
  },
  {
    category: CAT.MGT,
    topic: 'Priority setting',
    itemType: 'ordered_response',
    difficulty: 4,
    cognitiveLevel: 'analyze',
    maxPoints: 4,
    stem: '[PLACEHOLDER] The nurse receives report on four clients. Arrange the order in which the nurse should assess them (most urgent first).',
    rationale: 'Prioritize by airway, breathing, circulation. The client with acute respiratory distress requires immediate assessment, followed by the new chest pain, then the febrile client, then the stable post-op.',
    options: [
      { key: 'A', label: 'Client with acute respiratory distress and SpO2 of 84%', isCorrect: true, correctOrder: 1, explanation: 'Airway and breathing take top priority.' },
      { key: 'B', label: 'Client reporting new-onset substernal chest pain', isCorrect: true, correctOrder: 2, explanation: 'Circulation concern is second priority.' },
      { key: 'C', label: 'Client with a temperature of 38.9°C awaiting blood culture results', isCorrect: true, correctOrder: 3, explanation: 'Febrile but currently stable; monitor closely.' },
      { key: 'D', label: 'Post-operative client requesting pain medication, rated 4/10', isCorrect: true, correctOrder: 4, explanation: 'Pain management is important but not life-threatening.' },
    ],
  },
  {
    category: CAT.MGT,
    topic: 'Ethical practice',
    itemType: 'multiple_choice',
    difficulty: 3,
    cognitiveLevel: 'evaluate_create',
    stem: '[PLACEHOLDER] A nurse discovers that a colleague administered a medication without scanning the barcode. What is the most appropriate initial action?',
    rationale: 'The nurse should first address the safety concern directly with the colleague, following the chain of command if the behavior is not corrected.',
    options: [
      { key: 'A', label: 'Speak privately with the colleague about the safety concern', isCorrect: true, explanation: 'Direct, private communication is the first step in resolving peer concerns.' },
      { key: 'B', label: 'File an anonymous incident report immediately', isCorrect: false, explanation: 'An incident report may follow but direct communication comes first.' },
      { key: 'C', label: 'Ignore it because it did not cause harm', isCorrect: false, explanation: 'Bypassing safety checks is never acceptable to ignore.' },
      { key: 'D', label: 'Report the colleague to the board of nursing', isCorrect: false, explanation: 'The board is a last resort after internal resolution fails.' },
    ],
  },

  // ═══ Safety & Infection Control (5) ═══════════════════════════════
  {
    category: CAT.SAF,
    topic: 'Standard precautions',
    itemType: 'sata',
    difficulty: 2,
    cognitiveLevel: 'apply',
    scoringRule: 'dichotomous',
    stem: '[PLACEHOLDER] Which actions follow standard precautions? (Select all that apply)',
    rationale: 'Standard precautions include hand hygiene, gloves for body fluid contact, and proper sharps disposal. Sterile gloves and N95 masks are for specific situations, not standard precautions.',
    options: [
      { key: 'A', label: 'Perform hand hygiene before and after client contact', isCorrect: true, explanation: 'Hand hygiene is the foundation of standard precautions.' },
      { key: 'B', label: 'Wear gloves when contact with body fluids is expected', isCorrect: true, explanation: 'Gloves protect against body fluid exposure.' },
      { key: 'C', label: 'Use sterile gloves for every client interaction', isCorrect: false, explanation: 'Sterile gloves are for sterile procedures, not routine care.' },
      { key: 'D', label: 'Dispose of used sharps in puncture-resistant containers', isCorrect: true, explanation: 'Sharps disposal prevents needlestick injuries.' },
      { key: 'E', label: 'Wear an N95 mask for every client encounter', isCorrect: false, explanation: 'N95 masks are for airborne precautions, not standard precautions.' },
    ],
  },
  {
    category: CAT.SAF,
    topic: 'Fall prevention',
    itemType: 'multiple_choice',
    difficulty: 2,
    cognitiveLevel: 'apply',
    stem: '[PLACEHOLDER] An 82-year-old client has a Morse Fall Score of 55. Which intervention should the nurse implement first?',
    rationale: 'A score of 55 indicates high fall risk. Non-slip footwear is a simple, immediate intervention that reduces risk while other measures are arranged.',
    options: [
      { key: 'A', label: 'Ensure the client wears non-slip footwear', isCorrect: true, explanation: 'Non-slip footwear is an immediate, low-barrier intervention.' },
      { key: 'B', label: 'Apply bilateral wrist restraints', isCorrect: false, explanation: 'Restraints are a last resort and require a provider order.' },
      { key: 'C', label: 'Request a physical therapy consult for next week', isCorrect: false, explanation: 'PT consult is valuable but not an immediate fall-prevention measure.' },
      { key: 'D', label: 'Administer a sedative to keep the client in bed', isCorrect: false, explanation: 'Sedation increases fall and injury risk.' },
    ],
  },
  {
    category: CAT.SAF,
    topic: 'Fire safety',
    itemType: 'ordered_response',
    difficulty: 2,
    cognitiveLevel: 'remember_understand',
    maxPoints: 4,
    stem: '[PLACEHOLDER] Arrange the RACE fire response steps in the correct order.',
    rationale: 'RACE: Rescue clients in immediate danger, Activate the alarm, Contain the fire by closing doors, Extinguish or Evacuate.',
    options: [
      { key: 'R', label: 'Rescue clients in immediate danger', isCorrect: true, correctOrder: 1, explanation: 'Life safety is the first priority.' },
      { key: 'A', label: 'Activate the fire alarm', isCorrect: true, correctOrder: 2, explanation: 'Alerting others enables a coordinated response.' },
      { key: 'C', label: 'Contain the fire by closing doors', isCorrect: true, correctOrder: 3, explanation: 'Containment limits smoke and flame spread.' },
      { key: 'E', label: 'Extinguish or evacuate', isCorrect: true, correctOrder: 4, explanation: 'Extinguish small fires or evacuate if too large.' },
    ],
  },
  {
    category: CAT.SAF,
    topic: 'Surgical site infection',
    itemType: 'multiple_choice',
    difficulty: 3,
    cognitiveLevel: 'analyze',
    stem: '[PLACEHOLDER] Twelve hours after abdominal surgery, the nurse notes purulent drainage from the incision site. Which finding should the nurse assess next?',
    rationale: 'Purulent drainage suggests infection. Assessing for systemic signs (temperature) helps confirm the clinical picture and guides further intervention.',
    options: [
      { key: 'A', label: 'The client\'s temperature trend over the past 8 hours', isCorrect: true, explanation: 'Temperature trend reveals systemic infection response.' },
      { key: 'B', label: 'The client\'s dietary preferences', isCorrect: false, explanation: 'Diet is not immediately relevant to infection assessment.' },
      { key: 'C', label: 'The client\'s admission weight', isCorrect: false, explanation: 'Admission weight does not guide infection management.' },
      { key: 'D', label: 'The client\'s insurance status', isCorrect: false, explanation: 'Insurance status is irrelevant to clinical assessment.' },
    ],
  },
  {
    category: CAT.SAF,
    topic: 'Isolation precautions',
    itemType: 'hot_spot',
    difficulty: 3,
    cognitiveLevel: 'apply',
    stem: '[PLACEHOLDER] A client is admitted with active pulmonary tuberculosis. Select the area of the hospital that provides the appropriate room environment.',
    rationale: 'Active TB requires airborne precautions: a negative-pressure airborne infection isolation room (AIIR).',
    options: [
      { key: 'A', label: 'Negative-pressure isolation room', isCorrect: true, explanation: 'Negative pressure prevents airborne pathogen spread.' },
      { key: 'B', label: 'Standard semi-private room', isCorrect: false, explanation: 'A shared room risks TB transmission to the roommate.' },
      { key: 'C', label: 'Positive-pressure room', isCorrect: false, explanation: 'Positive pressure is for immunocompromised clients, not TB.' },
      { key: 'D', label: 'General medical unit hallway bed', isCorrect: false, explanation: 'Hallway placement provides no infection containment.' },
    ],
  },

  // ═══ Health Promotion & Maintenance (5) ════════════════════════════
  {
    category: CAT.HP,
    topic: 'Immunization schedule',
    itemType: 'multiple_choice',
    difficulty: 2,
    cognitiveLevel: 'remember_understand',
    stem: '[PLACEHOLDER] At the 2-month well-baby visit, which combination of vaccines does the nurse expect to administer per the standard schedule?',
    rationale: 'The 2-month visit typically includes DTaP, IPV, Hib, PCV13, RV, and HepB (second dose).',
    options: [
      { key: 'A', label: 'DTaP, IPV, Hib, PCV13, Rotavirus, Hepatitis B', isCorrect: true, explanation: 'This matches the CDC-recommended 2-month schedule.' },
      { key: 'B', label: 'MMR, Varicella, Hepatitis A', isCorrect: false, explanation: 'These are given at 12 months or later.' },
      { key: 'C', label: 'Tdap and HPV only', isCorrect: false, explanation: 'Tdap and HPV are adolescent vaccines.' },
      { key: 'D', label: 'Influenza and pneumococcal only', isCorrect: false, explanation: 'Influenza is given at 6 months; pneumococcal alone is incomplete.' },
    ],
  },
  {
    category: CAT.HP,
    topic: 'Prenatal screening',
    itemType: 'multiple_choice',
    difficulty: 3,
    cognitiveLevel: 'apply',
    stem: '[PLACEHOLDER] A pregnant client at 28 weeks gestation asks about the glucose screening test. Which response by the nurse is accurate?',
    rationale: 'The 1-hour glucose challenge test is a screening tool for gestational diabetes, typically performed between 24 and 28 weeks.',
    options: [
      { key: 'A', label: 'You will drink a glucose solution and have your blood drawn one hour later to screen for gestational diabetes', isCorrect: true, explanation: 'This accurately describes the 1-hour GCT procedure.' },
      { key: 'B', label: 'You must fast for 24 hours before the test', isCorrect: false, explanation: 'The 1-hour GCT does not require fasting.' },
      { key: 'C', label: 'The test diagnoses type 2 diabetes', isCorrect: false, explanation: 'GCT screens for gestational diabetes; further testing is needed for diagnosis.' },
      { key: 'D', label: 'The test is optional and rarely performed', isCorrect: false, explanation: 'GDM screening is a standard part of prenatal care.' },
    ],
  },
  {
    category: CAT.HP,
    topic: 'Cancer screening',
    itemType: 'sata',
    difficulty: 2,
    cognitiveLevel: 'apply',
    scoringRule: 'dichotomous',
    stem: '[PLACEHOLDER] Which cancer screening recommendations are appropriate for a healthy 50-year-old client? (Select all that apply)',
    rationale: 'At age 50, standard recommendations include colonoscopy (or alternative), annual low-dose CT if a heavy smoker, and continued cervical screening for eligible individuals.',
    options: [
      { key: 'A', label: 'Colonoscopy or approved alternative for colorectal cancer', isCorrect: true, explanation: 'Colorectal screening begins at age 45–50.' },
      { key: 'B', label: 'Annual low-dose CT scan if a heavy smoker', isCorrect: true, explanation: 'Lung cancer screening is recommended for high-risk smokers.' },
      { key: 'C', label: 'Monthly self-administered MRI', isCorrect: false, explanation: 'Self-administered MRI does not exist as a screening modality.' },
      { key: 'D', label: 'Cervical cancer screening if eligible', isCorrect: true, explanation: 'Cervical screening continues through age 65 for those with a cervix.' },
    ],
  },
  {
    category: CAT.HP,
    topic: 'Newborn assessment',
    itemType: 'matrix',
    difficulty: 3,
    cognitiveLevel: 'analyze',
    scoringRule: 'polytomous_zero_one',
    maxPoints: 3,
    clinicalData: { columns: ['Normal', 'Abnormal'] },
    stem: '[PLACEHOLDER] For each newborn finding, indicate whether it is a normal or abnormal assessment finding.',
    rationale: 'Acrocyanosis and a soft fontanelle are normal in neonates. Persistent central cyanosis suggests a cardiac or respiratory problem.',
    options: [
      { key: 'R1', label: 'Acrocyanosis in the first 24 hours', isCorrect: true, metadata: { correct_column: 'Normal' }, explanation: 'Blue hands and feet are common in the first 24–48 hours.' },
      { key: 'R2', label: 'Soft, flat anterior fontanelle', isCorrect: true, metadata: { correct_column: 'Normal' }, explanation: 'A soft fontanelle is expected in a well-hydrated newborn.' },
      { key: 'R3', label: 'Persistent central cyanosis at 2 hours of age', isCorrect: true, metadata: { correct_column: 'Abnormal' }, explanation: 'Central cyanosis beyond transition requires evaluation.' },
    ],
  },
  {
    category: CAT.HP,
    topic: 'Aging changes',
    itemType: 'multiple_choice',
    difficulty: 1,
    cognitiveLevel: 'remember_understand',
    stem: '[PLACEHOLDER] Which finding does the nurse recognize as a normal change associated with aging?',
    rationale: 'Decreased skin turgor and elasticity is an expected age-related change. The other options describe pathological conditions.',
    options: [
      { key: 'A', label: 'Decreased skin turgor and elasticity', isCorrect: true, explanation: 'Loss of collagen and elastin is a normal aging process.' },
      { key: 'B', label: 'Sudden onset of confusion', isCorrect: false, explanation: 'Acute confusion (delirium) is always abnormal and requires evaluation.' },
      { key: 'C', label: 'Blood pressure of 180/110 mmHg', isCorrect: false, explanation: 'This is hypertensive crisis, not normal aging.' },
      { key: 'D', label: 'Urinary incontinence requiring a catheter', isCorrect: false, explanation: 'Incontinence requiring catheterization is not a normal aging change.' },
    ],
  },

  // ═══ Psychosocial Integrity (5) ═══════════════════════════════════
  {
    category: CAT.PSY,
    topic: 'Therapeutic communication',
    itemType: 'multiple_choice',
    difficulty: 2,
    cognitiveLevel: 'apply',
    stem: '[PLACEHOLDER] A client says, "I feel like nobody understands what I\'m going through." Which response by the nurse uses therapeutic communication?',
    rationale: 'Reflecting the client\'s feelings encourages exploration and shows empathy without offering false reassurance.',
    options: [
      { key: 'A', label: '"It sounds like you\'re feeling isolated. Can you tell me more about that?"', isCorrect: true, explanation: 'Reflection validates feelings and invites further expression.' },
      { key: 'B', label: '"Don\'t worry, everything will be fine"', isCorrect: false, explanation: 'False reassurance dismisses the client\'s feelings.' },
      { key: 'C', label: '"You should talk to your family about this"', isCorrect: false, explanation: 'Giving advice is non-therapeutic and may not be appropriate.' },
      { key: 'D', label: '"I understand exactly how you feel"', isCorrect: false, explanation: 'Claiming to understand perfectly is presumptuous and non-therapeutic.' },
    ],
  },
  {
    category: CAT.PSY,
    topic: 'Crisis intervention',
    itemType: 'ordered_response',
    difficulty: 4,
    cognitiveLevel: 'analyze',
    maxPoints: 4,
    stem: '[PLACEHOLDER] A client in the emergency department is in acute psychological crisis. Arrange the nursing actions in priority order.',
    rationale: 'First ensure safety, then assess the situation, provide support, and finally connect with ongoing resources.',
    options: [
      { key: 'A', label: 'Ensure the client and environment are safe', isCorrect: true, correctOrder: 1, explanation: 'Safety is always the first priority in crisis intervention.' },
      { key: 'B', label: 'Assess the client\'s perception of the crisis', isCorrect: true, correctOrder: 2, explanation: 'Understanding the client\'s perspective guides intervention.' },
      { key: 'C', label: 'Provide emotional support and active listening', isCorrect: true, correctOrder: 3, explanation: 'Emotional support helps de-escalate the crisis.' },
      { key: 'D', label: 'Connect the client with community resources and follow-up', isCorrect: true, correctOrder: 4, explanation: 'Ongoing support prevents recurrence.' },
    ],
  },
  {
    category: CAT.PSY,
    topic: 'Grief and loss',
    itemType: 'multiple_choice',
    difficulty: 2,
    cognitiveLevel: 'apply',
    stem: '[PLACEHOLDER] A client whose spouse died two weeks ago states, "I keep expecting to hear the door open when my spouse comes home." Which stage of grief does this represent?',
    rationale: 'Expecting the deceased to return is characteristic of denial, the first stage in many grief models.',
    options: [
      { key: 'A', label: 'Denial', isCorrect: true, explanation: 'Denial involves difficulty accepting the reality of loss.' },
      { key: 'B', label: 'Anger', isCorrect: false, explanation: 'Anger involves frustration at the loss, not expectation of return.' },
      { key: 'C', label: 'Bargaining', isCorrect: false, explanation: 'Bargaining involves "what if" thinking, not expecting the person to return.' },
      { key: 'D', label: 'Acceptance', isCorrect: false, explanation: 'Acceptance acknowledges the finality of the loss.' },
    ],
  },
  {
    category: CAT.PSY,
    topic: 'Substance use assessment',
    itemType: 'multiple_choice',
    difficulty: 3,
    cognitiveLevel: 'analyze',
    stem: '[PLACEHOLDER] A client admitted for alcohol withdrawal has a CIWA-Ar score of 22. Which action should the nurse take?',
    rationale: 'A CIWA-Ar score > 20 indicates severe withdrawal requiring pharmacological intervention with benzodiazepines to prevent seizures and delirium tremens.',
    options: [
      { key: 'A', label: 'Administer the prescribed benzodiazepine and reassess in 1 hour', isCorrect: true, explanation: 'Severe withdrawal requires benzodiazepine administration per protocol.' },
      { key: 'B', label: 'Offer the client a glass of water and continue monitoring', isCorrect: false, explanation: 'Hydration alone is insufficient for severe withdrawal.' },
      { key: 'C', label: 'Discharge the client with a referral to outpatient counseling', isCorrect: false, explanation: 'Active severe withdrawal requires inpatient management.' },
      { key: 'D', label: 'Apply physical restraints', isCorrect: false, explanation: 'Restraints do not treat withdrawal and may worsen agitation.' },
    ],
  },
  {
    category: CAT.PSY,
    topic: 'Cultural sensitivity',
    itemType: 'multiple_choice',
    difficulty: 2,
    cognitiveLevel: 'apply',
    stem: '[PLACEHOLDER] A client from a culture unfamiliar to the nurse declines a treatment the nurse considers routine. What is the most appropriate response?',
    rationale: 'Asking the client about their beliefs and concerns shows cultural humility and respects autonomy.',
    options: [
      { key: 'A', label: '"Can you help me understand your concerns about this treatment?"', isCorrect: true, explanation: 'Exploring the client\'s perspective demonstrates cultural humility.' },
      { key: 'B', label: '"You need to trust us — we know what\'s best"', isCorrect: false, explanation: 'This is paternalistic and ignores the client\'s autonomy.' },
      { key: 'C', label: '"I\'ll document that you are non-compliant"', isCorrect: false, explanation: 'Labeling a client non-compliant is judgmental and unhelpful.' },
      { key: 'D', label: '"Let me call your family to convince you"', isCorrect: false, explanation: 'This overrides the client\'s right to make their own decisions.' },
    ],
  },

  // ═══ Basic Care & Comfort (5) ═════════════════════════════════════
  {
    category: CAT.BCC,
    topic: 'Pain management',
    itemType: 'multiple_choice',
    difficulty: 2,
    cognitiveLevel: 'apply',
    stem: '[PLACEHOLDER] A client rates their pain as 7/10 one hour after receiving oral analgesic. What should the nurse do next?',
    rationale: 'A pain level of 7/10 after medication suggests the current regimen is inadequate. Reassessing and notifying the provider for possible adjustment is appropriate.',
    options: [
      { key: 'A', label: 'Reassess and notify the provider that the current analgesic is not achieving adequate pain relief', isCorrect: true, explanation: 'Advocating for pain management adjustment is a nursing responsibility.' },
      { key: 'B', label: 'Tell the client to wait another hour', isCorrect: false, explanation: 'Pain of 7/10 warrants prompt action, not delay.' },
      { key: 'C', label: 'Document the pain level and take no further action', isCorrect: false, explanation: 'Documentation alone does not address inadequate pain management.' },
      { key: 'D', label: 'Administer a double dose without an order', isCorrect: false, explanation: 'Administering medication without an order is outside nursing scope.' },
    ],
  },
  {
    category: CAT.BCC,
    topic: 'Nutrition',
    itemType: 'sata',
    difficulty: 2,
    cognitiveLevel: 'apply',
    scoringRule: 'polytomous_plus_minus',
    maxPoints: 3,
    stem: '[PLACEHOLDER] Which dietary modifications are appropriate for a client with chronic kidney disease who is not on dialysis? (Select all that apply)',
    rationale: 'Pre-dialysis CKD management includes limiting sodium, potassium, and phosphorus. Adequate calories prevent malnutrition, and protein is modestly restricted.',
    options: [
      { key: 'A', label: 'Limit sodium intake', isCorrect: true, explanation: 'Sodium restriction helps manage fluid retention and blood pressure.' },
      { key: 'B', label: 'Restrict potassium-rich foods', isCorrect: true, explanation: 'Impaired kidneys cannot excrete excess potassium.' },
      { key: 'C', label: 'Encourage high-phosphorus foods', isCorrect: false, explanation: 'Phosphorus must be limited in CKD to protect bone health.' },
      { key: 'D', label: 'Provide adequate caloric intake to prevent malnutrition', isCorrect: true, explanation: 'Caloric needs must be met to prevent muscle wasting.' },
    ],
  },
  {
    category: CAT.BCC,
    topic: 'Mobility and positioning',
    itemType: 'multiple_choice',
    difficulty: 1,
    cognitiveLevel: 'remember_understand',
    stem: '[PLACEHOLDER] Which position should the nurse place a client in to facilitate breathing when the client reports shortness of breath?',
    rationale: 'High Fowler\'s position (head elevated 60-90°) allows maximum lung expansion by lowering the diaphragm.',
    options: [
      { key: 'A', label: 'High Fowler\'s position', isCorrect: true, explanation: 'Upright positioning maximizes diaphragmatic excursion.' },
      { key: 'B', label: 'Supine with legs elevated', isCorrect: false, explanation: 'This position can worsen dyspnea by increasing venous return to the lungs.' },
      { key: 'C', label: 'Prone position', isCorrect: false, explanation: 'Prone positioning is used in ARDS under supervision, not for general dyspnea.' },
      { key: 'D', label: 'Trendelenburg position', isCorrect: false, explanation: 'Head-down position increases respiratory distress.' },
    ],
  },
  {
    category: CAT.BCC,
    topic: 'Elimination',
    itemType: 'multiple_choice',
    difficulty: 2,
    cognitiveLevel: 'apply',
    stem: '[PLACEHOLDER] A client has not had a bowel movement in 4 days and reports abdominal discomfort. Which intervention should the nurse implement first?',
    rationale: 'Increasing fluid and fiber intake is the first-line, non-invasive intervention for constipation.',
    options: [
      { key: 'A', label: 'Encourage increased fluid and dietary fiber intake', isCorrect: true, explanation: 'Adequate hydration and fiber promote natural bowel function.' },
      { key: 'B', label: 'Administer an enema immediately', isCorrect: false, explanation: 'An enema is an invasive intervention; conservative measures come first.' },
      { key: 'C', label: 'Restrict all oral intake', isCorrect: false, explanation: 'NPO status would worsen constipation.' },
      { key: 'D', label: 'Request a surgical consult', isCorrect: false, explanation: 'Surgery is not indicated for uncomplicated constipation.' },
    ],
  },
  {
    category: CAT.BCC,
    topic: 'Sleep and rest',
    itemType: 'multiple_choice',
    difficulty: 1,
    cognitiveLevel: 'apply',
    stem: '[PLACEHOLDER] A hospitalized client reports difficulty sleeping. Which nursing action promotes rest?',
    rationale: 'Reducing unnecessary noise and clustering care activities minimizes sleep disruption and supports the circadian rhythm.',
    options: [
      { key: 'A', label: 'Cluster care activities and reduce nighttime noise', isCorrect: true, explanation: 'Minimizing disruptions supports natural sleep patterns.' },
      { key: 'B', label: 'Administer a caffeinated beverage at bedtime', isCorrect: false, explanation: 'Caffeine is a stimulant that impairs sleep onset.' },
      { key: 'C', label: 'Keep all room lights on throughout the night', isCorrect: false, explanation: 'Bright light suppresses melatonin and disrupts sleep.' },
      { key: 'D', label: 'Schedule vital signs every 30 minutes overnight', isCorrect: false, explanation: 'Frequent assessments disrupt sleep unless medically indicated.' },
    ],
  },

  // ═══ Pharmacological & Parenteral Therapies (5) ═══════════════════
  {
    category: CAT.PHARM,
    topic: 'Medication administration',
    itemType: 'multiple_choice',
    difficulty: 3,
    cognitiveLevel: 'apply',
    stem: '[PLACEHOLDER] The nurse is about to administer digoxin. The client\'s apical heart rate is 54 bpm. What is the priority nursing action?',
    rationale: 'Digoxin slows the heart rate. An apical pulse below 60 bpm is a contraindication; the nurse should hold the dose and notify the provider.',
    options: [
      { key: 'A', label: 'Hold the dose and notify the prescribing provider', isCorrect: true, explanation: 'Bradycardia below 60 bpm requires withholding digoxin.' },
      { key: 'B', label: 'Administer the medication as ordered', isCorrect: false, explanation: 'Giving digoxin with bradycardia risks life-threatening arrhythmia.' },
      { key: 'C', label: 'Crush the tablet and mix with food', isCorrect: false, explanation: 'The administration method does not address the safety concern.' },
      { key: 'D', label: 'Administer half the prescribed dose', isCorrect: false, explanation: 'Modifying doses without an order is outside nursing scope.' },
    ],
  },
  {
    category: CAT.PHARM,
    topic: 'IV therapy',
    itemType: 'multiple_choice',
    difficulty: 3,
    cognitiveLevel: 'analyze',
    stem: '[PLACEHOLDER] A client receiving IV vancomycin develops facial flushing, neck redness, and hypotension. What reaction is the nurse suspecting?',
    rationale: 'Facial and neck flushing (red man syndrome) during vancomycin infusion is a histamine-related reaction, usually from too-rapid infusion.',
    options: [
      { key: 'A', label: 'Red man syndrome from rapid infusion', isCorrect: true, explanation: 'Red man syndrome is a histamine reaction managed by slowing the infusion.' },
      { key: 'B', label: 'Anaphylaxis requiring epinephrine', isCorrect: false, explanation: 'Anaphylaxis involves bronchospasm and urticaria; this presentation is more specific to vancomycin.' },
      { key: 'C', label: 'Expected therapeutic response', isCorrect: false, explanation: 'Flushing and hypotension are adverse effects, not therapeutic responses.' },
      { key: 'D', label: 'Fluid overload', isCorrect: false, explanation: 'Fluid overload causes pulmonary symptoms, not isolated flushing.' },
    ],
  },
  {
    category: CAT.PHARM,
    topic: 'Dosage calculation',
    itemType: 'multiple_choice',
    difficulty: 4,
    cognitiveLevel: 'apply',
    stem: '[PLACEHOLDER] A child weighing 22 kg is prescribed amoxicillin 40 mg/kg/day in 3 divided doses. The available concentration is 250 mg/5 mL. How many mL should the nurse administer per dose?',
    rationale: 'Total daily dose = 22 × 40 = 880 mg. Per dose = 880 / 3 ≈ 293 mg. Volume = (293 / 250) × 5 ≈ 5.9 mL per dose.',
    options: [
      { key: 'A', label: '5.9 mL', isCorrect: true, explanation: '22 kg × 40 mg/kg = 880 mg/day ÷ 3 doses ≈ 293 mg per dose. (293/250) × 5 = 5.9 mL.' },
      { key: 'B', label: '3.5 mL', isCorrect: false, explanation: 'This calculation is incorrect.' },
      { key: 'C', label: '8.8 mL', isCorrect: false, explanation: 'This would be the daily dose volume, not per dose.' },
      { key: 'D', label: '11.0 mL', isCorrect: false, explanation: 'This calculation error likely omits dividing by 3 doses.' },
    ],
  },
  {
    category: CAT.PHARM,
    topic: 'Adverse drug effects',
    itemType: 'sata',
    difficulty: 3,
    cognitiveLevel: 'analyze',
    scoringRule: 'polytomous_plus_minus',
    maxPoints: 3,
    stem: '[PLACEHOLDER] Which findings indicate potential metformin toxicity? (Select all that apply)',
    rationale: 'Metformin toxicity can cause lactic acidosis, presenting with malaise, myalgia, and GI symptoms. Hyperglycemia is a sign of inadequate treatment, not toxicity.',
    options: [
      { key: 'A', label: 'Persistent nausea and vomiting', isCorrect: true, explanation: 'GI symptoms are early signs of metformin toxicity.' },
      { key: 'B', label: 'Muscle pain and weakness', isCorrect: true, explanation: 'Myalgia suggests lactic acidosis from metformin.' },
      { key: 'C', label: 'Blood glucose of 250 mg/dL', isCorrect: false, explanation: 'Hyperglycemia suggests inadequate dosing, not toxicity.' },
      { key: 'D', label: 'Rapid, deep breathing (Kussmaul respirations)', isCorrect: true, explanation: 'Kussmaul respirations compensate for metabolic acidosis.' },
    ],
  },
  {
    category: CAT.PHARM,
    topic: 'Blood products',
    itemType: 'ordered_response',
    difficulty: 3,
    cognitiveLevel: 'apply',
    maxPoints: 4,
    stem: '[PLACEHOLDER] Arrange the steps for blood product administration in the correct order.',
    rationale: 'Proper blood administration: verify the order and consent, check the product with two nurses at the bedside, obtain baseline vitals, then start the infusion slowly while monitoring.',
    options: [
      { key: 'A', label: 'Verify the provider order and informed consent', isCorrect: true, correctOrder: 1, explanation: 'Verification ensures the correct product and legal authorization.' },
      { key: 'B', label: 'Two nurses verify the blood product at the bedside', isCorrect: true, correctOrder: 2, explanation: 'Dual verification prevents transfusion errors.' },
      { key: 'C', label: 'Obtain baseline vital signs', isCorrect: true, correctOrder: 3, explanation: 'Baseline vitals allow detection of transfusion reactions.' },
      { key: 'D', label: 'Begin the infusion slowly and monitor for the first 15 minutes', isCorrect: true, correctOrder: 4, explanation: 'Slow initial infusion allows early detection of reactions.' },
    ],
  },

  // ═══ Reduction of Risk Potential (5) ══════════════════════════════
  {
    category: CAT.RISK,
    topic: 'Lab value interpretation',
    itemType: 'multiple_choice',
    difficulty: 3,
    cognitiveLevel: 'analyze',
    stem: '[PLACEHOLDER] A client\'s lab results show potassium of 6.2 mEq/L. Which finding should the nurse assess for first?',
    rationale: 'Hyperkalemia (K+ > 5.5) can cause life-threatening cardiac arrhythmias. Cardiac monitoring and ECG changes are the priority assessment.',
    options: [
      { key: 'A', label: 'ECG changes such as peaked T waves', isCorrect: true, explanation: 'Peaked T waves are the earliest ECG sign of hyperkalemia.' },
      { key: 'B', label: 'Peripheral edema in the lower extremities', isCorrect: false, explanation: 'Edema suggests fluid overload, not directly related to potassium.' },
      { key: 'C', label: 'Skin turgor on the sternum', isCorrect: false, explanation: 'Skin turgor assesses hydration, not potassium status.' },
      { key: 'D', label: 'Capillary refill time', isCorrect: false, explanation: 'Capillary refill assesses peripheral perfusion, not hyperkalemia.' },
    ],
  },
  {
    category: CAT.RISK,
    topic: 'Pre-operative care',
    itemType: 'sata',
    difficulty: 2,
    cognitiveLevel: 'apply',
    scoringRule: 'dichotomous',
    stem: '[PLACEHOLDER] Which actions should the nurse perform before the client goes to the operating room? (Select all that apply)',
    rationale: 'Pre-operative checklist includes verifying identity, confirming consent, ensuring NPO status, and removing personal items. Administering unlabeled medications is never acceptable.',
    options: [
      { key: 'A', label: 'Verify the client\'s identity using two identifiers', isCorrect: true, explanation: 'Positive identification prevents wrong-patient procedures.' },
      { key: 'B', label: 'Confirm the signed surgical consent is on the chart', isCorrect: true, explanation: 'Surgery cannot proceed without valid consent.' },
      { key: 'C', label: 'Administer any unlabeled medication found at the bedside', isCorrect: false, explanation: 'Unlabeled medications must never be administered.' },
      { key: 'D', label: 'Ensure the client has maintained NPO status as ordered', isCorrect: true, explanation: 'NPO status reduces aspiration risk during anesthesia.' },
      { key: 'E', label: 'Ask the client to remove jewelry and dentures', isCorrect: true, explanation: 'Personal items can interfere with surgical equipment and cause injury.' },
    ],
  },
  {
    category: CAT.RISK,
    topic: 'Vital sign trends',
    itemType: 'multiple_choice',
    difficulty: 4,
    cognitiveLevel: 'analyze',
    stem: '[PLACEHOLDER] A post-surgical client\'s vital signs show: HR increasing from 78 to 112, BP decreasing from 128/78 to 94/60, urine output 15 mL/hr. What complication does the nurse suspect?',
    rationale: 'Rising heart rate, falling blood pressure, and decreased urine output are classic signs of hypovolemic shock, likely from post-operative hemorrhage.',
    options: [
      { key: 'A', label: 'Hypovolemic shock from post-operative hemorrhage', isCorrect: true, explanation: 'Tachycardia, hypotension, and oliguria form the classic hypovolemia triad.' },
      { key: 'B', label: 'Medication-induced drowsiness', isCorrect: false, explanation: 'Sedation does not cause tachycardia and significant hypotension together.' },
      { key: 'C', label: 'Normal post-anesthesia recovery', isCorrect: false, explanation: 'These changes are not part of normal recovery.' },
      { key: 'D', label: 'Urinary retention', isCorrect: false, explanation: 'Retention causes low output but not the cardiovascular changes.' },
    ],
  },
  {
    category: CAT.RISK,
    topic: 'Diagnostic procedures',
    itemType: 'multiple_choice',
    difficulty: 2,
    cognitiveLevel: 'apply',
    stem: '[PLACEHOLDER] A client is scheduled for a CT scan with IV contrast. Which question is most important for the nurse to ask?',
    rationale: 'Iodinated contrast can impair renal function. Assessing kidney function and allergies to iodine or contrast is essential before the procedure.',
    options: [
      { key: 'A', label: '"Do you have any history of kidney problems or allergy to iodine?"', isCorrect: true, explanation: 'Renal impairment and iodine allergy increase risk of contrast reactions.' },
      { key: 'B', label: '"What did you have for breakfast?"', isCorrect: false, explanation: 'Meal content is less critical than renal and allergy history.' },
      { key: 'C', label: '"What is your shoe size?"', isCorrect: false, explanation: 'Shoe size is irrelevant to CT contrast safety.' },
      { key: 'D', label: '"Do you prefer a warm or cold blanket?"', isCorrect: false, explanation: 'Comfort preferences are secondary to safety screening.' },
    ],
  },
  {
    category: CAT.RISK,
    topic: 'Tube management',
    itemType: 'multiple_choice',
    difficulty: 3,
    cognitiveLevel: 'apply',
    stem: '[PLACEHOLDER] A client with a nasogastric tube reports nausea and abdominal distension. Which action should the nurse take first?',
    rationale: 'Checking tube placement and patency ensures the NG tube is functioning properly before considering other interventions.',
    options: [
      { key: 'A', label: 'Verify the NG tube placement and check for patency', isCorrect: true, explanation: 'A displaced or clogged tube would cause these symptoms.' },
      { key: 'B', label: 'Remove the NG tube immediately', isCorrect: false, explanation: 'Removing the tube without assessment may worsen the problem.' },
      { key: 'C', label: 'Administer an antiemetic', isCorrect: false, explanation: 'Treating the symptom without addressing the cause is inappropriate.' },
      { key: 'D', label: 'Increase the IV fluid rate', isCorrect: false, explanation: 'More fluid could worsen distension if the tube is not draining.' },
    ],
  },

  // ═══ Physiological Adaptation (5) ═════════════════════════════════
  {
    category: CAT.ADAPT,
    topic: 'Fluid and electrolyte imbalance',
    itemType: 'multiple_choice',
    difficulty: 3,
    cognitiveLevel: 'analyze',
    stem: '[PLACEHOLDER] A client with congestive heart failure develops crackles in the lung bases, weight gain of 2 kg in 24 hours, and 3+ pitting edema. Which nursing action is the priority?',
    rationale: 'The signs indicate fluid volume excess. Elevating the head of bed and administering prescribed diuretics address both breathing and fluid overload.',
    options: [
      { key: 'A', label: 'Elevate the head of bed and administer the prescribed diuretic', isCorrect: true, explanation: 'Position and diuresis address both respiratory and fluid concerns.' },
      { key: 'B', label: 'Encourage increased oral fluid intake', isCorrect: false, explanation: 'More fluid would worsen overload.' },
      { key: 'C', label: 'Apply ice packs to the edematous areas', isCorrect: false, explanation: 'Ice does not treat systemic fluid overload.' },
      { key: 'D', label: 'Restrict protein intake', isCorrect: false, explanation: 'Protein restriction is not the priority intervention for acute fluid overload.' },
    ],
  },
  {
    category: CAT.ADAPT,
    topic: 'Respiratory emergencies',
    itemType: 'multiple_choice',
    difficulty: 4,
    cognitiveLevel: 'analyze',
    stem: '[PLACEHOLDER] A client with a chest tube suddenly reports increased dyspnea. The nurse notices the water seal chamber is not fluctuating and there is subcutaneous emphysema around the insertion site. What should the nurse do first?',
    rationale: 'Absent fluctuation with subcutaneous emphysema suggests a possible tube occlusion or disconnection. Checking all connections is the first action.',
    options: [
      { key: 'A', label: 'Check all chest tube connections for leaks or kinks', isCorrect: true, explanation: 'System integrity must be verified before further intervention.' },
      { key: 'B', label: 'Clamp the chest tube immediately', isCorrect: false, explanation: 'Clamping can cause tension pneumothorax if air cannot escape.' },
      { key: 'C', label: 'Remove the chest tube', isCorrect: false, explanation: 'Tube removal without provider order worsens the situation.' },
      { key: 'D', label: 'Lower the drainage system below the bed', isCorrect: false, explanation: 'While proper positioning matters, checking connections is the first step.' },
    ],
  },
  {
    category: CAT.ADAPT,
    topic: 'Diabetic emergencies',
    itemType: 'matrix',
    difficulty: 4,
    cognitiveLevel: 'analyze',
    scoringRule: 'polytomous_zero_one',
    maxPoints: 3,
    clinicalData: { columns: ['DKA', 'HHS'] },
    stem: '[PLACEHOLDER] For each clinical finding, indicate whether it is more characteristic of diabetic ketoacidosis (DKA) or hyperosmolar hyperglycemic state (HHS).',
    rationale: 'DKA features Kussmaul respirations and fruity breath (ketones). HHS presents with extreme hyperglycemia (often > 600 mg/dL) and altered mental status without significant ketosis.',
    options: [
      { key: 'R1', label: 'Kussmaul respirations with fruity breath odor', isCorrect: true, metadata: { correct_column: 'DKA' }, explanation: 'Deep rapid breathing compensates for metabolic acidosis; fruity odor is from ketones.' },
      { key: 'R2', label: 'Blood glucose > 600 mg/dL with minimal ketones', isCorrect: true, metadata: { correct_column: 'HHS' }, explanation: 'HHS features extreme hyperglycemia without significant ketosis.' },
      { key: 'R3', label: 'Gradual onset over days to weeks with severe dehydration', isCorrect: true, metadata: { correct_column: 'HHS' }, explanation: 'HHS develops slowly, often in older adults with type 2 diabetes.' },
    ],
  },
  {
    category: CAT.ADAPT,
    topic: 'Cardiac emergencies',
    itemType: 'multiple_choice',
    difficulty: 5,
    cognitiveLevel: 'evaluate_create',
    stem: '[PLACEHOLDER] A client on the telemetry unit suddenly becomes unresponsive. The monitor shows ventricular fibrillation. After calling for help, what is the nurse\'s immediate action?',
    rationale: 'Ventricular fibrillation is a shockable rhythm. Immediate defibrillation is the priority action to restore a viable rhythm.',
    options: [
      { key: 'A', label: 'Begin CPR and defibrillate as soon as the defibrillator is available', isCorrect: true, explanation: 'Early CPR and defibrillation are the keys to V-fib survival.' },
      { key: 'B', label: 'Administer IV amiodarone first', isCorrect: false, explanation: 'Defibrillation precedes antiarrhythmic medication in V-fib.' },
      { key: 'C', label: 'Obtain a 12-lead ECG', isCorrect: false, explanation: 'V-fib is already identified on the monitor; defibrillation is urgent.' },
      { key: 'D', label: 'Place the client in the recovery position', isCorrect: false, explanation: 'Recovery position is for unconscious breathing clients, not V-fib.' },
    ],
  },
  {
    category: CAT.ADAPT,
    topic: 'Shock management',
    itemType: 'bowtie',
    difficulty: 5,
    cognitiveLevel: 'evaluate_create',
    scoringRule: 'rationale_triad',
    maxPoints: 3,
    stem: '[PLACEHOLDER] A client presents with tachycardia, hypotension, and warm flushed skin after receiving IV penicillin. Complete the bowtie: identify the condition, select two priority nursing actions, and select two parameters to monitor.',
    rationale: 'The presentation (tachycardia, hypotension, flushing after penicillin) indicates anaphylactic shock. Priority actions are epinephrine and stopping the offending agent. Monitor BP and airway status.',
    options: [
      // Center (conditions)
      { key: 'C1', label: 'Anaphylactic shock', isCorrect: true, metadata: { bowtie_zone: 'center' }, explanation: 'Penicillin allergy with cardiovascular collapse = anaphylaxis.' },
      { key: 'C2', label: 'Cardiogenic shock', isCorrect: false, metadata: { bowtie_zone: 'center' }, explanation: 'Cardiogenic shock presents with cool, clammy skin, not flushing.' },
      { key: 'C3', label: 'Neurogenic shock', isCorrect: false, metadata: { bowtie_zone: 'center' }, explanation: 'Neurogenic shock follows spinal cord injury, not drug exposure.' },
      // Left (actions)
      { key: 'L1', label: 'Administer IM epinephrine per protocol', isCorrect: true, metadata: { bowtie_zone: 'left' }, explanation: 'Epinephrine is the first-line treatment for anaphylaxis.' },
      { key: 'L2', label: 'Stop the IV penicillin infusion immediately', isCorrect: true, metadata: { bowtie_zone: 'left' }, explanation: 'Removing the offending agent stops further allergen exposure.' },
      { key: 'L3', label: 'Administer oral acetaminophen', isCorrect: false, metadata: { bowtie_zone: 'left' }, explanation: 'Acetaminophen does not treat anaphylaxis.' },
      { key: 'L4', label: 'Apply a warm compress to the IV site', isCorrect: false, metadata: { bowtie_zone: 'left' }, explanation: 'A warm compress does not address the systemic reaction.' },
      // Right (parameters)
      { key: 'P1', label: 'Blood pressure and hemodynamic status', isCorrect: true, metadata: { bowtie_zone: 'right' }, explanation: 'BP monitoring tracks response to epinephrine.' },
      { key: 'P2', label: 'Airway patency and respiratory effort', isCorrect: true, metadata: { bowtie_zone: 'right' }, explanation: 'Laryngeal edema can compromise the airway in anaphylaxis.' },
      { key: 'P3', label: 'Serum cholesterol level', isCorrect: false, metadata: { bowtie_zone: 'right' }, explanation: 'Cholesterol is irrelevant to acute anaphylaxis management.' },
      { key: 'P4', label: 'Fasting blood glucose', isCorrect: false, metadata: { bowtie_zone: 'right' }, explanation: 'Blood glucose is not a priority parameter in anaphylaxis.' },
    ],
  },

  // ═══ NGN Clinical Case Studies with Full EHR Charts ════════════════
  {
    category: CAT.ADAPT,
    topic: 'Sepsis & Septic Shock Recognition',
    itemType: 'case_study',
    difficulty: 4,
    cognitiveLevel: 'recognize_cues',
    scoringRule: 'polytomous_plus_minus',
    maxPoints: 4,
    stem: 'The nurse reviews the Electronic Health Record (EHR). Which clinical findings indicate that the client is developing septic shock and require immediate intervention? Select all that apply.',
    rationale:
      'Lactic acid >4.0 mmol/L, mean arterial pressure (MAP) <65 mmHg (BP 84/52), tachypnea (RR 28), and tachycardia (HR 122) in the presence of suspected infection indicate septic shock with tissue hypoperfusion requiring immediate 30 mL/kg crystalloid resuscitation.',
    clinicalData: {
      sub_type: 'sata',
      patient: {
        name: 'Harold Vance',
        age: 72,
        gender: 'Male',
        mrn: 'MRN-849201',
        admissionDiagnosis: 'Community-Acquired Pneumonia / Sepsis',
        allergies: 'Penicillin (Urticaria/Hives)',
        codeStatus: 'Full Code',
      },
      nursesNotes: [
        {
          timestamp: '08:00',
          note: '72-year-old male admitted from ED with productive cough, purulent sputum, and fever. Alert and oriented x 3. Crackles auscultated in right lower lung field. Peripheral pulses +2 bilaterally.',
        },
        {
          timestamp: '09:30',
          note: 'Client is now restless and confused to date. Skin is cool and clammy with delayed capillary refill (4 seconds). Client reports feeling dizzy when head of bed is elevated.',
        },
      ],
      vitalSigns: [
        { timestamp: '08:00', bp: '118/76', hr: 88, rr: 18, spo2: '96%', temp: '38.6°C' },
        { timestamp: '09:30', bp: '84/52', hr: 122, rr: 28, spo2: '91%', temp: '39.1°C' },
      ],
      labs: [
        { test: 'Serum Lactate', value: '4.2 mmol/L', referenceRange: '0.5 - 2.0 mmol/L', flag: 'CRITICAL' },
        { test: 'White Blood Cell Count', value: '18,500 /mcL', referenceRange: '4,500 - 11,000 /mcL', flag: 'H' },
        { test: 'Platelets', value: '135,000 /mcL', referenceRange: '150,000 - 450,000 /mcL', flag: 'L' },
        { test: 'Serum Creatinine', value: '1.8 mg/dL', referenceRange: '0.7 - 1.3 mg/dL', flag: 'H' },
      ],
      orders: [
        { timestamp: '09:35', order: 'Blood cultures x 2 sites before antibiotic administration', status: 'STAT' },
        { timestamp: '09:35', order: '0.9% Normal Saline 30 mL/kg IV bolus over 60 minutes', status: 'STAT' },
        { timestamp: '09:40', order: 'IV Levofloxacin 750 mg daily (Penicillin allergy noted)', status: 'Active' },
      ],
    },
    options: [
      { key: 'A', label: 'Blood pressure 84/52 mmHg (MAP <65 mmHg)', isCorrect: true, explanation: 'Hypotension refractory to initial volume indicates septic shock hypoperfusion.' },
      { key: 'B', label: 'Serum lactate 4.2 mmol/L', isCorrect: true, explanation: 'Lactate >4.0 mmol/L reflects severe cellular hypoxia and anaerobic metabolism.' },
      { key: 'C', label: 'Heart rate 122 beats/min', isCorrect: true, explanation: 'Tachycardia is a compensatory response to hypovolemia and distributive shock.' },
      { key: 'D', label: 'New onset restlessness and confusion', isCorrect: true, explanation: 'Altered mental status is an ominous indicator of poor cerebral perfusion in sepsis.' },
      { key: 'E', label: 'Pupils equal and reactive to light', isCorrect: false, explanation: 'PERRLA is an expected normal neurological finding.' },
      { key: 'F', label: 'Productive cough with purulent sputum', isCorrect: false, explanation: 'While confirming pneumonia source, it does not specifically indicate hemodynamic shock.' },
    ],
  },
  {
    category: CAT.RISK,
    topic: 'Acute Pulmonary Edema Prioritization',
    itemType: 'case_study',
    difficulty: 3,
    cognitiveLevel: 'prioritize_hypotheses',
    scoringRule: 'dichotomous',
    maxPoints: 1,
    stem: 'The nurse examines the client chart. Which prescription should the nurse implement first?',
    rationale:
      'Airway and breathing take highest priority (ABC hierarchy). Oxygen 4 L via nasal cannula must be initiated first to relieve severe hypoxemia (SpO2 88% on room air) and dyspnea before administering IV diuretics or placing an indwelling catheter.',
    clinicalData: {
      sub_type: 'multiple_choice',
      patient: {
        name: 'Eleanor Chen',
        age: 68,
        gender: 'Female',
        mrn: 'MRN-391084',
        admissionDiagnosis: 'Heart Failure Exacerbation / Acute Pulmonary Edema',
        allergies: 'Sulfa Drugs (Rash)',
        codeStatus: 'Full Code',
      },
      nursesNotes: [
        {
          timestamp: '07:00',
          note: '68-year-old female presents with severe dyspnea, orthopnea requiring 3 pillows, and dry non-productive cough. Coarse crackles auscultated bilaterally up to mid-scapula. Jugular venous distention visible at 45 degrees.',
        },
      ],
      vitalSigns: [
        { timestamp: '07:05', bp: '168/96', hr: 104, rr: 26, spo2: '88%', temp: '36.9°C' },
      ],
      labs: [
        { test: 'B-type Natriuretic Peptide (BNP)', value: '1,450 pg/mL', referenceRange: '<100 pg/mL', flag: 'H' },
        { test: 'Potassium', value: '4.1 mEq/L', referenceRange: '3.5 - 5.0 mEq/L' },
        { test: 'Blood Urea Nitrogen (BUN)', value: '28 mg/dL', referenceRange: '10 - 20 mg/dL', flag: 'H' },
      ],
      orders: [
        { timestamp: '07:10', order: 'Oxygen at 4 L/min via nasal cannula to titrate SpO2 >=92%', status: 'STAT' },
        { timestamp: '07:10', order: 'Furosemide 40 mg IV push over 2 minutes', status: 'STAT' },
        { timestamp: '07:10', order: 'Insert indwelling urinary catheter to gravity for strict output', status: 'Active' },
        { timestamp: '07:10', order: 'Draw 12-lead ECG stat', status: 'Active' },
      ],
    },
    options: [
      { key: 'A', label: 'Administer Oxygen at 4 L/min via nasal cannula', isCorrect: true, explanation: 'Hypoxemia (SpO2 88%) is life-threatening; oxygen is the immediate ABC priority.' },
      { key: 'B', label: 'Administer Furosemide 40 mg IV push', isCorrect: false, explanation: 'Diuresis is critical for preload reduction but oxygenation must be addressed first.' },
      { key: 'C', label: 'Insert an indwelling urinary catheter', isCorrect: false, explanation: 'Urine output monitoring is secondary to resolving acute respiratory distress.' },
      { key: 'D', label: 'Obtain a 12-lead electrocardiogram (ECG)', isCorrect: false, explanation: 'ECG is an important diagnostic order but does not stabilize immediate hypoxemia.' },
    ],
  },
];

export function createPlaceholderPool(): QuestionWithOptions[] {
  idCounter = 0; // Reset for deterministic IDs in tests
  return QUESTIONS.map(buildQuestion);
}
