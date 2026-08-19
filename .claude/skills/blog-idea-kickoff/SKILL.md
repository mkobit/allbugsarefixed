---
name: blog-idea-kickoff
description: Use when starting a new blog post or research idea in this repo — capturing a fresh topic, beginning research on a queued idea, or moving a blog idea from seed into the researching stage. Triggers include "new blog idea", "start a post", "research this topic", "add to the blog queue", "brainstorm a post".
metadata:
  author: mkobit
  version: "1.0"
---

# Blog idea kickoff

## Overview

Drive a blog idea through its first two lifecycle stages: **seed capture** and **research kickoff**.
Source of truth is `src/content/blog/AGENTS.md` — this skill is the actionable command path, not a replacement. Read that file when in doubt.

Your role is **research partner, not writer**. You collect raw facts, links, quotes, and data. You do not write the post.

## The one boundary that matters

**You MUST NOT write, draft, or generate narrative prose anywhere — not in the post body, not inside `## Scratch`.**
All blog narrative is written 100% by the human. This has broken before: delegated agents wrote blog-voiced prose into `## Scratch`, and it leaked into the published post's voice (`src/content/blog/AGENTS.md:24`). Treat it as a hard boundary.

Inside `## Scratch` you may add: `- raw fact (source-link)`, `> "quoted text" (source)`, `| data | table |`, and rough bullets explicitly labeled as rough. **Never** a paragraph that reads like the finished post.

## Where this skill stops

It covers **seed → researching only**. It does not draft, review, or publish.
Drafting starts *only* when the human explicitly asks, and the human writes 100% of narrative prose.
Agents do not provide unsolicited writing aid, rewrites, or editorial reviews unless explicitly requested by the user.
Don't advance past research on your own.

## Stage 1 — Seed capture (no folder yet)

1. **Check for an existing idea first** — don't pour a duplicate molecule:
   ```bash
   bd search <slug-words>
   ```
2. **Pick the slug once, from the title**, and reuse it everywhere. `bun new-idea "<Title>"` derives the folder slug by lowercasing the title and replacing non-alphanumerics with `-`. The beads `--var slug` MUST match that derived slug, or the bead and folder won't line up.
3. **Pour the lifecycle molecule** (creates a root epic + 7 stage beads, each blocked on the previous):
   ```bash
   bd mol pour blog-lifecycle --var slug=<kebab-slug> --var title="<Title>"
   ```
4. **Capture the raw idea on the seed bead** (`stage:seed`) — links, the angle, sources, anything unverified flagged as such:
   ```bash
   bd update <seed-id> --notes '- Angle: ...
   - Source: <link>
   - UNVERIFIED: <claim to confirm>'
   ```
   No folder, no `index.mdx` yet. The idea is parked; researching is blocked behind the seed.

## Stage 2 — Research kickoff

Trigger: research is actually beginning.

1. **Close the seed, claim researching** (closing seed unblocks `stage:researching`):
   ```bash
   bd close <seed-id> --reason "research started"
   bd update <researching-id> --claim
   ```
2. **Create the folder + `index.mdx`** (`visibility: "hidden"` and the `## Scratch` scaffold are written for you):
   ```bash
   bun new-idea "<Title>"
   ```
3. **Fill `## Scratch` with facts only** — use the scaffolded subsections (Links & sources, Facts & data, Rough thoughts, Agent research notes, Open questions). Leave everything *outside* `## Scratch` empty until the human drafts.
4. **Code/data go in auxiliary files** (`data.csv`, `map.ts`) in the same folder — never inline in `## Scratch`.

## `## Scratch` deletion hazard

`## Scratch` — an exact-text, depth-2 heading — is reserved and silently stripped from every render.
**Never** use a depth-2 heading with the literal text `Scratch` anywhere else: everything from it to the next depth-≤2 heading vanishes from the page. Nested (`### Scratchpad`) or partial (`## Scratching the surface`) headings are fine.

## Quick reference

| Step | Command |
|---|---|
| Check for dupes | `bd search <slug-words>` |
| Pour lifecycle | `bd mol pour blog-lifecycle --var slug=<slug> --var title="<Title>"` |
| Capture idea | `bd update <seed-id> --notes '...'` |
| Start research | `bd close <seed-id>` → `bd update <researching-id> --claim` |
| Scaffold files | `bun new-idea "<Title>"` |
| Sync beads (if asked) | `bd dolt push` |

## Common mistakes

- **Writing prose "just to get started"** — no. Bullets and quotes only; the human writes.
- **Slug drift** — beads `--var slug` not matching the `new-idea` folder slug. Derive both from the same title.
- **Creating the folder at seed stage** — the folder belongs to researching, after the seed closes.
- **Committing/pushing unprompted** — beads live in Dolt; `bd dolt push` and any `git` op only when the user asks (see repo git policy).
- **Reusing the `## Scratch` heading** — silently deletes content. Depth-2 + exact text is reserved.
