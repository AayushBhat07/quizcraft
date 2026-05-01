#!/usr/bin/env node
const fs = require('fs');

// Read both extraction files
const firstRaw = fs.readFileSync('/Users/aayush07/.openclaw/workspace/study-platform/forms/emerging-trends-form.md', 'utf-8');
const secondRaw = fs.readFileSync('/Users/aayush07/.openclaw/workspace/study-platform/forms/subject2-form.md', 'utf-8');

// Chapter map for secondPDF (Q219-Q623 in full dataset, based on original numbering)
const secondChapterBoundaries = [
  { name: 'Advanced Processors and Technology', qStart: 219, qEnd: 322 },
  { name: 'Smart Manufacturing Processes and Tools', qStart: 323, qEnd: 414 },
  { name: 'Next Generation Telecom Network', qStart: 415, qEnd: 512 },
  { name: 'Industrial IoT and Immersive Technologies', qStart: 513, qEnd: 612 },
  { name: 'Drone Systems and Applications', qStart: 613, qEnd: 700 },
];

function getSecondChapter(qNum) {
  for (const ch of secondChapterBoundaries) {
    if (qNum >= ch.qStart && qNum <= ch.qEnd) return ch.name;
  }
  return 'Advanced Processors and Technology';
}

function getFirstChapter(topic) {
  if (topic.includes('Processors')) return 'Advanced Processors and Technology';
  if (topic.includes('Artificial Intelligence') || topic.includes('AI and ML')) return 'AI and Machine Learning';
  if (topic.includes('ESP32')) return 'ESP32 Microcontroller';
  return 'Advanced Processors and Technology';
}

function normalize(str) {
  return str.toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .substring(0, 60);
}

function parseQuestions(text, startQNum = 1) {
  const blocks = text.split(/^Question \d+:/m).filter(b => b.trim());
  const questions = [];
  
  for (let i = 0; i < blocks.length; i++) {
    const block = blocks[i];
    const lines = block.trim().split('\n');
    const questionText = lines[0]?.trim().substring(0, 250) || '';
    
    const optMatch = block.match(/([A-D])\)\s*([^\n*][^\n]*)/gi) || [];
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
      const topic = topMatch ? topMatch[1].trim() : 'Unknown';
      questions.push({
        qNum: startQNum + i,
        text: questionText.replace(/[^\x20-\x7E\s\-\(\)\.\,]/g, '').trim(),
        options,
        answer: ansMatch[1].toUpperCase(),
        topic,
        chapter: topMatch ? getFirstChapter(topic) : 'Advanced Processors and Technology'
      });
    }
  }
  
  return questions;
}

// Parse firstPDF (218 questions, Q1-Q218)
const firstQuestions = parseQuestions(firstRaw, 1);
// Assign correct chapters based on topic
firstQuestions.forEach(q => {
  if (q.topic.includes('Processors')) q.chapter = 'Advanced Processors and Technology';
  else if (q.topic.includes('Artificial Intelligence')) q.chapter = 'AI and Machine Learning';
  else if (q.topic.includes('ESP32')) q.chapter = 'ESP32 Microcontroller';
});

// Parse secondPDF (Q219 onwards)
const secondQuestions = parseQuestions(secondRaw, 219);
// Assign chapters based on question number
secondQuestions.forEach(q => {
  q.chapter = getSecondChapter(q.qNum);
});

// Deduplicate: normalize and check similarity
const firstNorm = new Set(firstQuestions.map(q => normalize(q.text)));
const uniqueSecond = [];
let dupes = 0;

for (const q of secondQuestions) {
  const norm = normalize(q.text);
  if (firstNorm.has(norm)) {
    dupes++;
  } else {
    uniqueSecond.push(q);
  }
}

console.log(`First PDF: ${firstQuestions.length} questions`);
console.log(`Second PDF: ${secondQuestions.length} questions total, ${dupes} duplicates, ${uniqueSecond.length} unique`);
console.log(`Combined total: ${firstQuestions.length + uniqueSecond.length} questions`);

// Combine
const allQuestions = [...firstQuestions, ...uniqueSecond];

// Chapter order and assembly
const chapterOrder = [
  'Advanced Processors and Technology',
  'AI and Machine Learning',
  'ESP32 Microcontroller',
  'Smart Manufacturing Processes and Tools',
  'Next Generation Telecom Network',
  'Industrial IoT and Immersive Technologies',
  'Drone Systems and Applications',
];

const chaptersMap = {};
for (const name of chapterOrder) {
  chaptersMap[name] = {
    id: name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-'),
    name,
    questions: []
  };
}

let globalId = 1;
for (const q of allQuestions) {
  if (chaptersMap[q.chapter]) {
    chaptersMap[q.chapter].questions.push({
      id: `ete-q${globalId}`,
      text: q.text,
      options: q.options,
      correctAnswer: q.answer,
      topic: q.chapter
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
console.log(`\nFinal: ${totalQs} questions across ${subject.chapters.length} chapters:`);
for (const ch of subject.chapters) {
  console.log(`  ${ch.name}: ${ch.questions.length} questions`);
}

fs.writeFileSync('/Users/aayush07/.openclaw/workspace/study-platform/data/questions.json', JSON.stringify({ subject }, null, 2));
console.log('\nWritten to data/questions.json');