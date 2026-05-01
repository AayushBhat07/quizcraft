# Google Forms Links

## Emerging Trends in Electronics
**Status:** ✅ Complete - 218 questions with answers
**Link:** _Create form manually using emerging-trends-form.md_
**Form ID:** _N/A - manual creation required_

### Chapter Breakdown:
- Chapter 1: Advanced Processors and Technology (40 questions, Q1-Q40)
- Chapter 2: Artificial Intelligence and Machine Learning (64 questions, Q41-Q104)
- Chapter 3: ESP32 Microcontroller (114 questions, Q105-Q219)

---

## Subject 2
**Status:** ⚠️ Partial - 168 questions extracted (of 623 expected)
**Note:** The second PDF extraction was severely corrupted due to two-column OCR issues. Only 220 questions were extracted from the PDF, and 168 of those could be parsed into usable format. Many questions have OCR artifacts in the text.
**Link:** _Create form manually using subject2-form.md_
**Form ID:** _N/A - manual creation required_

### Chapter Breakdown (extracted):
- Chapter 1: Advanced Processors and Technology (49 questions extracted, 218 expected)
- Chapter 2: Smart Manufacturing Processes and Tools (29 questions extracted, 104 expected)
- Chapter 3: Next Generation Telecom Network (33 questions extracted, 92 expected)
- Chapter 4: Industrial IoT and Immersive Technologies (34 questions extracted, 98 expected)
- Chapter 5: Drone Systems and Applications (23 questions extracted, 111 expected)

---

# Google Forms Creation Instructions

## Method 1: Manual Copy-Paste

1. Go to [forms.google.com](https://forms.google.com)
2. Create a new form titled "[Subject Name] - Quiz"
3. For each question in the `.md` file:
   - Click "Add question" → Select "Multiple choice"
   - Copy the question text (after "Question N:") into the question field
   - Add options A, B, C, D from the corresponding lines
   - Mark the correct answer (indicated by `*` prefix in the file)

## Method 2: Google Forms API (with Service Account)

If you have OAuth credentials or a service account:

```javascript
// Example using Google Forms API
const form = { title: 'Emerging Trends in Electronics - Quiz' };
// Use forms.batchUpdate to add questions
```

## Option Format in Markdown Files

Each question block in the `.md` files:
```
Question N: [question text]
*A) [correct option - marked with *]
B) [option B]
C) [option C]
D) [option D]
Answer: [letter]
Topic: [chapter name]
---
```

The `*` prefix on option A indicates the correct answer. In Google Forms, select the corresponding radio button to mark it as correct.
