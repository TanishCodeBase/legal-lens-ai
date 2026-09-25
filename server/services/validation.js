// Validation service for Gemini responses
const { z } = require('zod');
const { generateStructuredContent, modelName, fallbackModelName } = require('./gemini');

// Schemas for Zod Server-side Validation
const analyzeZodSchema = z.object({
  operation: z.literal("analyze"),
  success: z.boolean(),
  document: z.object({
    title: z.string(),
    type: z.string(),
    parties: z.array(z.string()),
    effectiveDate: z.string(),
    expirationDate: z.string()
  }),
  summary: z.object({
    short: z.string(),
    detailed: z.string()
  }),
  keyTerms: z.array(z.object({
    name: z.string(),
    value: z.string(),
    category: z.string(),
    source: z.object({
      sourceId: z.string(),
      page: z.union([z.number(), z.null(), z.string().transform(s => parseInt(s) || null)]).optional().nullable(),
      section: z.string(),
      quote: z.string()
    })
  })),
  obligations: z.array(z.object({
    party: z.string(),
    obligation: z.string(),
    frequency: z.string(),
    source: z.object({
      sourceId: z.string(),
      page: z.union([z.number(), z.null(), z.string().transform(s => parseInt(s) || null)]).optional().nullable(),
      section: z.string(),
      quote: z.string()
    })
  })),
  clauses: z.array(z.object({
    id: z.string(),
    title: z.string(),
    category: z.string(),
    severity: z.enum(["high", "medium", "low", "info"]),
    summary: z.string(),
    whyItMatters: z.string(),
    source: z.object({
      sourceId: z.string(),
      page: z.union([z.number(), z.null(), z.string().transform(s => parseInt(s) || null)]).optional().nullable(),
      section: z.string(),
      quote: z.string()
    }),
    suggestedQuestion: z.string()
  })),
  attentionScore: z.number().min(0).max(100),
  attentionLabel: z.enum(["low", "moderate", "high"]),
  attentionBreakdown: z.object({
    highPriority: z.number(),
    review: z.number(),
    informational: z.number()
  }),
  nextSteps: z.array(z.object({
    priority: z.enum(["high", "medium", "low"]),
    action: z.string(),
    reason: z.string()
  })),
  lawyerQuestions: z.array(z.string()),
  disclaimer: z.string()
});

const askZodSchema = z.object({
  operation: z.literal("ask"),
  success: z.boolean(),
  question: z.string(),
  answer: z.string(),
  grounded: z.boolean(),
  confidence: z.enum(["high", "medium", "low"]),
  sources: z.array(z.object({
    sourceId: z.string(),
    page: z.union([z.number(), z.null(), z.string().transform(s => parseInt(s) || null)]).optional().nullable(),
    section: z.string(),
    quote: z.string()
  })),
  notFound: z.boolean(),
  followUp: z.string(),
  disclaimer: z.string()
});

const compareZodSchema = z.object({
  operation: z.literal("compare"),
  success: z.boolean(),
  documents: z.object({
    documentA: z.object({ name: z.string() }),
    documentB: z.object({ name: z.string() })
  }),
  summary: z.object({
    totalChanges: z.number(),
    highImportance: z.number(),
    mediumImportance: z.number(),
    lowImportance: z.number(),
    overallImpact: z.enum(["low", "moderate", "high"]),
    text: z.string()
  }),
  changes: z.array(z.object({
    id: z.string(),
    category: z.string(),
    title: z.string(),
    oldValue: z.string(),
    newValue: z.string(),
    importance: z.enum(["high", "medium", "low"]),
    explanation: z.string(),
    sourceA: z.object({
      sourceId: z.string(),
      page: z.union([z.number(), z.null(), z.string().transform(s => parseInt(s) || null)]).optional().nullable(),
      section: z.string(),
      quote: z.string()
    }),
    sourceB: z.object({
      sourceId: z.string(),
      page: z.union([z.number(), z.null(), z.string().transform(s => parseInt(s) || null)]).optional().nullable(),
      section: z.string(),
      quote: z.string()
    })
  })),
  recommendedReview: z.array(z.object({
    changeId: z.string(),
    reason: z.string()
  })),
  disclaimer: z.string()
});

const consultationZodSchema = z.object({
  operation: z.literal("consultation"),
  success: z.boolean(),
  caseSummary: z.string(),
  keyIssues: z.array(z.object({
    issue: z.string(),
    importance: z.enum(["high", "medium", "low"]),
    description: z.string(),
    source: z.object({
      sourceId: z.string(),
      page: z.union([z.number(), z.null(), z.string().transform(s => parseInt(s) || null)]).optional().nullable(),
      section: z.string(),
      quote: z.string()
    })
  })),
  questionsForLawyer: z.array(z.object({
    priority: z.enum(["high", "medium", "low"]),
    question: z.string()
  })),
  documentsToBring: z.array(z.string()),
  timeline: z.array(z.object({
    event: z.string(),
    date: z.string(),
    source: z.object({
      sourceId: z.string(),
      page: z.union([z.number(), z.null(), z.string().transform(s => parseInt(s) || null)]).optional().nullable(),
      section: z.string(),
      quote: z.string()
    })
  })),
  importantClauses: z.array(z.object({
    title: z.string(),
    reason: z.string(),
    source: z.object({
      sourceId: z.string(),
      page: z.union([z.number(), z.null(), z.string().transform(s => parseInt(s) || null)]).optional().nullable(),
      section: z.string(),
      quote: z.string()
    })
  })),
  disclaimer: z.string()
});

/**
 * Validates the Gemini output, with a single retry if it fails.
 */
async function generateAndValidate(fileUris, systemInstruction, prompt, schemaObj, zodSchema) {
  const MAX_ATTEMPTS = 2;
  const BASE_MS = 500;

  const isServiceError = (err) =>
    err.statusCode === 503 || err.code === 503 ||
    err.statusCode === 429 || err.code === 429;
  const isQuotaError = (err) =>
    err.statusCode === 429 || err.code === 429;

  // Helper for backoff
  const backoff = (attempt) => {
    const jitter = Math.floor(Math.random() * 200);
    const delay = BASE_MS * Math.pow(2, attempt) + jitter;
    return new Promise((resolve) => setTimeout(resolve, delay));
  };

  // Primary attempts using primary model
  let attempt = 0;
  let lastError = null;
  while (attempt < MAX_ATTEMPTS) {
    try {
      const data = await generateStructuredContent(fileUris, systemInstruction, prompt, schemaObj);
      console.log(`\n\n=== DIAGNOSTIC: RAW GEMINI DATA ===\n`, JSON.stringify(data, null, 2), `\n=================================\n\n`);
      const parsedData = zodSchema.parse(data);
      return parsedData;
    } catch (error) {
      console.error(`Primary attempt ${attempt + 1} failed:`, error.message);
      if (isQuotaError(error)) {
        lastError = error;
        break;
      }
      if (!isServiceError(error)) {
        const isZodError = !!error.errors;
        if (isZodError) {
          throw new Error('AI_RESPONSE_INVALID');
        }
        throw error;
      }
      lastError = error;
      attempt++;
      if (attempt < MAX_ATTEMPTS) {
        await backoff(attempt);
      }
    }
  }

  // If both primary attempts failed with 503, try fallback model
  if (modelName !== fallbackModelName) {
    console.log(`[Gemini] Switching to fallback model: ${fallbackModelName}`);
    try {
      const data = await generateStructuredContent(fileUris, systemInstruction, prompt, schemaObj, fallbackModelName);
      console.log(`\n\n=== DIAGNOSTIC: RAW GEMINI DATA (fallback) ===\n`, JSON.stringify(data, null, 2), `\n=================================\n\n`);
      const parsedData = zodSchema.parse(data);
      return parsedData;
    } catch (fallbackError) {
      console.error('Fallback attempt failed:', fallbackError.message);
      if (isQuotaError(fallbackError)) {
        throw new Error('QUOTA_EXCEEDED');
      }
      if (isServiceError(fallbackError)) {
        throw new Error('SERVICE_UNAVAILABLE');
      }
      const isZodError = !!fallbackError.errors;
      if (isZodError) {
        throw new Error('AI_RESPONSE_INVALID');
      }
      throw fallbackError;
    }
  } else {
    // No distinct fallback model available
    if (lastError && isQuotaError(lastError)) {
      throw new Error('QUOTA_EXCEEDED');
    }
    throw new Error('SERVICE_UNAVAILABLE');
  }
}

module.exports = {
  analyzeZodSchema,
  askZodSchema,
  compareZodSchema,
  consultationZodSchema,
  generateAndValidate
};
