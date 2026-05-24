# project_architecture.md — UIGen (Neato Component Studio)

> For general tech patterns, see @~/.claude/tech_architecture.md

---

## Project Overview

UIGen is an AI-powered React component generator. Users describe a UI in plain English,
Claude generates the component code, and a live preview renders instantly in the browser.
Branded as **Neato Component Studio** with a dark green / cream / orange theme.

**What success looks like:**
- User types a prompt → Claude generates working React/JSX → Preview renders in real-time
- Code is editable via a built-in code editor with file tree
- Anonymous use works; authenticated users get projects saved to the database

---

## Tech Stack

| Layer        | Choice                        | Notes                                         |
|--------------|-------------------------------|-----------------------------------------------|
| Framework    | Next.js 15 (App Router)       | React 19, Turbopack in dev                    |
| Language     | TypeScript                    |                                               |
| Styling      | Tailwind CSS v4               | Non-standard colors via inline `style` props  |
| AI SDK       | Vercel AI SDK (`ai` package)  | `streamText`, `useChat`, `@ai-sdk/anthropic`  |
| Models       | Claude Sonnet 4.6             | Default; Haiku available as alternative       |
| Database     | Prisma + SQLite               | `prisma/dev.db`, client at `src/generated/`   |
| Auth         | Custom JWT (`jose`)           | HTTP-only `auth-token` cookie, 7-day expiry   |
| Preview      | `@babel/standalone`           | In-browser JSX transpilation inside an iframe |
| Tests        | Vitest                        |                                               |

---

## Key File Locations

```
src/
  app/
    page.tsx                        → Entry point, loads MainContent
    main-content.tsx                → Root layout: header + single workspace panel
    api/chat/route.ts               → POST /api/chat — streams AI response
    api/auth/*/route.ts             → Login / register / logout endpoints
  components/
    chat/ChatInterface.tsx          → Message list + input form
    editor/CodeEditor.tsx           → Monaco-style code editor
    editor/FileTree.tsx             → Virtual file tree sidebar
    preview/PreviewFrame.tsx        → iframe preview of generated components
    HeaderActions.tsx               → Sign In / Sign Up / user menu in header
  lib/
    file-system.ts                  → VirtualFileSystem class (in-memory, no disk I/O)
    provider.ts                     → getLanguageModel() — returns Anthropic or MockModel
    auth.ts                         → JWT sign/verify, session helpers
    prisma.ts                       → Prisma client singleton
    contexts/
      file-system-context.tsx       → Client-side VFS state + handleToolCall
      chat-context.tsx              → useChat wrapper, passes model + files to API
    tools/
      str-replace.ts                → str_replace_editor tool (create/view/edit VFS files)
      file-manager.ts               → file_manager tool (delete/rename/list VFS files)
    prompts/
      generation.tsx                → System prompt sent to Claude on every request
    transform/
      jsx-transformer.ts            → Builds srcdoc HTML for PreviewFrame iframe
prisma/
  schema.prisma                     → User + Project models
  dev.db                            → SQLite database (gitignored)
```

---

## Request Flow (Chat → Preview)

```
User types prompt in ChatInterface
  ↓
ChatContext (useChat) sends POST /api/chat
  body: { messages, files: VFS.serialize(), model, projectId }
  ↓
api/chat/route.ts
  - Reconstructs VirtualFileSystem from serialized files
  - Calls getLanguageModel(model) → anthropic("claude-sonnet-4-6") or MockModel
  - Calls streamText() with str_replace_editor + file_manager tools
  ↓
Claude streams response with tool calls
  ↓
Tool calls hit str_replace_editor / file_manager
  - Operate on in-memory VirtualFileSystem
  ↓
onFinish: saves messages + VFS to Project row (auth users only)
  ↓
Client receives stream → FileSystemContext updates
  ↓
PreviewFrame detects VFS change → jsx-transformer builds new srcdoc → iframe re-renders
```

---

## Data Models

### User
```
id        String   (cuid)
email     String   (unique)
password  String   (bcrypt hash)
projects  Project[]
createdAt DateTime
```

### Project
```
id        String   (cuid)
name      String
messages  String   (JSON array of AI SDK Message objects)
data      String   (JSON: Record<string, FileNode> — VFS snapshot)
userId    String?  (null = anonymous)
createdAt DateTime
updatedAt DateTime
```

---

## Virtual File System

`VirtualFileSystem` is **in-memory only** — nothing is written to disk.

- Serializes to `Record<string, FileNode>` (plain JSON) for wire transport and DB storage
- Each chat request reconstructs a fresh VFS from the serialized snapshot in the request body
- Claude's tools (`str_replace_editor`, `file_manager`) mutate this VFS during the stream
- On stream finish, the mutated VFS is serialized back and saved to the DB

---

## AI Tools Claude Can Call

| Tool               | Operations                              |
|--------------------|------------------------------------------|
| `str_replace_editor` | `create`, `view`, `str_replace`, `insert` on VFS files |
| `file_manager`       | `delete`, `rename`, `list` on VFS files  |

---

## Auth Flow

```
Register/Login → POST /api/auth/register or /api/auth/login
  → password hashed with bcrypt
  → JWT signed with jose (HS256)
  → Set as HTTP-only cookie: auth-token (7-day expiry)

getSession() → reads + verifies cookie → returns { userId }
Anonymous users: project saved to DB but not linked to a user;
  onFinish skips saving if no session
```

---

## Preview Rendering

`jsx-transformer.ts` (`createPreviewHTML`):
1. Takes all VFS files
2. Transpiles JSX → JS using `@babel/standalone` (runs in browser)
3. Builds an import map so `@/components/...` aliases resolve between virtual files
4. Wraps everything in a `srcdoc` HTML string injected into the `<iframe>` in `PreviewFrame`
5. Sandboxed — no access to the parent page

---

## Environment Variables

```
ANTHROPIC_API_KEY=sk-ant-...    # Required for real Claude responses
                                  # Without it: MockLanguageModel is used (hardcoded responses)
JWT_SECRET=...                  # Required for auth cookie signing
DATABASE_URL=file:./dev.db      # Prisma SQLite path
```

**Never commit `.env`** — it contains the real API key.

---

## MockLanguageModel (dev fallback)

When `ANTHROPIC_API_KEY` is missing, `provider.ts` returns `MockLanguageModel`.
It detects keywords ("form", "card", else defaults to counter) and plays back
hardcoded tool calls + component code. Useful for testing UI without burning API credits.

---

## Current Layout (main-content.tsx)

Single workspace — no comparison panels:
- **Left (35%)** — `ChatInterface` (ask a question)
- **Right (65%)** — `PreviewFrame` or `FileTree + CodeEditor` (toggled via Preview / Code tabs)
- Wrapped in one `FileSystemProvider` + `ChatProvider` (model: `claude-sonnet-4-6`)

---

## What "Done" Looks Like

✅ User types a prompt → component generated and visible in Preview tab
✅ Code tab shows generated files in file tree + editor
✅ Authenticated users have their project saved across sessions
✅ Build passes (`npm run build`) with no TypeScript errors
✅ No console errors in browser or server logs
