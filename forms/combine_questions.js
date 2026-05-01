#!/usr/bin/env node
const fs = require('fs');

// Read both extraction files
const firstRaw = fs.readFileSync('/Users/aayush07/.openclaw/workspace/study-platform/forms/emerging-trends-form.md', 'utf-8');
const secondRaw = fs.readFileSync('/Users/aayush07/.openclaw/workspace/study-platform/forms/subject2-form.md', 'utf-8');

// Chapter map for secondPDF
const secondChapters = [
  { name: 'Advanced Processors and Technology', start: 1, end: 218 },
  { name: 'Smart Manufacturing Processes and Tools', start: 219, end: 322 },
  { name: 'Next Generation Telecom Network', start: 323, end: 414 },
  { name: 'Industrial IoT and Immersive Technologies', start: 415, end: 512 },
  { name: 'Drone Systems and Applications', start: 513, end: 623 },
];

function getSecondChapter(qNum) {
  for (const ch of secondChapters) {
    if (qNum >= ch.start && qNum <= ch.end) return ch.name;
  }
  return 'Advanced Processors and Technology';
}

// Parse questions from a form file
function parseQuestions(text, startOffset = 0) {
  const blocks = text.split(/^Question \d+:/m).filter(b => b.trim());
  const questions = [];
  
  for (const block of blocks) {
    const lines = block.trim().split('\n');
    const questionText = lines[0]?.trim().substring(0, 250) || '';
    
    const optMatch = block.match(/\*?([A-D])\)\s*([^\n*][^\n]*)/gi) || [];
    const options = { A: '', B: '', C: '', D: '' };
    
    for (const opt of optMatch) {
      const m = opt.match(/([A-D])\)\s*(.+)/i);
      if (m) {
        options[m[1].toUpperCase()] = m[2].trim().substring(0, 80);
      }
    }
    
    const ansMatch = block.match(/Answer:\s*([A-D])/i);
    const topMatch = block.match(/Topic:\s*(.+)/i);
    
    if (questionText && ansMatch) {
      questions.push({
        text: questionText.replace(/[^\x20-\x7E\s\-\(\)\.\,]/g, '').trim(),
        options,
        answer: ansMatch[1].toUpperCase(),
        topic: topMatch ? topMatch[1].trim() : 'Unknown'
      });
    }
  }
  
  return questions;
}

const firstQuestions = parseQuestions(firstRaw);
const secondQuestions = parseQuestions(secondRaw, 218);

console.log(`First PDF: ${firstQuestions.length} questions`);
console.log(`Second PDF: ${secondQuestions.length} questions`);

// Simple deduplication: normalize text and check similarity
function normalize(str) {
  return str.toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .substring(0, 50);
}

// Check for duplicates between sets
let dupes = 0;
const firstNorm = new Set(firstQuestions.map(q => normalize(q.text)));

const uniqueSecond = secondQuestions.filter(q => {
  const norm = normalize(q.text);
  if (firstNorm.has(norm)) {
    dupes++;
    return false;
  }
  return true;
});

console.log(`Duplicates between sets: ${dupes}`);
console.log(`Unique secondPDF questions: ${uniqueSecond.length}`);

// Combine all unique questions
const allQuestions = [...firstQuestions, ...uniqueSecond];

// Assign global sequential IDs and organize by chapter
const chaptersMap = {};
let globalId = 1;

// Chapter order
const chapterOrder = [
  'Advanced Processors and Technology',
  'AI and Machine Learning',
  'ESP32 Microcontroller',
  'Smart Manufacturing Processes and Tools',
  'Next Generation Telecom Network',
  'Industrial IoT and Immersive Technologies',
  'Drone Systems and Applications',
];

for (const name of chapterOrder) {
  chaptersMap[name] = {
    id: name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-'),
    name,
    questions: []
  };
}

// Assign chapters based on topic field
for (const q of allQuestions) {
  const topic = q.topic || 'Advanced Processors and Technology';
  if (chaptersMap[topic]) {
    chaptersMap[topic].questions.push({
      id: `ete-q${globalId}`,
      text: q.text,
      options: q.options,
      correctAnswer: q.answer,
      topic: q.topic
    });
    globalId++;
  }
}

const subject = {
  id: 'ete',
  name: 'Emerging Trends in Electronics',
  chapters: chapterOrder.map(name => chaptersMap[name]).filter(c => c.questions.length > 0)
};

const totalQs = subject.chapters.reduce((s, c) => s + c.questions.length, 0);
console.log(`\nTotal unique questions: ${totalQs}`);
console.log(`Total chapters: ${subject.chapters.length}`);

for (const ch of subject.chapters) {
  console.log(`  ${ch.name}: ${ch.questions.length} questions`);
}

fs.writeFileSync('/Users/aayush07/.openclaw/workspace/study-platform/data/questions.json', JSON.stringify({ subject }, null, 2));
console.log('\nWritten to data/questions.json');