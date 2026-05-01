const fs = require('fs');

const input = fs.readFileSync('/Users/aayush07/.openclaw/workspace/study-platform/extractions/firstPDF_questions.md', 'utf-8');
const lines = input.split('\n');

let currentChapter = '';
let output = '';
let qNum = 0;
let parsedCount = 0;

function parseOptions(optStr) {
  const result = { a: '', b: '', c: '', d: '' };
  // Pattern: (a) text up to (b) or end, (b) text up to (c) or end, etc.
  const re = /\(([a-d])\)\s*(.+?)(?=\s*\([a-d]\)|$)/gi;
  let m;
  while ((m = re.exec(optStr)) !== null) {
    const key = m[1].toLowerCase();
    const val = m[2].trim();
    if (key === 'a') result.a = val;
    if (key === 'b') result.b = val;
    if (key === 'c') result.c = val;
    if (key === 'd') result.d = val;
  }
  return result;
}

let i = 0;
while (i < lines.length) {
  const line = lines[i].trim();

  // Detect chapter
  const chapterMatch = line.match(/^## Chapter \d+:\s*(.+)/);
  if (chapterMatch) {
    currentChapter = chapterMatch[1].trim();
    i++;
    continue;
  }

  // Skip non-question lines
  if (!line ||
      line.startsWith('#') ||
      line.startsWith('## extracted') ||
      line.startsWith('## total') ||
      line.startsWith('### Questions') ||
      line.startsWith('---')) {
    i++;
    continue;
  }

  // Check if this is a question line (starts with a number followed by a period)
  const qMatch = line.match(/^(\d+)\.\s+(.+)/);
  if (!qMatch) {
    i++;
    continue;
  }

  qNum = parseInt(qMatch[1]);
  let questionText = qMatch[2].trim();

  // The next line should be OPTIONS, next after that should be ANSWER
  let optionsLine = '';
  let answerLine = '';
  let j = i + 1;

  // Find OPTIONS and ANSWER lines
  while (j < lines.length && j < i + 5) {
    const l = lines[j].trim();
    if (l.startsWith('[OPTIONS:')) {
      optionsLine = l;
    } else if (l.startsWith('[ANSWER:')) {
      answerLine = l;
    } else if (/^\d+\.\s/.test(l) || l.startsWith('## Chapter')) {
      // Hit next question or chapter - stop looking
      break;
    }
    j++;
  }

  // Parse options
  let options = { a: '', b: '', c: '', d: '' };
  if (optionsLine) {
    const optMatch = optionsLine.match(/\[OPTIONS:\s*(.+?)\]/);
    if (optMatch) {
      options = parseOptions(optMatch[1]);
    }
  }

  // Parse answer
  let answer = '';
  if (answerLine) {
    const ansMatch = answerLine.match(/\[ANSWER:\s*([a-d])\]/i);
    if (ansMatch) answer = ansMatch[1].toUpperCase();
  }

  if (answer && options.a) {
    output += `Question ${qNum}: ${questionText}\n`;
    output += `*A) ${options.a}\n`;
    output += `B) ${options.b}\n`;
    output += `C) ${options.c}\n`;
    output += `D) ${options.d}\n`;
    output += `Answer: ${answer}\n`;
    output += `Topic: ${currentChapter}\n`;
    output += `---\n\n`;
    parsedCount++;
  }

  i++;
}

fs.writeFileSync('/Users/aayush07/.openclaw/workspace/study-platform/forms/emerging-trends-form.md', output);
console.log(`Parsed ${parsedCount} questions`);
console.log(`Output length: ${output.length} chars`);
