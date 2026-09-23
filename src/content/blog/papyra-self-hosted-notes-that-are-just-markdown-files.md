---
title: 'Papyra: self-hosted notes that are just Markdown files'
description: A note app where the folder is the storage. What Papyra is, what it isn't, and who it's for.
date: 2026-09-23
tags:
  - papyra
  - self-hosted
  - markdown
  - open-source
coverImage: ''
youtubeUrl: ''
mediumUrl: ''
devtoUrl: ''
---

I have been building a note-taking app called **Papyra**. It is self-hosted, it
is GPLv3, and the whole design follows from one decision: the notes are ordinary
files, and the app is a thing that happens to read them.

Every note is a `.md` file with YAML frontmatter, sitting in a folder on your
server:

```text
data/users/1/notes/
├── 4f3a9c21-....md
├── Inbox.md
└── projects/
    └── 8b17de44-....md
```

Open one in `cat`. It looks like this:

```markdown
---
id: 4f3a9c21-6b2e-4f1a-9c3d-77a1b2c4d5e6
title: Kitchen rewire
tags:
  - house
  - todo
pinned: true
---

Electrician quoted Tuesday. Need the consumer unit photo before then.
```

That is the whole storage format. There is no proprietary container, no
sqlite-with-a-blob-column, no "export to Markdown" button that produces a
lossy approximation of what you typed. The folder *is* the storage.

## What that buys you

**You can use your other tools on the same files.** Point Obsidian at the notes
directory and it opens them — the wiki-link syntax is the same. `grep -r "consumer
unit"` works. Your editor works. `git log` works if you want history that Papyra
didn't give you.

**Sync is somebody else's job, and that's fine.** Papyra doesn't ship a sync
protocol. Put the folder in Syncthing, Dropbox, or a git repo and let that tool
do what it is good at. Papyra watches the directory and catches up when files
change underneath it. When Syncthing drops a
`note.sync-conflict-20260101-120000-AB12CD.md` next to your note, Papyra
recognises the filename, keeps it out of the note list, and offers you a diff
instead of silently picking a winner.

**The database is disposable.** There *is* a SQLite file and a Lucene index —
that's how search is fast and how the note grid loads without reading four
hundred files. But neither one is authoritative. Delete the index directory and
Papyra rebuilds it from the `.md` files. There is an endpoint that does exactly
that. Nothing you typed lives only in a database row.

## What it actually does

Papyra's surface is closer to Google Keep than to a wiki: a grid of cards you can
drag around, pin, colour and tag. Underneath, it behaves like a plain-text
knowledge base.

- Full-text search across notes, titles and tags, with highlighted snippets
- `[[wiki links]]` and backlinks, plus "ghost cards" for notes you've linked to
  but not written yet
- Autosave — there is no save button anywhere in the UI
- Offline editing, with an outbox that drains when you're back
- Share a note by link, or `@mention` someone on the same instance
- Version snapshots you can scrub through
- Notes you can lock behind a passkey
- Import from Obsidian or Google Keep; export the whole vault as a zip
- Encrypted backups you can restore onto a fresh instance

It runs as one container:

```bash
curl -O https://raw.githubusercontent.com/lyfie-org/papyra/main/docker-compose.hub.yml
docker compose -f docker-compose.hub.yml up -d
```

One process serves the API and the web app, so there is no second container and
no reverse proxy needed to glue a frontend to a backend. One volume holds
everything. Back that volume up and you have backed up all of it.

## What it is not

It is not a collaborative editor. Two people typing in the same note at the same
moment get last-writer-wins with a conflict surfaced, not merged cursors.

It is not a mobile app (yet). It's a PWA that works offline; that is the whole story.

It does not have a graph view. Backlinks and ghost cards, yes — a force-directed
hairball, no. I have never once used one to find something.

There is an AI assistant in the codebase — embeddings, retrieval, chat over your
own notes, running locally against Ollama. It is switched off. Shipping it at
v0.1 would have meant a second container and a support surface for a feature
that was merely *present* rather than good. It will come back when it earns the
volume.

## Honestly: this is young software

Papyra is at **v0.1.2**. There is a real test suite — 373 unit test cases plus a
black-box harness of 239 HTTP checks that runs against a live instance — and I
use it for my own notes daily. It is still young software, and you should treat
it that way. It makes encrypted backups; keep them.

The reason I am comfortable saying that out loud is the same reason the storage
format is what it is. If Papyra turns out not to be for you, you delete the
container and you still have a folder full of Markdown files. That is the whole
pitch, and it is the one claim that cannot rot.

---

*Papyra is GPLv3 and self-hosted.
[Source](https://github.com/lyfie-org/papyra) ·
[Live demo, no signup](https://papyra.app/demo) ·
[Docs](https://papyra.app/docs)*
