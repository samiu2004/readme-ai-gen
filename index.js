#!/usr/bin/env node
import Groq from "groq-sdk";
import fs from "fs";
import path from "path";

const client = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

async function scanProject(projectPath) {
  const info = { files: [], packageJson: null };
  const items = fs.readdirSync(projectPath);
  for (const item of items) {
    if (item === "node_modules" || item === ".git") continue;
    info.files.push(item);
  }
  const pkgPath = path.join(projectPath, "package.json");
  if (fs.existsSync(pkgPath)) {
    info.packageJson = JSON.parse(fs.readFileSync(pkgPath, "utf8"));
  }
  return info;
}

async function generateReadme(projectInfo) {
  const prompt = `You are a technical writer. Generate a beautiful complete README.md for this project.
Project files: ${projectInfo.files.join(", ")}
Package.json: ${projectInfo.packageJson ? JSON.stringify(projectInfo.packageJson, null, 2) : "Not found"}
Include: title with emoji, badges, description, features, installation, usage, contributing, license.`;

  const completion = await client.chat.completions.create({
    messages: [{ role: "user", content: prompt }],
    model: "llama-3.3-70b-versatile",
    max_tokens: 2000,
  });
  return completion.choices[0].message.content;
}

async function main() {
  const projectPath = process.argv[2] || ".";
  const absolutePath = path.resolve(projectPath);
  console.log(`\n⚡ readme-ai-gen`);
  console.log(`📁 Scanning: ${absolutePath}`);
  console.log(`🤖 Generating README...\n`);
  if (!process.env.GROQ_API_KEY) {
    console.error("❌ GROQ_API_KEY not set.");
    process.exit(1);
  }
  try {
    const projectInfo = await scanProject(absolutePath);
    console.log(`✅ Found ${projectInfo.files.length} files`);
    const readme = await generateReadme(projectInfo);
    const outputPath = path.join(absolutePath, "README.md");
    fs.writeFileSync(outputPath, readme);
    console.log(`✅ README.md generated!`);
    console.log(`📄 Saved to: ${outputPath}\n`);
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
}

main();