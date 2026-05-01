import { stitch } from "@google/stitch-sdk";

// Stitch API Key - set via environment variable STITCH_API_KEY
const STITCH_API_KEY = process.env.STITCH_API_KEY || "";
const PROJECT_ID = "quizcraft-001";

const screens = [
  {
    name: "home-screen",
    prompt: `Generate a dark-themed study quiz home page with subject cards for "Emerging Trends in Electronics" and "Subject 2", a name input field, "Start Quiz" button, and a mini leaderboard preview. Dark theme, modern UI, indigo accent color. Desktop layout.`
  },
  {
    name: "quiz-screen",
    prompt: `Generate a dark-themed quiz taking page with a question card showing 4 multiple choice options (A/B/C/D), a progress bar showing question 15/220, a timer showing 14:32, and a dark blue submit button. Dark theme, modern UI, indigo accent. Desktop layout.`
  },
  {
    name: "results-screen",
    prompt: `Generate a dark-themed results page showing score 85% with a circular progress indicator, topic breakdown bars, wrong answers section with correct answers highlighted in green, and buttons for "Retest Weak Topics" and "Full Subject Retest". Dark theme, modern UI, indigo accent. Desktop layout.`
  },
  {
    name: "retest-screen",
    prompt: `Generate a dark-themed retest page showing only 25 questions from weak topics, with a progress indicator and score tracking. Dark theme, modern UI, indigo accent. Desktop layout.`
  },
  {
    name: "leaderboard-screen",
    prompt: `Generate a dark-themed leaderboard page with ranked table showing rank 1-10, name, score 85%, subject, date, with weekly/all-time toggle tabs. Dark theme, modern UI, indigo accent. Desktop layout.`
  },
  {
    name: "progress-dashboard",
    prompt: `Generate a dark-themed progress dashboard with per-chapter bar charts, a weakness heatmap with red/yellow/green per topic, and improvement trend line chart. Dark theme, modern UI, indigo accent. Desktop layout.`
  }
];

async function main() {
  console.log("🎨 QuizCraft - Stitch Design Generator\n");
  console.log("⏳ This will take several minutes...\n");

  const project = stitch.project(PROJECT_ID);

  let results = [];
  for (const screen of screens) {
    try {
      console.log(`🎨 Generating: ${screen.name}...`);
      const s = await project.generate(screen.prompt, "DESKTOP");
      const imageUrl = await s.getImage();
      const htmlUrl = await s.getHtml();
      const screenshotUrl = s.screenshot?.downloadUrl || imageUrl;
      console.log(`✅ ${screen.name} done!`);
      console.log(`   Image: ${imageUrl}`);
      console.log(`   HTML: ${htmlUrl}\n`);
      results.push({ name: screen.name, image: imageUrl, html: htmlUrl, screen: s });
    } catch (err) {
      console.error(`❌ ${screen.name} failed: ${err.message}\n`);
    }
  }

  console.log("\n🎉 ========== SUMMARY ==========");
  console.log("Generated designs:");
  for (const r of results) {
    console.log(`\n📱 ${r.name}:`);
    console.log(`   Image: ${r.image}`);
    console.log(`   HTML: ${r.html}`);
  }

  // Write results to file
  const fs = await import('fs');
  const outputPath = '/Users/aayush07/.openclaw/workspace/study-platform/design/stitch-assets.md';

  let md = `# QuizCraft Stitch Design Assets\n\n`;
  md += `**Project ID:** ${PROJECT_ID}\n\n`;
  md += `**Generated:** ${new Date().toISOString()}\n\n`;
  md += `## Screens\n\n`;

  for (const r of results) {
    md += `### ${r.name}\n\n`;
    md += `- **Image:** ${r.image}\n`;
    md += `- **HTML:** ${r.html}\n\n`;
  }

  fs.writeFileSync(outputPath, md);
  console.log(`\n📝 Assets written to: ${outputPath}`);
}

main().catch(err => {
  console.error("❌ Fatal error:", err.message);
  process.exit(1);
});