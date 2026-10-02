---
title: I built a note app you can delete
description: Papyra's files are the truth and its database is a cache. What that buys, what it costs, and what's left when you uninstall it.
date: 2026-10-02
tags:
  - selfhosted
  - architecture
  - markdown
  - opensource
coverImage: /blog-covers/diag-source-of-truth.png
youtubeUrl: ''
mediumUrl: ''
devtoUrl: ''
---

Every notes app has an export button. Few have a good answer to the real question: **what's left when I stop using you?** Usually it's a zip of HTML with the styling stripped. That's not "you can leave". That's a weekend.

So before any feature, [Papyra](https://github.com/lyfie-org/papyra) got one rule: **uninstalling it must leave you with what you'd have had anyway.** That rule decides the whole architecture.

![Diagram: the usual note app keeps the only copy in a database with an export button bolted on; Papyra keeps the only copy in .md files and treats SQLite and Lucene as rebuildable caches](/blog-covers/diag-source-of-truth.png)

## The files are the truth

Every note is a Markdown file with a small YAML header:

![cat of a note file: YAML frontmatter with id, title, tags, colour, then the Markdown body with a table](/blog-covers/term-cat.png)

There _is_ a SQLite database and a search index. Both are caches. The test of "cache" is whether you can throw it away, so there's an endpoint that does exactly that:

![Terminal: the Lucene index is small; POST /api/system/rebuild-index returns the number rebuilt; searching for sourdough still finds the right notes](/blog-covers/term-rebuild.png)

_Throw the index away, ask for it back, lose nothing._

Before adding any column I ask: **if I delete this table, can I rebuild it from the files?** If not, it belongs in the file, or it's UI state that's allowed to get lost.

## What "delete it" looks like

Stop the container. Remove the image. You have this:

![ls and grep on the notes folder: plain .md files with readable names, found by grep](/blog-covers/term-grep.png)

Obsidian opens it. VS Code opens it. `grep` reads it. Pictures sit next to it in `media/`, linked the way Obsidian links them.

What you _lose_ is presentation and plumbing, never a sentence you wrote:

![Diagram: what survives deletion (notes, tags, colours, pins, attachments) versus what stays behind with the app (history, card order, tag colours, share links, comments, sign-ins)](/blog-covers/diag-what-survives.png)

One honest exception: **locked notes are encrypted on disk**. That's the point of locking them.

![head of a locked note: the YAML header is readable, the body is one long papyra-locked:v1 ciphertext line](/blog-covers/term-locked.png)

So for locked notes the exit has one extra step: unlock your vault and use Export, which writes them out as plain Markdown in their own folder.

## What it buys

Other tools can write to your notes, and Papyra keeps up:

![GIF: a shell appends a line to groceries.md; the open To Do list gains the new item a moment later](/blog-covers/gif-shell-edit.gif)

## What it costs

![Diagram: five costs of files-as-truth: no multi-note transactions, crash-safe writes by hand, catching up on every boot, file names are user input, and sync tools' conflict copies](/blog-covers/diag-costs.png)

One deserves a closer look: **catching up after downtime.** The server was off; Syncthing wasn't. Notes arrived, changed, vanished. So at startup Papyra compares every file to its cache before it opens the port. Here's that, done for real:

![Terminal: with Papyra stopped, notes are deleted, added and edited on disk; on restart the cold-boot log line reports what it reindexed and pruned, before "Now listening"](/blog-covers/term-coldboot.png)

_When_ it runs is the interesting part:

![Diagram: with BackgroundService the port opens and the first search hits a half-updated index; with IHostedService.StartAsync the walk finishes before the port opens](/blog-covers/diag-coldboot.png)

ASP.NET Core's `BackgroundService` would run it _while_ the port opens, so the first search could see stale results. Doing the work in `IHostedService.StartAsync` makes the host wait for it. Startup is slower; the first request is right.

And the log line says what it did. After an ordinary upgrade it reads `0 (re)indexed, 0 pruned`, and you know nothing moved underneath you.

## Was it worth it?

For notes, yes. Notes are small and independent, there's no cross-note rule worth a transaction, and what people fear is the ten-year risk. Plain files have the best ten-year record of any format.

If your data has foreign keys that must hold, or many writers that must merge, use a database. Files won't thank you.

The app should have to earn the next day. Not trap you into it.

***

_I'm Rahul, and I build Papyra on my own. It's GPLv3 and self-hosted: one Docker container, your notes as plain Markdown files._
[_GitHub_](https://github.com/lyfie-org/papyra) _·_ [_Live demo, no signup_](https://papyra.app/demo) _·_ [_Docs_](https://papyra.app/docs)
