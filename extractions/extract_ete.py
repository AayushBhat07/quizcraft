#!/usr/bin/env python3
"""Robust ETE MCQ extractor. Handles ALL formats:
- "1. Question text" (number.dot space)
- "1 Question text" (number space)
- "1" standalone + text on next line(s)
- "Sr.\nMCQ\nNo" split across lines
- "Sr. No. MCQ"
"""
import re, json

TEXT_FILE  = "/Users/aayush07/.openclaw/workspace/study-platform/extractions/ete-full.txt"
OUTPUT_FILE = "/Users/aayush07/.openclaw/workspace/study-platform/extractions/ete-questions.json"

with open(TEXT_FILE) as f:
    raw = f.read()

pages = re.split(r'\n{3,}=== PAGE (\d+) ===\n', raw)
page_data = {}
for i in range(1, len(pages), 2):
    if i+1 < len(pages):
        page_data[int(pages[i])] = pages[i+1]

# CORRECT answer key from Appendix C (pages 238-239)
answer_key = {
    1: {"1":"B","2":"B","3":"B","4":"C","5":"D","6":"D","7":"C","8":"B","9":"B","10":"B","11":"D","12":"A","13":"B","14":"C","15":"B","16":"C","17":"A","18":"C","19":"D","20":"C"},
    2: {"1":"B","2":"B","3":"A","4":"A","5":"B","6":"A","7":"C","8":"B","9":"B","10":"A","11":"D","12":"A","13":"C","14":"C","15":"A","16":"B","17":"A","18":"B","19":"C","20":"C"},
    3: {"1":"D","2":"B","3":"A","4":"C","5":"A","6":"B","7":"A","8":"B","9":"D","10":"A","11":"A","12":"A","13":"A","14":"B","15":"B","16":"C","17":"C","18":"B","19":"B","20":"A"},
    4: {"1":"B","2":"D","3":"C","4":"B","5":"B","6":"B","7":"D","8":"C","9":"C","10":"C","11":"B","12":"C","13":"A","14":"C","15":"C","16":"A","17":"B","18":"C","19":"C","20":"A"},
    5: {"1":"A","2":"B","3":"A","4":"C","5":"B","6":"B","7":"A","8":"C","9":"B","10":"C","11":"C","12":"A","13":"B","14":"A","15":"B","16":"A","17":"C","18":"A","19":"A","20":"A"},
}

UNIT_RANGES = {
    1: range(27, 38),
    2: range(38, 70),
    3: range(70, 111),
    4: range(111, 149),
    5: range(149, 228),
}

UNIT_NAMES = {
    1: 'Unit-I: Advanced Processors and Technology',
    2: 'Unit-II: Smart Manufacturing Processes and Tools',
    3: 'Unit-III: Next Generation Telecom Network',
    4: 'Unit-IV: IIoT and Immersive Technologies',
    5: 'Unit-V: Drone Systems and Applications',
}
UNIT_IDS = {
    1: 'unit-1-advanced-processors',
    2: 'unit-2-smart-manufacturing',
    3: 'unit-3-next-gen-telecom',
    4: 'unit-4-iiot-immersive',
    5: 'unit-5-drone-systems',
}

def parse_opts(opt_lines):
    opts, cur, parts = {}, None, []
    for line in opt_lines:
        line = line.strip()
        m = re.match(r'^([A-D])\.\s+(.*)', line)
        if m:
            if cur:
                opts[cur] = ' '.join(parts).strip()
            cur, parts = m.group(1), [m.group(2)]
        elif cur:
            if re.match(r'^\d+\.\s', line) or re.match(r'^\d+\s', line):
                opts[cur] = ' '.join(parts).strip()
                cur, parts = None, []
            elif re.match(r'^[A-D]\)\s', line):
                opts[cur] = ' '.join(parts).strip()
                m2 = re.match(r'^([A-D])\)\s+(.*)', line)
                cur, parts = m2.group(1), [m2.group(2)]
            else:
                parts.append(line)
    if cur:
        opts[cur] = ' '.join(parts).strip()
    return opts

def extract_from_section(section_text):
    mcqs = []
    lines = section_text.split('\n')
    i = 0
    while i < len(lines):
        line = lines[i].strip()
        if not line:
            i += 1
            continue

        q_num, q_parts = None, []

        # Pattern A: "1. Question text"
        m = re.match(r'^(\d+)\.\s+([A-Z][^.].*)', line)
        if m:
            q_num, q_parts = int(m.group(1)), [m.group(2)]
            i += 1
        else:
            # Pattern B: "1 Question text"
            m = re.match(r'^(\d+)\s+([A-Z][^a-z].*)', line)
            if m:
                q_num, q_parts = int(m.group(1)), [m.group(2)]
                i += 1
            else:
                # Pattern C: standalone "1"
                m = re.match(r'^(\d+)\s*$', line)
                if m:
                    q_num = int(m.group(1))
                    i += 1
                else:
                    i += 1
                    continue

        if not q_num or q_num > 25:
            continue

        # Collect question body until options start
        while i < len(lines):
            next_line = lines[i].strip()
            if not next_line:
                i += 1
                continue
            if re.match(r'^[A-D]\.\s', next_line):
                break
            m2 = re.match(r'^(\d+)\.\s', next_line)
            m3 = re.match(r'^(\d+)\s', next_line)
            if (m2 or m3) and int((m2 or m3).group(1)) <= 25:
                break
            q_parts.append(next_line)
            i += 1

        full_text = ' '.join(q_parts).strip()
        if not full_text:
            continue

        # Collect option lines
        opt_lines = []
        while i < len(lines):
            opt_line = lines[i].strip()
            if re.match(r'^[A-D]\.\s', opt_line):
                opt_lines.append(opt_line)
                i += 1
            else:
                break

        options = parse_opts(opt_lines)
        if full_text and len(options) >= 3 and q_num <= 25:
            mcqs.append({'q_num': q_num, 'text': full_text, 'options': options})

    return mcqs

all_questions = {u: [] for u in [1, 2, 3, 4, 5]}

for pnum in sorted(page_data.keys()):
    txt = page_data[pnum]

    detected_unit = 0
    for unit_num, pr in UNIT_RANGES.items():
        if pnum in pr:
            detected_unit = unit_num
            break
    if not detected_unit:
        continue

    clean = re.sub(r'Emerging Trends in Electronics\s*316337', '', txt)

    # Strategy: find ALL "Sr. MCQ" patterns directly in original clean text
    # Pattern variants to find the MCQ section start
    mcq_patterns = [
        r'Sr\.(?:[\s\S]*?MCQ)',  # catches everything from Sr. to MCQ (including newlines)
    ]

    found_positions = []
    for pat in mcq_patterns:
        for m in re.finditer(pat, clean):
            found_positions.append(m.start())

    # Also check the normalized text for "Sr. MCQ" (newlines collapsed)
    norm = re.sub(r'\s*\n\s*', ' ', clean)
    for m in re.finditer(r'Sr\.\s*(?:No\.\s*)?(?:Sample\s+)?MCQ', norm):
        # Map normalized position back to clean
        # Walk clean, counting non-whitespace chars
        ni = 0
        for ci in range(len(clean)):
            if ci < len(norm) and clean[ci] == norm[ni]:
                if ni == m.start():
                    found_positions.append(ci)
                    break
                ni += 1

    # Remove duplicates and sort
    found_positions = sorted(set(found_positions))

    for start_pos in found_positions:
        section = clean[start_pos:]
        mcqs = extract_from_section(section)
        all_questions[detected_unit].extend(mcqs)

# Deduplicate
for u in all_questions:
    by_num = {}
    for q in all_questions[u]:
        if q['q_num'] not in by_num:
            by_num[q['q_num']] = q
    all_questions[u] = sorted(by_num.values(), key=lambda x: x['q_num'])

# Build JSON
chapters = []
qid = 1
for u in [1, 2, 3, 4, 5]:
    qs = all_questions[u]
    chapters.append({
        'id': UNIT_IDS[u],
        'name': UNIT_NAMES[u],
        'questions': [
            {
                'id': f'ete-q{qid+i}',
                'text': q['text'][:300],
                'options': q['options'],
                'correctAnswer': answer_key[u].get(str(q['q_num']), 'A'),
                'topic': UNIT_NAMES[u],
            }
            for i, q in enumerate(qs)
        ]
    })
    qid += len(qs)

subject = {
    'id': 'ete',
    'name': 'Emerging Trends in Electronics',
    'chapters': chapters
}

print('='*60)
for ch in chapters:
    print(f"  {ch['name']}: {len(ch['questions'])} questions")
total = sum(len(ch['questions']) for ch in chapters)
print(f"\nTotal: {total} questions\n")

for ch in chapters:
    if ch['questions']:
        q = ch['questions'][0]
        print(f"[{ch['name']}]")
        print(f"  Q: {q['text'][:70]}")
        print(f"  A: {q['options']}")
        print(f"  Ans: {q['correctAnswer']}\n")

with open(OUTPUT_FILE, 'w') as f:
    json.dump({'subject': subject}, f, indent=2)
print(f"Saved → {OUTPUT_FILE}")