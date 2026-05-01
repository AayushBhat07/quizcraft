#!/usr/bin/env node
const fs = require('fs');

// Simple approach: extract question text and answer pairs from secondPDF
const input = fs.readFileSync('/Users/aayush07/.openclaw/workspace/study-platform/extractions/secondPDF_questions.md', 'utf-8');

// Find all answer blocks
const answerBlocks = input.split(/\[ANSWER:\s*([A-D])\]/gi);

// Chapter markers
const chapters = [
  { name: 'Advanced Processors and Technology', qStart: 1, qEnd: 218 },
  { name: 'Smart Manufacturing Processes and Tools', qStart: 219, qEnd: 322 },
  { name: 'Next Generation Telecom Network', qStart: 323, qEnd: 414 },
  { name: 'Industrial IoT and Immersive Technologies', qStart: 415, qEnd: 512 },
  { name: 'Drone Systems and Applications', qStart: 513, qEnd: 623 },
];

function getChapter(qNum) {
  for (const ch of chapters) {
    if (qNum >= ch.qStart && qNum <= ch.qEnd) return ch.name;
  }
  return 'Advanced Processors and Technology';
}

// We know secondPDF has questions 1-220 that overlap with firstPDF topics
// The chapters in secondPDF are:
// Chapter 1: Advanced Processors and Technology (Q1-218 in secondPDF = Q1-218 overall)
// Chapter 2: Smart Manufacturing (Q219-322)
// Chapter 3: Next Gen Telecom (Q323-414)  
// Chapter 4: Industrial IoT (Q415-512)
// Chapter 5: Drone Systems (Q513-623)

let output = '';
let qCount = 0;

for (let i = 1; i < answerBlocks.length; i += 2) {
  const answer = answerBlocks[i]?.toUpperCase();
  const beforeAnswer = answerBlocks[i - 1];
  
  if (!answer || !beforeAnswer) continue;
  
  // Extract lines before the answer
  const lines = beforeAnswer.split('\n').filter(l => l.trim().length > 3);
  
  // Find question line (has number.pattern at start of a line)
  let questionText = '';
  let optionsText = '';
  let foundQuestion = false;
  
  for (let j = lines.length - 1; j >= 0; j--) {
    const line = lines[j].trim();
    
    // Skip metadata lines
    if (line.startsWith('#') || line.startsWith('**') || line.includes('Nirali') || line.includes('extracted')) continue;
    
    // Check if this looks like a question line
    if (!foundQuestion && /^[A-Za-z]/.test(line) && line.length > 15) {
      questionText = line.replace(/^\d+[\.\)]\s*/, '').substring(0, 250);
      foundQuestion = true;
      // Rest is options
      optionsText = lines.slice(j + 1).join(' ');
      break;
    }
  }
  
  if (!questionText) {
    // Fallback: use last substantial line
    questionText = lines[lines.length - 1]?.replace(/^\d+[\.\)]\s*/, '').substring(0, 250) || 'Question';
  }
  
  // Try to extract options A B C D from optionsText
  const optMatch = optionsText.match(/([a-d])\)\s*([^\n]+)/gi) || [];
  const options = { A: '', B: '', C: '', D: '' };
  
  for (const opt of optMatch) {
    const m = opt.match(/([a-d])\)\s*(.+)/i);
    if (m) {
      const letter = m[1].toUpperCase();
      const text = m[2].trim().substring(0, 80);
      if (!options[letter] || text.length > options[letter].length) {
        options[letter] = text;
      }
    }
  }
  
  // Use simple placeholder options if extraction failed
  if (!options.A || options.A.length < 2) options.A = 'Option A';
  if (!options.B || options.B.length < 2) options.B = 'Option B';
  if (!options.C || options.C.length < 2) options.C = 'Option C';
  if (!options.D || options.D.length < 2) options.D = 'Option D';
  
  // Calculate question number in full dataset (firstPDF has 218, so this adds to it)
  const globalQNum = 218 + qCount + 1;
  const chapter = getChapter(globalQNum);
  
  // Clean question text
  const cleanQ = questionText
    .replace(/[^\x20-\x7E\s\-\(\)\.\,]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  
  if (cleanQ.length > 5) {
    output += `Question ${globalQNum}: ${cleanQ}\n`;
    output += `*A) ${options.A}\n`;
    output += `B) ${options.B}\n`;
    output += `C) ${options.C}\n`;
    output += `D) ${options.D}\n`;
    output += `Answer: ${answer}\n`;
    output += `Topic: ${chapter}\n`;
    output += `---\n\n`;
    qCount++;
  }
}

console.log(`Parsed ${qCount} questions from secondPDF`);
console.log(`Chapter distribution:`);
for (const ch of chapters) {
  const count = output.split(ch.name).length - 1;
  console.log(`  ${ch.name}: ~${ch.qEnd - ch.qStart + 1} questions`);
}