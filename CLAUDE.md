# Homebrewery - Claude Development Guide

## Project Overview

Homebrewery is a full-stack web application for creating D&D content using Markdown with authentic styling. Users write markdown, see instant preview, save to cloud, and export as PDF.

Architecture: React frontend (CodeMirror editor + iFrame preview) + Express backend + MongoDB persistence.

Core principle: Client-side rendering only. Server never executes user markdown. This prevents malicious input from crashing server and enables horizontal scaling.

## Stack

Frontend: React, CodeMirror v6, Vite build tool
Backend: Express.js, Node.js, MongoDB
Rendering: Marked.js (Markdown parser with custom extensions)
Styling: LESS preprocessor, CSS variables, inline styles via {{ }} syntax
Tests: Jest (run with `npm test`)

## Key Files

shared/markdown.js - All markdown parsing, tokenizers, renderers, extensions. Client and server both use this.
client/homebrew/navbar/print.navitem.jsx - PDF export button
client/homebrew/renderer/ - iFrame preview component
server/app.js - Route definitions and middleware
server/homebrew.api.js - Brew CRUD endpoints (POST /api/brew, GET /api/brew/:id, etc)
themes/phb/phb.less - Main theme stylesheet
docs/ - Architecture, rendering system, philosophy, limitations

## Common Tasks

### Add a Markdown Extension
1. In shared/markdown.js, create tokenizer that detects pattern
2. Create renderer that outputs HTML
3. Register with Marked.use({ extensions: [extension] })
4. Add CSS to themes/phb/phb.less
5. Write test in tests/markdown.*.spec.js
See docs/RENDERING_SYSTEM.md for detailed example (Obsidian callouts).

### Create New API Endpoint
1. Add route in server/app.js (app.get, app.post, etc)
2. Implement logic in server/homebrew.api.js or create new file
3. Database operations via MongoDB models in server/homebrew.model.js
4. Test with API test suite
5. Document in PR what the endpoint does

### Modify Theme/Styling
1. Edit themes/phb/phb.less (or other theme)
2. Use CSS variables for colors/sizes
3. Test in browser and print preview (Cmd+P / Ctrl+P)
4. CSS masks don't work in PDF - use border-radius instead

### Run Tests
npm test - Run Jest test suite
npm test -- --watch - Watch mode
npm test -- src/specific.spec.js - Run specific test file

### Start Local Dev
npm install - Install dependencies (requires Node v16+, MongoDB running locally)
npm start - Start dev server (http://localhost:8000)
NODE_ENV=local - Must be set for local development

## Code Conventions

Naming: Use camelCase for variables/functions, PascalCase for React components.
Extensions: .jsx for React components, .js for utilities, .less for styles.
Imports: shared/markdown.js is shared between client and server (no import cycles).
No server-side markdown execution: Never pass user markdown through Marked.js on server.
Modular: Keep functions small and focused.

## Do's

DO create extensions in shared/markdown.js for markdown features.
DO add CSS to themes for styling extensions.
DO test in browser preview AND print preview.
DO write tests for new features.
DO reference docs/ when unclear about philosophy.
DO use CSS variables for theme customization.
DO keep PRs focused on single feature/fix.

## Don'ts

DON'T execute user markdown on server - violates core principle.
DON'T create public render API - rejected historically (issue #2264).
DON'T use CSS masks for print-critical styling (doesn't work in PDF).
DON'T break backwards compatibility without discussion.
DON'T add large dependencies without justification.
DON'T commit without running npm test and npm run verify.

## Architecture Decisions

Client-side rendering: User's browser parses markdown, not server.
iFrame for preview: CSS isolation, easy content capture for print.
Shared markdown parser: Consistency between client and server.
No native PDF: Users print via browser (works everywhere).
No plugin system: Extensions are built-in, users can fork.

Why? See docs/DEVELOPMENT_PHILOSOPHY.md.

## Testing Checklist

Before submitting PR:
- npm test passes
- npm run verify passes (linting)
- Feature works in browser preview
- Feature works in print preview
- No console errors
- Edge cases handled

## Debugging

Browser: Open DevTools → Elements tab → Inspect iFrame content to see rendered HTML.
Parser: Add console.log in shared/markdown.js tokenizer to see tokens.
Styles: Check Computed tab in DevTools to see which styles apply.
Print: Use print preview (Cmd+P / Ctrl+P) to test PDF without printing.

## Important Limitations

No server PDF generation - Browser print only.
CSS masks fail in PDF - Use border-radius instead.
Large docs (5000+ lines) slow down - No virtual scrolling.
XSS surface exists - Accepted trade-off (issue #546).

See docs/KNOWN_LIMITATIONS.md for full list.

## Resources

docs/ARCHITECTURE.md - System structure, data flow, key files
docs/RENDERING_SYSTEM.md - How Marked.js works, extensions, implementation
docs/DEVELOPMENT_PHILOSOPHY.md - Why core decisions were made
docs/KNOWN_LIMITATIONS.md - Constraints and trade-offs
.github/pull_request_template.md - PR guidelines
contributing.md - General contribution guidelines
changelog.md - Recent changes

## Git Workflow

Branch from master
Create focused PRs (small, single feature)
Reference related issues (#XXXX)
Squash or rebase if needed
Don't force push
Wait for review before merge

## Local Environment Requirements

Node.js v16+ (check with node --version)
MongoDB running locally (mongod command)
npm or yarn
TEXT EDITOR: VS Code recommended (has good Vite integration)

## Questions?

Check the docs/ folder first - answers are likely there.
If not found, check issues on GitHub (especially #2264, #3190, #3827, #546).
Ask in PR comments or GitHub discussions.
