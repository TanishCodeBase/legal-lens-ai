const askSchema = {
  type: "object",
  properties: {
    operation: { type: "string" },
    success: { type: "boolean" },
    question: { type: "string" },
    answer: { type: "string" },
    grounded: { type: "boolean" },
    confidence: { type: "string", enum: ["high", "medium", "low"] },
    sources: {
      type: "array",
      items: {
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
    notFound: { type: "boolean" },
    followUp: { type: "string" },
    disclaimer: { type: "string" }
  },
  required: [
    "operation", "success", "question", "answer", "grounded",
    "confidence", "sources", "notFound", "followUp", "disclaimer"
  ]
};

module.exports = askSchema;
