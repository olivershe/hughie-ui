## FEATURE:
This project aims to build a React + Tailwind single page app that serves as a chat interface for an AI assistant. Key features to implement:
- Dynamic radial background gradients for each domain (legal, finance, medical, agent) with matching dark‑mode variants.
- A collapsible sidebar listing conversations with search, rename, delete and pin options.
- Mode buttons positioned under the chat input. Selecting a mode updates the theme and highlights the active badge.
- Reusable `.glass` styling for buttons, cards and containers defined in `src/index.css`.
- Chat interface streams responses from the OpenAI Chat API using model `gpt-4.1-2025-04-14`. Responses display typing animation, optional reasoning details and confidence badges.
- Conversations and dark mode preference persisted in `localStorage`.
- Startup prompt asking for an OpenAI API key (stored only in memory).

## EXAMPLES:
The `examples/` folder contains reference files:
- `openai-response.json` – sample JSON object returned by the API.
- `conversation.json` – example of a conversation object saved in `localStorage`.
- `fetch-openai.js` – minimal script illustrating how to call the Chat API with streaming enabled.

## DOCUMENTATION:
- [React documentation](https://reactjs.org/)
- [Tailwind CSS documentation](https://tailwindcss.com/)
- [eventsource-parser](https://github.com/EventSource/eventsource-parser)
- [OpenAI Chat API](https://platform.openai.com/docs/api-reference/chat)

## OTHER CONSIDERATIONS:
- Global styles (background gradients, `.glass` class and subtle overlay pattern) live in `src/index.css`.
- Deployment is configured for GitHub Pages via the `homepage` field in `package.json`.
- Automated tests use `@testing-library/react` and Jest (see `src/App.test.js` and `src/__tests__/useTypewriter.test.js`).
- API interactions require network access to OpenAI.
