const comparePrompt = `Compare Document A and Document B.

Identify substantive changes rather than superficial formatting changes.

For each change provide:

- category
- title
- old value
- new value
- importance
- explanation
- source from Document A
- source from Document B

Prioritize changes involving:

- money
- deadlines
- termination
- renewal
- obligations
- penalties
- liability
- rights
- restrictions
- dispute resolution

Do not characterize a change as legally invalid.

Describe why it may deserve user attention.`;

module.exports = comparePrompt;
