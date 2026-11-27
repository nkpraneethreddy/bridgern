/**
 * Smart CPR Paste Parser.
 *
 * Parses pasted text from an official Pearson VUE Candidate Performance Report (CPR) PDF.
 * Zero external dependencies — pure TypeScript regex-based extraction.
 *
 * Pearson VUE CPR format contains a table like:
 *   "Management of Care              Above the Passing Standard"
 *   "Pharmacological & Parenteral    Near the Passing Standard"
 *   "Physiological Adaptation        Below the Passing Standard"
 *
 * Also handles common OCR/copy-paste noise:
 *   - Extra whitespace, newlines, dashes
 *   - "Above Passing", "Below Passing", "Near Passing" short forms
 *   - Number of questions field: "The exam stopped at 85 questions"
 */

import type { CPRRating } from '../stores/retakeStore';

export interface CPRParseResult {
  success: boolean;
  questionsStoppedAt: number | null;
  ratings: Record<string, CPRRating>;
  unrecognizedLines: string[];
  confidence: 'high' | 'medium' | 'low';
}

/** Official NCLEX Client Needs category aliases as they appear in Pearson VUE CPRs */
const CATEGORY_ALIASES: Array<{ canonical: string; patterns: RegExp[] }> = [
  {
    canonical: 'Management of Care',
    patterns: [/management\s+of\s+care/i, /mgmt\s+of\s+care/i],
  },
  {
    canonical: 'Pharmacological & Parenteral Therapies',
    patterns: [/pharmacol/i, /parenteral/i, /pharm/i],
  },
  {
    canonical: 'Physiological Adaptation',
    patterns: [/physiolog/i, /physio\s+adapt/i],
  },
  {
    canonical: 'Safety & Infection Control',
    patterns: [/safety/i, /infection\s+control/i, /safety\s+&\s+infect/i],
  },
  {
    canonical: 'Reduction of Risk Potential',
    patterns: [/reduction\s+of\s+risk/i, /risk\s+potential/i],
  },
  {
    canonical: 'Basic Care & Comfort',
    patterns: [/basic\s+care/i, /comfort/i],
  },
  {
    canonical: 'Psychosocial Integrity',
    patterns: [/psychosocial/i, /psych\s+integ/i],
  },
  {
    canonical: 'Health Promotion & Maintenance',
    patterns: [/health\s+promot/i, /health\s+maint/i, /hp\s*&\s*m/i],
  },
];

/** Maps free-text performance labels to CPRRating enum */
function extractRating(line: string): CPRRating | null {
  const l = line.toLowerCase();
  if (/above\s+the\s+passing|above\s+passing|above\s+standard/.test(l)) {
    return 'above_passing';
  }
  if (/below\s+the\s+passing|below\s+passing|below\s+standard/.test(l)) {
    return 'below_passing';
  }
  if (/near\s+the\s+passing|near\s+passing|near\s+standard|at\s+the\s+passing/.test(l)) {
    return 'near_passing';
  }
  return null;
}

/** Finds which canonical category a line belongs to */
function matchCategory(line: string): string | null {
  for (const { canonical, patterns } of CATEGORY_ALIASES) {
    if (patterns.some((p) => p.test(line))) {
      return canonical;
    }
  }
  return null;
}

/** Extract number of questions stopped at from CPR header text */
function extractQuestionsStoppedAt(text: string): number | null {
  // "The exam stopped at 85 questions."
  // "Number of Items: 150"
  // "Items Administered: 115"
  const patterns = [
    /(?:stopped?\s+at|administered)\s*:?\s*(\d{2,3})/i,
    /number\s+of\s+items?\s*:?\s*(\d{2,3})/i,
    /total\s+(?:items?|questions?)\s*:?\s*(\d{2,3})/i,
    /exam\s+(?:ended|ended\s+at|stopped)\s+(?:at\s+)?question\s+(\d{2,3})/i,
    /(\d{2,3})\s+(?:items?|questions?)\s+(?:were?\s+)?(?:administered|given)/i,
  ];
  for (const p of patterns) {
    const m = text.match(p);
    if (m) {
      const n = parseInt(m[1], 10);
      if (n >= 70 && n <= 150) return n;
    }
  }
  return null;
}

/**
 * Main parse function. Accepts raw pasted text from a Pearson VUE CPR PDF.
 * Returns structured ratings for the 8 Client Needs categories.
 */
export function parseCPRText(rawText: string): CPRParseResult {
  const lines = rawText
    .split(/[\r\n]+/)
    .map((l) => l.trim())
    .filter((l) => l.length > 3);

  const ratings: Record<string, CPRRating> = {};
  const unrecognizedLines: string[] = [];

  const questionsStoppedAt = extractQuestionsStoppedAt(rawText);

  for (const line of lines) {
    const category = matchCategory(line);
    if (!category) {
      // Not a category line — might be header/footer noise
      if (!/candidate|report|pearson|nclex|vue|date|name|authorization|test\s+center/i.test(line)) {
        unrecognizedLines.push(line);
      }
      continue;
    }

    const rating = extractRating(line);
    if (rating) {
      ratings[category] = rating;
    } else {
      // Category found but no rating on same line — look at next line
      const idx = lines.indexOf(line);
      const nextLine = idx + 1 < lines.length ? lines[idx + 1] : '';
      const nextRating = extractRating(nextLine);
      if (nextRating) {
        ratings[category] = nextRating;
      }
    }
  }

  const foundCount = Object.keys(ratings).length;
  const confidence: 'high' | 'medium' | 'low' =
    foundCount >= 7 ? 'high' : foundCount >= 4 ? 'medium' : 'low';

  return {
    success: foundCount > 0,
    questionsStoppedAt,
    ratings,
    unrecognizedLines: unrecognizedLines.slice(0, 5),
    confidence,
  };
}
