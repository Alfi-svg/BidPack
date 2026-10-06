import {
  Requirement,
  RequirementMatch,
  RequirementValidation,
  PackageReadiness,
  Language,
} from '../types/tender';

/**
 * Normalizes date to YYYY-MM-DD
 */
export function normalizeDate(dateStr: string): string {
  if (!dateStr) return '';
  const trimmed = dateStr.trim();
  if (trimmed.includes('T')) {
    return trimmed.split('T')[0];
  }
  return trimmed;
}

/**
 * Checks if expiry date is strictly before submission deadline
 */
export function isDateExpired(expiryStr: string, deadlineStr: string): boolean {
  const normExpiry = normalizeDate(expiryStr);
  const normDeadline = normalizeDate(deadlineStr);

  if (!normExpiry || !normDeadline) return false;

  // Compare as YYYY-MM-DD strings directly (valid ISO date format)
  return normExpiry < normDeadline;
}

/**
 * Validates a single requirement according to the Exact Status Engine.
 */
export function validateRequirement(
  req: Requirement,
  match: RequirementMatch | undefined,
  submissionDeadline: string,
  _lang: Language = 'en'
): RequirementValidation {
  const fileMatched = Boolean(match?.fileId);
  const expiryDate = match?.expiryDate ? match.expiryDate.trim() : '';

  // Case 1: No file matched
  if (!fileMatched) {
    if (req.mandatory) {
      return {
        status: 'missing',
        isBlocking: true,
        reasonEn: `Mandatory document "${req.title_en}" is missing.`,
        reasonBn: `বাধ্যতামূলক নথি "${req.title_bn}" অনুপস্থিত।`,
      };
    } else {
      return {
        status: 'not_provided',
        isBlocking: false,
        reasonEn: `Optional document "${req.title_en}" not provided.`,
        reasonBn: `ঐচ্ছিক নথি "${req.title_bn}" প্রদান করা হয়নি।`,
      };
    }
  }

  // Case 2: File matched
  if (req.has_expiry) {
    if (!expiryDate) {
      return {
        status: 'expiry_needed',
        isBlocking: true,
        reasonEn: `Expiry date required for "${req.title_en}".`,
        reasonBn: `"${req.title_bn}"-এর জন্য মেয়াদের তারিখ প্রয়োজন।`,
      };
    }

    if (isDateExpired(expiryDate, submissionDeadline)) {
      const deadlineDate = normalizeDate(submissionDeadline);
      return {
        status: 'expired',
        isBlocking: true,
        reasonEn: `Document "${req.title_en}" expired on ${expiryDate} (deadline: ${deadlineDate}).`,
        reasonBn: `"${req.title_bn}" নথিটির মেয়াদ ${expiryDate}-এ শেষ হয়েছে (জমার শেষ সময়: ${deadlineDate})।`,
      };
    }
  }

  // Condition 5: OK
  return {
    status: 'ok',
    isBlocking: false,
    reasonEn: `Requirement "${req.title_en}" is satisfied.`,
    reasonBn: `প্রয়োজনীয়তা "${req.title_bn}" পূরণ হয়েছে।`,
  };
}

/**
 * Calculates package readiness across all requirements.
 */
export function calculatePackageReadiness(
  requirements: Requirement[],
  matches: Record<string, RequirementMatch>,
  submissionDeadline: string
): PackageReadiness {
  const totalRequirements = requirements.length;
  let blockingCount = 0;
  const blockingReasonsEn: string[] = [];
  const blockingReasonsBn: string[] = [];

  for (const req of requirements) {
    const match = matches[req.id];
    const validation = validateRequirement(req, match, submissionDeadline);

    if (validation.isBlocking) {
      blockingCount++;
      blockingReasonsEn.push(validation.reasonEn);
      blockingReasonsBn.push(validation.reasonBn);
    }
  }

  const readyCount = totalRequirements - blockingCount;
  const isReady = totalRequirements > 0 && blockingCount === 0;

  return {
    totalRequirements,
    readyCount,
    blockingCount,
    isReady,
    blockingReasonsEn,
    blockingReasonsBn,
  };
}

/**
 * Validates and parses a local requirements.json string.
 */
export function parseRequirementsJson(
  rawContent: string,
  lang: Language = 'en'
): { config: { tender: import('../types/tender').TenderMetadata; requirements: Requirement[] } | null; error: string | null } {
  try {
    const data = JSON.parse(rawContent);

    if (!data || typeof data !== 'object') {
      return {
        config: null,
        error: lang === 'bn' ? 'ভুল JSON ফরম্যাট।' : 'Invalid JSON format.',
      };
    }

    const { tender, requirements } = data;

    if (!tender || typeof tender !== 'object') {
      return {
        config: null,
        error:
          lang === 'bn'
            ? 'ফাইলে "tender" তথ্য অনুপস্থিত।'
            : 'Missing "tender" object in configuration.',
      };
    }

    const requiredTenderFields = [
      'tender_id',
      'title',
      'procuring_entity',
      'bidder',
      'submission_deadline',
    ] as const;

    for (const field of requiredTenderFields) {
      if (!tender[field] || typeof tender[field] !== 'string') {
        return {
          config: null,
          error:
            lang === 'bn'
              ? `টেন্ডার তথ্যে "${field}" ক্ষেত্রটি প্রয়োজন।`
              : `Field "tender.${field}" is required and must be a string.`,
        };
      }
    }

    if (!Array.isArray(requirements) || requirements.length === 0) {
      return {
        config: null,
        error:
          lang === 'bn'
            ? '"requirements" একটি অশূন্য তালিকা হতে হবে।'
            : '"requirements" must be a non-empty array.',
      };
    }

    for (let i = 0; i < requirements.length; i++) {
      const req = requirements[i];
      if (
        !req ||
        typeof req.id !== 'string' ||
        typeof req.order !== 'number' ||
        typeof req.title_en !== 'string' ||
        typeof req.title_bn !== 'string' ||
        typeof req.mandatory !== 'boolean' ||
        typeof req.has_expiry !== 'boolean'
      ) {
        return {
          config: null,
          error:
            lang === 'bn'
              ? `প্রয়োজনীয়তা সূচক ${i + 1}-এ ভুল ফিল্ড বা ফরম্যাট রয়েছে।`
              : `Requirement at index ${i + 1} is missing required fields (id, order, title_en, title_bn, mandatory, has_expiry).`,
        };
      }
    }

    // Sort requirements by order ascending
    const sortedRequirements = [...requirements].sort((a, b) => a.order - b.order);

    return {
      config: {
        tender: {
          tender_id: tender.tender_id,
          title: tender.title,
          procuring_entity: tender.procuring_entity,
          bidder: tender.bidder,
          submission_deadline: tender.submission_deadline,
        },
        requirements: sortedRequirements,
      },
      error: null,
    };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown JSON syntax error';
    return {
      config: null,
      error:
        lang === 'bn'
          ? `JSON ফাইল পার্সিং ত্রুটি: ${errorMsg}`
          : `JSON parsing error: ${errorMsg}`,
    };
  }
}

