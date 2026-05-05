#!/usr/bin/env node
import Groq from "groq-sdk";
import fs from "fs";
import path from "path";
import os from "os";
import readline from "readline";

const CONFIG_PATH = path.join(os.homedir(), ".readme-ai-gen.json");

function loadConfig() {
  if (fs.existsSync(CONFIG_PATH)) {
    return JSON.parse(fs.readFileSync(CONFIG_PATH, "utf8"));
  }
  return {};
}

function saveConfig(config) {
  fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2));
}

function askQuestion(query) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  return new Promise((resolve) =>
    rl.question(query, (ans) => {
      rl.close();
      resolve(ans.trim());
    })
  );
}

async function getApiKey() {
  // 1. Check environment variable first
  if (process.env.GROQ_API_KEY) return process.env.GROQ_API_KEY;

  // 2. Check saved config
  const config = loadConfig();
  if (config.GROQ_API_KEY) return config.GROQ_API_KEY;

  // 3. Ask user
  console.log("\n🔑 Groq API key not found.");
  console.log("   Get a free key at: https://console.groq.com/keys\n");
  const key = await askQuestion("   Paste your Groq API key: ");

  if (!key) {
    console.error("❌ No API key provided. Exiting.");
    process.exit(1);
  }

  // Save for next time
  saveConfig({ GROQ_API_KEY: key });
  console.log("   ✅ Key saved! You won't need to enter it again.\n");

  return key;
}

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

async function generateReadme(projectInfo, apiKey) {
  const client = new Groq({ apiKey });

  const prompt = `You are a senior developer and technical writer at a top tech company. Generate a stunning, professional README.md for this project that would impress any developer on GitHub.
Project files: ${projectInfo.files.join(", ")}
Package.json: ${projectInfo.packageJson ? JSON.stringify(projectInfo.packageJson, null, 2) : "Not found"}
Include these sections in this order:
1. A big title with a relevant emoji
2. Badges for version, license, npm downloads
3. A one-line powerful description
4. A "Why use this?" section with 3 bullet points
5. Features section with emojis for each feature
6. Prerequisites section
7. Installation with code blocks
8. Usage with clear code examples
9. Configuration section if relevant
10. Contributing guide
11. License
Rules:
- Use emojis generously throughout
- Make descriptions exciting and professional
- Use proper markdown tables where relevant
- Add a demo section placeholder with a GIF placeholder
- Make it look like a top GitHub project`;

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

  const apiKey = await getApiKey();

  console.log(`🤖 Generating README...\n`);

  try {
    const projectInfo = await scanProject(absolutePath);
    console.log(`✅ Found ${projectInfo.files.length} files`);

    const readme = await generateReadme(projectInfo, apiKey);

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
