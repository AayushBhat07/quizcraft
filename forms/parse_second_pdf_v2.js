const fs = require('fs');

const input = fs.readFileSync('/Users/aayush07/.openclaw/workspace/study-platform/extractions/secondPDF_questions.md', 'utf-8');
const lines = input.split('\n');

// Chapter boundaries
const chapterBoundaries = [
  { name: 'Advanced Processors and Technology', start: 10, end: 955 },
  { name: 'Smart Manufacturing Processes and Tools', start: 956, end: 1303 },
  { name: 'Next Generation Telecom Network', start: 1304, end: 1668 },
  { name: 'Industrial IoT and Immersive Technologies', start: 1669, end: 2074 },
  { name: 'Drone Systems and Applications', start: 2075, end: lines.length }
];

function getChapterForLine(lineNum) {
  for (const ch of chapterBoundaries) {
    if (lineNum >= ch.start && lineNum < ch.end) return ch.name;
  }
  return 'Unknown';
}

// The OCR uses format "a) text" not "(a) text" - fix the regex!

let output = '';
let qGlobal = 1;

for (let i = 0; i < lines.length; i++) {
  const line = lines[i].trim();
  if (!line.startsWith('[ANSWER:')) continue;
  
  const ansMatch = line.match(/\[ANSWER:\s*([A-D])\]/i);
  if (!ansMatch) continue;
  const answer = ansMatch[1].toUpperCase();
  
  // Find the most recent "N. " line before this answer
  let questionLineIdx = -1;
  for (let j = i - 1; j >= 0; j--) {
    const pl = lines[j].trim();
    if (/^\d+\.\s/.test(pl)) {
      questionLineIdx = j;
      break;
    }
    if (pl.startsWith('# Chapter') || pl.startsWith('## Questions') || 
        pl.startsWith('# SecondPDF') || pl.startsWith('[ANSWER:')) {
      break;
    }
  }
  
  if (questionLineIdx === -1) continue;
  
  const questionLine = lines[questionLineIdx].trim();
  const qm = questionLine.match(/^(\d+)\.\s+(.+)/);
  if (!qm) continue;
  
  let questionText = qm[2];
  
  // Collect lines between question line and answer line
  let blockLines = [];
  for (let k = questionLineIdx + 1; k < i; k++) {
    blockLines.push(lines[k].trim());
  }
  
  // Find ALL options - format is "a) text" (NOT "(a) text")
  let allOpts = [];
  
  // Extract options from blockLines - pattern "a) text" etc.
  for (const bl of blockLines) {
    // Match "a) text" or "a) text b) text c) text d) text" on same line
    const re = /([a-d])\)\s*([^\n]+)/gi;
    let m;
    while ((m = re.exec(bl)) !== null) {
      const letter = m[1].toUpperCase();
      const text = m[2].trim();
      // Skip if text looks like a question number (e.g., "13. The fastest...")
      if (!/^\d+\./.test(text) && text.length > 1) {
        allOpts.push({ letter, text });
      }
    }
  }
  
  // Also check if questionText itself has inline options
  const qOpts = questionText.match(/([a-d])\)\s*([^\n]+)/gi);
  if (qOpts) {
    for (const o of qOpts) {
      const m = o.match(/([a-d])\)\s*(.+)/i);
      if (m) {
        const letter = m[1].toUpperCase();
        const text = m[2].trim();
        if (text.length > 1) allOpts.push({ letter, text });
      }
    }
  }
  
  // Sort by letter, then by text length (prefer longer descriptions)
  // Deduplicate per letter - prefer longest text for each letter
  let bestOpts = { A: '', B: '', C: '', D: '' };
  for (const { letter, text } of allOpts) {
    if (!bestOpts[letter] || bestOpts[letter].length < text.length) {
      bestOpts[letter] = text;
    }
  }
  
  // Clean questionText - remove any embedded inline options
  questionText = questionText.replace(/\s+[a-d]\)\s*.+$/i, '').trim();
  questionText = questionText.replace(/\s+\d+\.\d+\s+Nirali.*$/i, '').trim();
  
  const chapter = getChapterForLine(i + 1);
  
  if (questionText && questionText.length > 3 && bestOpts.A && bestOpts.B) {
    output += `Question ${qGlobal}: ${questionText}\n`;
    output += `*A) ${bestOpts.A}\n`;
    output += `B) ${bestOpts.B}\n`;
    output += `C) ${bestOpts.C}\n`;
    output += `D) ${bestOpts.D}\n`;
    output += `Answer: ${answer}\n`;
    output += `Topic: ${chapter}\n`;
    output += `---\n\n`;
    qGlobal++;
  }
}

fs.writeFileSync('/Users/aayush07/.openclaw/workspace/study-platform/forms/subject2-form.md', output);
console.log(`Parsed approximately ${qGlobal - 1} questions`);
console.log(`Output length: ${output.length} chars`);

const topicRe = /^Topic:\s*(.+)$/gm;
const chapterCounts = {};
let m;
while ((m = topicRe.exec(output)) !== null) {
  const t = m[1];
  chapterCounts[t] = (chapterCounts[t] || 0) + 1;
}
console.log('\nChapter distribution:');
for (const [ch, count] of Object.entries(chapterCounts)) {
  console.log(`  ${ch}: ${count} questions`);
}
