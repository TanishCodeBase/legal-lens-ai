const analyzePrompt = `Analyze the provided legal document.

Extract:

- document identity
- document type
- parties
- dates
- financial terms
- obligations
- important clauses
- termination provisions
- renewal provisions
- penalties
- deadlines
- unusual or potentially significant provisions

For each important clause:

- classify its category
- summarize it
- explain why it may deserve attention
- provide its source
- generate a useful question the user could consider asking a lawyer

Calculate an AI Attention Score based on review priority.

The score is NOT a legal validity determination.

Do not provide definitive legal advice.`;

module.exports = analyzePrompt;
