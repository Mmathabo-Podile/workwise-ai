# Workwise AI

Build a modern, responsive web application called AI Workplace Productivity Assistant, a professional SaaS-style platform that helps users complete workplace tasks efficiently using AI.

Design & Navigation

Create a polished dashboard with sidebar navigation, modern cards, intuitive icons, clean typography and responsive desktop/mobile layouts. Include a functional Light/Dark Mode toggle and a welcome dashboard with quick access to all AI tools.

Core AI Tools

1. Smart Email Generator: Users provide the email purpose, recipient and key details, then choose a tone (Formal, Friendly or Persuasive). Generate a personalised professional email with a subject line. Allow editing, copying and regeneration.

2. AI Research Assistant: Users enter a research question, topic or paste article text. Generate structured summaries, key insights and actionable recommendations. Clearly communicate uncertainty and avoid fabricated sources.

3. AI Workplace Chatbot: Create an interactive conversational assistant for workplace questions, problem-solving and productivity advice. Support contextual responses, follow-up questions and clearing conversation history.

CFREI Prompt Engineering

Integrate an optional AI Prompt Builder using Context, Format, Role, Examples and Instructions (CFREI). Provide five guided fields with brief explanations and examples. Automatically combine inputs into a structured prompt users can preview, edit and submit to any AI tool. Show original and enhanced prompts side by side.

AI Iteration & Creativity

Include Refine with AI actions: Shorten, Expand, Simplify and Change Tone, plus custom refinement instructions. Preserve original and revised outputs in a simple session-based version history for comparison.

Add Smart Tool Handoff to transfer research summaries directly into the Email Generator. Include three clickable example prompts for each AI tool.

Genuine AI Functionality

Use Lovable's supported AI integration for real, contextual and non-generic AI responses. Apply structured, task-specific instructions for each tool and maintain relevant context during refinement. Include loading states, error handling, editable outputs, copy and regenerate functionality. Never substitute hardcoded responses for AI generation.

Responsible AI

Display: "AI-generated content may contain errors. Verify important information before use. Do not enter confidential or sensitive workplace information."

Include an "AI-generated — review before use" reminder near outputs and a concise Responsible AI section explaining hallucinations, bias, privacy and human oversight.

Technical Requirements

Build a frontend-focused application without a custom backend, database, authentication or user accounts. Use temporary session state for conversations and outputs. Use secure managed AI integration if required, without exposing API keys in frontend code. Ensure all navigation, buttons, editing, copying, theme switching and AI features work correctly.

Implementation Priority: Deliver a cohesive, fully functional application using reusable components and minimal dependencies. Prioritise genuine AI responses, structured prompting, iteration and responsive user experience. Avoid unnecessary features, complex architecture and decorative elements that do not improve functionality.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/1a577167-2d7f-4f88-987a-9b98b4f7254b).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
