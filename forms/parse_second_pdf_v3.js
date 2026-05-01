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

// Approach: The two-column OCR interleaves questions and options.
// For a question at line Q with answer at line A:
// - The options for this question are the LAST 4 (a)(b)(c)(d) patterns 
//   in lines [Q+1, A-1] that have substantive text.
// - Earlier options belong to the interleaved previous question.

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
  
  // Find ALL options in blockLines - format is "a) text" 
  // Each (a)/(b)/(c)/(d) pattern with substantive text is an option
  let allOpts = [];
  
  for (const bl of blockLines) {
    // Match "a) text" etc. - might be multiple per line
    // Pattern: letter) followed by text (non-greedy), stops at next letter) or end
    const re = /([a-d])\)\s*([^\n]+)/gi;
    let m;
    while ((m = re.exec(bl)) !== null) {
      const letter = m[1].toUpperCase();
      let text = m[2].trim();
      // Skip if text starts with a number followed by period (likely a question number)
      // e.g., "16 13. The fastest..." should skip the "16 " part
      text = text.replace(/^\d+\s+/, '');
      if (text.length > 1 && !/^\d+\./.test(text)) {
        allOpts.push({ letter, text });
      }
    }
  }
  
  // Sort by letter - but for each letter, keep ALL occurrences
  // Then take the LAST 4 occurrences (one per letter ideally)
  // Deduplicate per letter, preferring the LAST occurrence with substantive text
  let bestOpts = { A: '', B: '', C: '', D: '' };
  let lastSeen = { A: -1, B: -1, C: -1, D: -1 };
  
  for (let idx = 0; idx < allOpts.length; idx++) {
    const { letter, text } = allOpts[idx];
    // Prefer later occurrences (more likely to be this question's options)
    // Also prefer longer text
    if (!bestOpts[letter] || 
        (lastSeen[letter] < idx && text.length > bestOpts[letter].length * 0.5)) {
      bestOpts[letter] = text;
      lastSeen[letter] = idx;
    }
  }
  
  // Actually, let's try: take the LAST occurrence of each letter that has substantial text
  for (const { letter, text } of allOpts) {
    if (text.length > 3) {
      bestOpts[letter] = text; // Last one wins
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
