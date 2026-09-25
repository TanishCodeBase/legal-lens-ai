const compareSchema = {
  type: "object",
  properties: {
    operation: { type: "string" },
    success: { type: "boolean" },
    documents: {
      type: "object",
      properties: {
        documentA: { type: "object", properties: { name: { type: "string" } }, required: ["name"] },
        documentB: { type: "object", properties: { name: { type: "string" } }, required: ["name"] }
      },
      required: ["documentA", "documentB"]
    },
    summary: {
      type: "object",
      properties: {
        totalChanges: { type: "number" },
        highImportance: { type: "number" },
        mediumImportance: { type: "number" },
        lowImportance: { type: "number" },
        overallImpact: { type: "string", enum: ["low", "moderate", "high"] },
        text: { type: "string" }
      },
      required: ["totalChanges", "highImportance", "mediumImportance", "lowImportance", "overallImpact", "text"]
    },
    changes: {
      type: "array",
      items: {
        type: "object",
        properties: {
          id: { type: "string" },
          category: { type: "string" },
          title: { type: "string" },
          oldValue: { type: "string" },
          newValue: { type: "string" },
          importance: { type: "string", enum: ["high", "medium", "low"] },
          explanation: { type: "string" },
          sourceA: {
            type: "object",
            properties: {
              sourceId: { type: "string" },
              page: { type: "number" },
              section: { type: "string" },
              quote: { type: "string" }
            },
            required: ["sourceId", "section", "quote"]
          },
          sourceB: {
            type: "object",
            properties: {
              sourceId: { type: "string" },
              page: { type: "number" },
              section: { type: "string" },
              quote: { type: "string" }
            },
            required: ["sourceId", "section", "quote"]
          }
        },
        required: ["id", "category", "title", "oldValue", "newValue", "importance", "explanation", "sourceA", "sourceB"]
      }
    },
    recommendedReview: {
      type: "array",
      items: {
        type: "object",
        properties: {
          changeId: { type: "string" },
          reason: { type: "string" }
        },
        required: ["changeId", "reason"]
      }
    },
    disclaimer: { type: "string" }
  },
  required: ["operation", "success", "documents", "summary", "changes", "recommendedReview", "disclaimer"]
};

module.exports = compareSchema;
