const consultationPrompt = (userContext) => `Prepare a concise briefing document for a user who intends to consult
a legal professional.

${userContext ? `User Context/Goal: "${userContext}"\n` : ""}

Extract:

- overall situation represented by the document
- important issues
- clauses worth discussing
- questions to ask the lawyer
- documents that may be useful to bring
- important dates/timeline items

Do not provide legal advice or conclusions.

The goal is to improve the user's preparation for a professional
consultation.`;

module.exports = consultationPrompt;
