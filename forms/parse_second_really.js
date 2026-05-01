#!/usr/bin/env node
const fs = require('fs');

// Parse secondPDF_questions.md - handles badly formatted two-column OCR
const input = fs.readFileSync('/Users/aayush07/.openclaw/workspace/study-platform/extractions/secondPDF_questions.md', 'utf-8');
const lines = input.split('\n');

// We have 220 questions in secondPDF
// Topics based on chapter sections in the file
const chapterMap = [
  { start: 1, end: 45, name: 'Advanced Processors and Technology' },
  { start: 46, end: 91, name: 'Smart Manufacturing Processes and Tools' },
  { start: 92, end: 136, name: 'Next Generation Telecom Network' },
  { start: 137, end: 181, name: 'Industrial IoT and Immersive Technologies' },
  { start: 182, end: 220, name: 'Drone Systems and Applications' },
];

let output = '';
let qNum = 1;
let currentChapter = 'Advanced Processors and Technology';
let buffer = [];
let pendingAnswer = null;

// Process line by line
for (let i = 0; i < lines.length; i++) {
  const line = lines[i].trim();
  
  // Detect chapter changes
  if (line.startsWith('# Chapter')) {
    const chMatch = line.match(/Chapter (\d+)/);
    if (chMatch) {
      const chNum = parseInt(chMatch[1]);
      const ch = chapterMap.find(c => c.start === getChapterStart(chNum));
      if (ch) currentChapter = ch.name;
    }
    continue;
  }
  
  // Skip metadata
  if (line.startsWith('#') || line.startsWith('**') || line.startsWith('*extracted') || line.startsWith('*source') || line.startsWith('*total') || line.startsWith('*notes')) continue;
  if (line.startsWith('---')) continue;
  
  // Found an answer line
  if (line.startsWith('[ANSWER:')) {
    const ansMatch = line.match(/\[ANSWER:\s*([A-D])\]/i);
    if (ansMatch && buffer.length > 0) {
      pendingAnswer = ansMatch[1].toUpperCase();
    }
    continue;
  }
  
  // Question number pattern: "1. " or "1) " at start of line
  const qMatch = line.match(/^(?:^|\n)(\d+)[\.\)]\s+(.+)/);
  if (qMatch && pendingAnswer) {
    const questionText = qMatch[2].trim();
    
    // Try to extract options from buffer
    let options = { A: '', B: '', C: '', D: '' };
    let optionText = buffer.join(' ').replace(/\s+/g, ' ');
    
    // Try pattern: a) xxx b) yyy c) zzz d) www
    const optMatch = optionText.match(/([a-d])\)\s*([^a-d][^\[a-d]*?)(?=[a-d]\)\s|$)/gi);
    if (optMatch) {
      for (const o of optMatch) {
        const om = o.match(/([a-d])\)\s*(.+)/i);
        if (om) {
          const letter = om[1].toUpperCase();
          const text = om[2].trim().replace(/[^a-zA-Z0-9\s\-\(\)\.\,]/g, '');
          if (options[letter] === '' || text.length > options[letter].length) {
            options[letter] = text;
          }
        }
      }
    }
    
    // Fallback: split by common separators
    if (!options.A) {
      const parts = optionText.split(/\s{2,}|\t+/);
      const letters = ['A', 'B', 'C', 'D'];
      parts.slice(0, 4).forEach((part, idx) => {
        if (letters[idx]) {
          const cleaned = part.replace(/^[a-d]\)\s*/i, '').trim();
          if (cleaned.length > 2) options[letters[idx]] = cleaned.substring(0, 100);
        }
      });
    }
    
    // Clean question text
    const cleanQ = questionText
      .replace(/^\d+\.\s*/, '')
      .replace(/[^\x20-\x7E\n]/g, '')
      .trim()
      .substring(0, 300);
    
    if (cleanQ.length > 10 && options.A && options.B) {
      output += `Question ${qNum}: ${cleanQ}\n`;
      output += `*A) ${options.A}\n`;
      output += `B) ${options.B}\n`;
      output += `C) ${options.C || 'Not available'}\n`;
      output += `D) ${options.D || 'Not available'}\n`;
      output += `Answer: ${pendingAnswer}\n`;
      output += `Topic: ${currentChapter}\n`;
      output += `---\n\n`;
      qNum++;
    }
    
    buffer = [];
    pendingAnswer = null;
    continue;
  }
  
  // Collect non-empty lines for options
  if (line.length > 3 && !line.startsWith('[') && !line.startsWith('**')) {
    buffer.push(line);
  }
}

function getChapterStart(num) {
  return chapterMap.find(c => c.end >= (chapterMap.slice(0, chapterMap.findIndex(c => c.end >= ((num-1)*5)) + 1).reduce((s, c) => s, 0)))?.start || 1;
}

fs.writeFileSync('/Users/aayush07/.openclaw/workspace/study-platform/forms/secondPDF-parsed.md', output);
console.log(`Parsed approximately ${qNum - 1} questions from secondPDF`);
console.log(`Written to forms/secondPDF-parsed.md`);