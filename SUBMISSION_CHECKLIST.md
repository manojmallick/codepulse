# Devpost Submission Checklist — CodePulse

**Deadline:** July 13, 2026, 5:00pm PDT

Complete every item below before submitting.

---

## Before Submission

- [ ] Confirm Netherlands eligibility at https://slackhack.devpost.com/rules
- [ ] Slack app created at https://api.slack.com/apps from `manifest.json`
- [ ] `.env` file created from `.env.example` with real tokens
- [ ] Dependencies installed: `npm install`
- [ ] SigMap context generated: `node scripts/gen-context.js`
- [ ] MCP test passes: `npm run test:mcp -- "your demo question"`
- [ ] App is running: `npm start`
- [ ] `@CodePulse` mention works in a test Slack channel
- [ ] Demo video recorded (use `demo-script.md`)
- [ ] Screenshots taken of the Slack thread with the agent response

---

## Devpost Form Fields

### Project Title

CodePulse: Codebase Intelligence Inside Slack Conversations

### Tagline / One-Sentence Summary

A Slack agent that answers codebase questions directly in thread using SigMap's MCP server for grounded, file-cited responses.

### About / Description

Use the text from `submission.md`. Paste it into the Devpost description field.

### Video Link

- Upload to YouTube or Loom (unlisted is fine)
- Paste the public/unlisted URL here
- Keep video between 2 and 3 minutes

### Screenshots

Upload at least:

1. Screenshot of the Slack message: `@CodePulse what does searchSlackHistory do`
2. Screenshot of CodePulse's grounded response with file citations
3. Screenshot of the app settings or architecture diagram from `architecture.md`

### Code / Repository

If the repo is public, link it here. If private, make sure Devpost judges can access it on request.

### Technologies

List these in the Devpost technology field:

- Slack Bolt
- Model Context Protocol (MCP)
- SigMap
- Real-Time Search API (if implemented)
- Slack AI (if used for summarization)

---

## Final Review

- [ ] No placeholder text remains in `submission.md`
- [ ] Video is under 3 minutes
- [ ] Screenshots clearly show the Slack bot name "CodePulse"
- [ ] Response includes file/method citations
- [ ] Submission is submitted before 5:00pm PDT

---

## After Submitting

- [ ] Save the Devpost submission URL
- [ ] Keep the Slack app running in case judges want to test it
- [ ] Check email/Devpost notifications for judge questions
