# ⚡ README AI Generator

[![npm version](https://img.shields.io/npm/v/readme-ai-gen-cli)](https://www.npmjs.com/package/readme-ai-gen-cli)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Auto-generate beautiful README files for any project using AI — one command, done.

## How it works

Point it at any project folder. It scans your files, reads your `package.json`, and uses Groq AI to write a complete professional README in seconds.

## Requirements

You need a free Groq API key. Get one at **console.groq.com** — it takes 1 minute and is completely free.

## Installation npm install -g readme-ai-gen-cli
## Usage

Set your Groq API key first:

**Windows:** set GROQ_API_KEY=your_key_here
**Mac/Linux:** export GROQ_API_KEY=your_key_here
Then run it in any project folder:npx readme-ai-gen-cli .
A `README.md` will be generated in that folder instantly.

## License

MIT