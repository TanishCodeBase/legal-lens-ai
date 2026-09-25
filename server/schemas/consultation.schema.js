const consultationSchema = {
  type: "object",
  properties: {
    operation: { type: "string" },
    success: { type: "boolean" },
    caseSummary: { type: "string" },
    keyIssues: {
      type: "array",
      items: {
        type: "object",
        properties: {
          issue: { type: "string" },
          importance: { type: "string", enum: ["high", "medium", "low"] },
          description: { type: "string" },
          source: {
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
        required: ["issue", "importance", "description", "source"]
      }
    },
    questionsForLawyer: {
      type: "array",
      items: {
        type: "object",
        properties: {
          priority: { type: "string", enum: ["high", "medium", "low"] },
          question: { type: "string" }
        },
        required: ["priority", "question"]
      }
    },
    documentsToBring: { type: "array", items: { type: "string" } },
    timeline: {
      type: "array",
      items: {
        type: "object",
        properties: {
          event: { type: "string" },
          date: { type: "string" },
          source: {
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
        required: ["event", "date", "source"]
      }
    },
    importantClauses: {
      type: "array",
      items: {
        type: "object",
        properties: {
          title: { type: "string" },
          reason: { type: "string" },
          source: {
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
        required: ["title", "reason", "source"]
      }
    },
    disclaimer: { type: "string" }
  },
  required: [
    "operation", "success", "caseSummary", "keyIssues", 
    "questionsForLawyer", "documentsToBring", "timeline", 
    "importantClauses", "disclaimer"
  ]
};

module.exports = consultationSchema;
