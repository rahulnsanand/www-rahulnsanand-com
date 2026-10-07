---
title: "Honestly: what Papyra 1.0 doesn't do, what I switched off, and the bugs I found launching it"
description: "The other list: features left out on purpose, an AI assistant that's built but off, a design I undid, and four bugs the launch screenshots caught."
date: 2026-10-28
tags:
  - selfhosted
  - opensource
  - devjournal
  - testing
coverImage: /blog-covers/cover-10-honestly.png
youtubeUrl: ''
mediumUrl: ''
devtoUrl: ''
---

A feature list is the least useful part of a project page; everyone's says roughly the same words. So here's the other list for [Papyra](https://github.com/lyfie-org/papyra) 1.0. If something here is a deal-breaker, better to know in five minutes than after an install.

## How it was built

I didn't hand-write Papyra. I vibe-coded it: I decided what it should do, described it, tested what came back and steered, while AI coding assistants wrote most of the code. What would have taken me a year or more on my own took a few months.

That's worth saying here because it shapes everything below. I didn't read every line as it was typed, so the honest way to find what's wrong is to use it hard and test it, which is exactly how the four bugs at the end of this post were found.

## Left out on purpose

**No graph view.** Every note lists what links to it. That's what you actually use. I've never once found a note with a force-directed graph; I have screenshotted plenty.

![The Revenue model note with a Linked mentions section listing three notes that link to it](/blog-covers/app-backlinks.png)

**No native phone or desktop app (yet).** It's a web app that installs from the browser, works offline and fits a phone. No share-sheet, no widgets. For typing text into a box, it covers it for now.

![Papyra on a phone-sized screen](/blog-covers/app-mobile-desk.png)

**No hosted version.** The point is "your notes on a server you control". Hosting other people's private notes is a responsibility I'm not set up to carry as one person.

**One vault per account.** Folders, tags and smart collections organise inside it. Want a separate "work" vault? Make a second account. On your own server it's free.

**Not end-to-end encrypted.** Locked notes are encrypted on disk, but the server holds the keys, so it can open them for you (that's how autosave and history keep working). That protects you from someone copying the files or a backup. It doesn't protect you from whoever controls the running server. On your own server, that's you.

## The one I changed my mind about: live editing

An earlier version of this list said _"no real-time collaborative cursors"_, because I thought live editing meant giving up the plain file on disk. It doesn't:

![GIF: two people editing the same note at once, each with a named cursor](/blog-covers/gif-collab.gif)

The live document runs in an engine inside the same container and is written back to the `.md` file through the same safe save path as everything else. The engine's own state is a disposable cache; if the file changed, the file wins. The rule was never "no live editing". It was "never give up the plain file".

## Built, tested, and switched off: the AI assistant

Search by meaning, a chat that answers from your notes with citations, local models through Ollama or a hosted provider. All built. In 1.0 it's **off**: a good local model means a second container and gigabytes of downloads, against a promise of one container. It comes back when it's worth that.

![Diagram: a saved note is queued, chunked, embedded and stored as a SQLite row; a query is embedded and compared with brute-force cosine; status: switched off for 1.0](/blog-covers/diag-semantic.png)

_No vector database: a table of floats in SQLite and a loop. Fine for one person's notes._

Switching it off properly took more thought than deleting it:

![Diagram: one switch, Features:Ai false, leads to five things: routes answer 404 not 403, hidden from the API docs, still mapped and compiled, the UI hides it, and cleanup still runs](/blog-covers/diag-feature-flag.png)

My favourite piece of it is a test that fails if the model picker uses words a normal person wouldn't know:

```csharp
string[] jargon = ["ollama", "http://", "https://", "localhost", ":11434", "embedding", "endpoint", "daemon", "api key"];
```

## A design I undid: an id on every paragraph

To let you embed any single paragraph elsewhere (`![[Note#^id]]`), the editor used to stamp an id on **every** paragraph, on every save. Notes on disk started ending every line in `^p7d2m4qz`. Almost none were ever embedded. So the editor stopped, and a daily job removes the old ones, except any something still points at:

![Terminal: a note with ^ids on every block; grep shows one, ^keepvolume, is embedded by another note; the anchor-cleanup job runs; afterwards only ^keepvolume remains](/blog-covers/term-anchors.png)

Lesson: don't write into someone's files _in case_ something needs it later. Plain files are a promise.

## What's tested

I ran every suite the day I wrote this:

![Terminal: the .NET, web and live-editing engine test suites, all passing](/blog-covers/term-tests.png)

Plus a black-box HTTP harness against a live server, and an end-to-end editor check in a real browser with performance budgets (a 200-picture note, a 300-card desk).

## What tests didn't catch

Taking the screenshots for these launch posts, using Papyra the way you would, I found four real bugs. None were in a test, because none were in my head:

1. A note **created in another app without a Papyra header** showed up blank and vanished after a restart.
2. A note **deleted while Papyra was off** could linger in search until the nightly rebuild.
3. If a note's file **changed while you were typing in it**, the warning banner appeared, but autosave saved your version before you'd chosen. With the snapshot throttle, the outside edit could be lost.
4. The **conflict resolver** squeezed some columns to a few letters wide.

All four are fixed in 1.0. The first three came with new automated tests; the fourth is a layout fix I checked at desktop and phone width. Then I re-ran every scenario against a live server, with the normal settings, before writing this. Here's number 3 now: autosave waits for you, and Overwrite with Local keeps the outside version in History.

![GIF: typing in a note while a shell appends a line to its file; the "modified externally" banner appears, the footer says "Not saved — choose an option above", the file still has the outside line, then Overwrite with Local writes the typed text](/blog-covers/gif-caret-guard.gif)

And number 4:

![The Resolve Conflict dialog, now a full-width line diff with the changed line in red and green](/blog-covers/app-conflict-resolver.png)

That's what young software means: the gaps are where nobody has looked yet. So:

- **Keep the backups it makes for you.** Settings → Data & Storage has a sealed backup download; Settings → Backup can push to a private GitHub repo.
- **Read the release notes.** They say when an upgrade signs you out or changes a setting.
- **Tell me what you find.** One report from real use is worth a hundred tests written alongside the code.

And if something does go wrong, Papyra's whole design makes it survivable: your notes are plain Markdown files in a folder you own.

***

_I'm Rahul. I vibe-coded Papyra with AI coding assistants: what would have taken me a year or more to build by hand took a few months. It's GPLv3 and self-hosted: one Docker container, your notes as plain Markdown files._

_[GitHub](https://github.com/lyfie-org/papyra) · [Live demo, no signup](https://papyra.app/demo) · [Docs](https://papyra.app/docs)_
