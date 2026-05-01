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

// The secondPDF has interleaved two-column layout.
// Pattern: Each answer block looks like:
// Q_LINE (left column question text)
// ...options mixed with next question fragments...  
// [ANSWER: X]
// 
// The key insight: each [ANSWER] is associated with a question that appears
// a few lines before it. The options are the (a)(b)(c)(d) lines between them.
// But because of interleaving, we need to be smart about which options go with which question.

// New approach: Walk through lines. When we see [ANSWER: X], collect the 
// question from the nearest preceding line that starts with "N. " and has question text,
// then collect options from lines in between.

// Actually, simpler approach: 
// Each question block = everything from previous question line (or start) up to [ANSWER]
// Parse: last "N. text" in the block = question; all (x) lines = options

let output = '';
let qGlobal = 1;

let i = 0;
while (i < lines.length) {
  const line = lines[i].trim();
  
  // Skip non-answer lines
  if (!line.startsWith('[ANSWER:')) {
    i++;
    continue;
  }
  
  // Parse answer
  const ansMatch = line.match(/\[ANSWER:\s*([A-D])\]/i);
  if (!ansMatch) { i++; continue; }
  const answer = ansMatch[1].toUpperCase();
  
  // Collect preceding lines until we hit a question line or chapter header
  let blockLines = [];
  let j = i - 1;
  while (j >= 0) {
    const pl = lines[j].trim();
    if (pl.startsWith('# Chapter') || pl.startsWith('## Questions') || pl.startsWith('# SecondPDF')) break;
    if (pl.startsWith('[ANSWER:')) break;
    blockLines.unshift(pl);
    j--;
  }
  
  // Find the question line (the one starting with "N. ")
  let questionText = '';
  let qNumInExtraction = '';
  let optionText = '';
  
  for (let k = 0; k < blockLines.length; k++) {
    const bl = blockLines[k];
    if (/^\d+\.\s/.test(bl)) {
      // This is the question line - extract just the text part before any options
      const qm = bl.match(/^(\d+)\.\s+(.+)/);
      if (qm) {
        qNumInExtraction = qm[1];
        questionText = qm[2].trim();
      }
    }
  }
  
  // Collect all option lines (lines starting with a), b), c), d) or containing them)
  // Also extract options that might be embedded in question lines
  let allOptText = [];
  for (const bl of blockLines) {
    // Extract any option patterns from this line
    const matches = bl.match(/[a-d]\)\s*[^(\n]*/gi);
    if (matches) {
      for (const m of matches) {
        const cleaned = m.replace(/^[a-d]\)\s*/i, '').trim();
        if (cleaned && cleaned.length > 1) {
          allOptText.push(cleaned);
        }
      }
    }
  }
  
  // Also look for options IN the question line
  if (questionText) {
    const inLineOpts = questionText.match(/[a-d]\)\s*[^(\n]*/gi);
    if (inLineOpts) {
      // If there are options IN the question line, the question text is only the part before them
      const firstOptMatch = questionText.match(/^(.+?)\s*[a-d]\)/i);
      if (firstOptMatch) {
        questionText = firstOptMatch[1].trim();
      }
      for (const m of inLineOpts) {
        const cleaned = m.replace(/^[a-d]\)\s*/i, '').trim();
        if (cleaned && cleaned.length > 1 && !allOptText.includes(cleaned)) {
          allOptText.push(cleaned);
        }
      }
    }
  }
  
  // Clean up question text - remove any trailing option-like text
  questionText = questionText.replace(/\s*[a-d]\)\s*.+$/i, '').trim();
  
  // Chapter based on answer line number
  const chapter = getChapterForLine(i + 1);
  
  // Only output if we have a reasonable question and at least 2 options
  if (questionText && questionText.length > 3 && allOptText.length >= 2) {
    // Limit to 4 options
    const opts = allOptText.slice(0, 4);
    while (opts.length < 4) opts.push('');
    
    output += `Question ${qGlobal}: ${questionText}\n`;
    output += `*A) ${opts[0]}\n`;
    output += `B) ${opts[1]}\n`;
    output += `C) ${opts[2]}\n`;
    output += `D) ${opts[3]}\n`;
    output += `Answer: ${answer}\n`;
    output += `Topic: ${chapter}\n`;
    output += `---\n\n`;
    qGlobal++;
  }
  
  i++;
}

fs.writeFileSync('/Users/aayush07/.openclaw/workspace/study-platform/forms/subject2-form.md', output);
console.log(`Parsed approximately ${qGlobal - 1} questions`);
console.log(`Output length: ${output.length} chars`);
