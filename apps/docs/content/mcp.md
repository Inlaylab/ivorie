---
title: MCP server
description: Let AI coding tools browse and add Ivorie components. Coming soon.
section: guide
order: 4
soon: true
---

The MCP server is not out yet. It is planned for the AI-ready release. See the [roadmap](roadmap).

## What it will do

MCP (Model Context Protocol) lets an AI coding tool, such as Claude Code, Cursor or VS Code Copilot, talk to other programs. With the Ivorie MCP server, your assistant can:

- List the components and read their docs and examples.
- Add a component to your app with the right import paths.
- Pick the right selectors (`iv-tabs`, `ivButton`) instead of guessing.

The same release adds an `AGENTS.md` guide that `ivorie init` writes into your app.

## Until then

Ask your assistant to use the CLI. It works in any terminal:

```bash
npx ivorie add button
```

See [CLI](docs/cli) for every command.
