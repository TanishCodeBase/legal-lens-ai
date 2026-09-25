const { Type } = require('@google/genai');

const analyzeSchema = {
  type: Type.OBJECT,
  properties: {
    operation: { type: Type.STRING, enum: ["analyze"] },
    success: { type: Type.BOOLEAN },
    document: {
      type: Type.OBJECT,
      properties: {
        title: { type: Type.STRING },
        type: { type: Type.STRING },
        parties: { type: Type.ARRAY, items: { type: Type.STRING } },
        effectiveDate: { type: Type.STRING },
        expirationDate: { type: Type.STRING }
      },
      required: ["title", "type", "parties", "effectiveDate", "expirationDate"]
    },
    summary: {
      type: Type.OBJECT,
      properties: {
        short: { type: Type.STRING },
        detailed: { type: Type.STRING }
      },
      required: ["short", "detailed"]
    },
    keyTerms: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          value: { type: Type.STRING },
          category: { type: Type.STRING },
          source: {
            type: Type.OBJECT,
            properties: {
              sourceId: { type: Type.STRING },
              page: { type: Type.INTEGER },
              section: { type: Type.STRING },
              quote: { type: Type.STRING }
            },
            required: ["sourceId", "section", "quote"]
          }
        },
        required: ["name", "value", "category", "source"]
      }
    },
    obligations: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          party: { type: Type.STRING },
          obligation: { type: Type.STRING },
          frequency: { type: Type.STRING },
          source: {
            type: Type.OBJECT,
            properties: {
              sourceId: { type: Type.STRING },
              page: { type: Type.INTEGER },
              section: { type: Type.STRING },
              quote: { type: Type.STRING }
            },
            required: ["sourceId", "section", "quote"]
          }
        },
        required: ["party", "obligation", "frequency", "source"]
      }
    },
    clauses: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          title: { type: Type.STRING },
          category: { type: Type.STRING },
          severity: { type: Type.STRING, enum: ["high", "medium", "low", "info"] },
          summary: { type: Type.STRING },
          whyItMatters: { type: Type.STRING },
          source: {
            type: Type.OBJECT,
            properties: {
              sourceId: { type: Type.STRING },
              page: { type: Type.INTEGER },
              section: { type: Type.STRING },
              quote: { type: Type.STRING }
            },
            required: ["sourceId", "section", "quote"]
          },
          suggestedQuestion: { type: Type.STRING }
        },
        required: ["id", "title", "category", "severity", "summary", "whyItMatters", "source", "suggestedQuestion"]
      }
    },
    attentionScore: { type: Type.INTEGER },
    attentionLabel: { type: Type.STRING, enum: ["low", "moderate", "high"] },
    attentionBreakdown: {
      type: Type.OBJECT,
      properties: {
        highPriority: { type: Type.INTEGER },
        review: { type: Type.INTEGER },
        informational: { type: Type.INTEGER }
      },
      required: ["highPriority", "review", "informational"]
    },
    nextSteps: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          priority: { type: Type.STRING, enum: ["high", "medium", "low"] },
          action: { type: Type.STRING },
          reason: { type: Type.STRING }
        },
        required: ["priority", "action", "reason"]
      }
    },
    lawyerQuestions: { type: Type.ARRAY, items: { type: Type.STRING } },
    disclaimer: { type: Type.STRING }
  },
  required: [
    "operation", "success", "document", "summary", "keyTerms", "obligations", 
    "clauses", "attentionScore", "attentionLabel", "attentionBreakdown", 
    "nextSteps", "lawyerQuestions", "disclaimer"
  ]
};

module.exports = analyzeSchema;
