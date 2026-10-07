---
title: "No save button, no stolen cursor: the rules behind Papyra's editor"
description: Autosave, offline editing, outside changes arriving mid-sentence, and two people typing at once. The small rules that make an editor you can trust.
date: 2026-10-17
tags:
  - react
  - javascript
  - webdev
  - ux
coverImage: /blog-covers/cover-07-the-editor.png
youtubeUrl: ''
mediumUrl: ''
devtoUrl: ''
---

[Papyra](https://github.com/lyfie-org/papyra)'s editor has no save button, works offline, and lets other programs change a note while you're typing in it. Each of those sounds like a feature. Each is really a handful of small rules. Here they are.

## No save button

You type, you stop, it's saved:

![GIF: typing " So does git." at the end of a note; the footer shows "Saving…" and then "Saved to local disk"](/blog-covers/gif-autosave.gif)

![Diagram: each keystroke restarts a 1.5 second timer; after quiet, unchanged drafts send nothing; then Saving… and Saved to local disk; offline saves go to the outbox; closing a note flushes immediately](/blog-covers/diag-save-states.png)

"Debounce and PUT" is the idea. The rules are where the bugs were:

- **Don't save what didn't change.** Opening a note can make the editor tidy its Markdown. Counting that as an edit once meant notes got re-saved, and re-dated, just by being looked at.
- **Save on the way out.** Closing a note doesn't wait for the timer.
- **Don't touch what you didn't edit.** The editor sends title and body; tags, colour and pins ride along untouched.

## Offline: an outbox, not a sync engine

No network? The save goes into a queue in the browser, and the label says so:

![GIF: the network drops, a sentence is typed, the label reads "Saved on this device — will sync", the connection returns, the note is saved and its card updates](/blog-covers/gif-offline.gif)

_Checked on disk afterwards: the sentence typed offline is in the `.md` file._

![Diagram: five offline saves across two notes become two outbox entries, one per note with the latest body; back online, one PUT per note; sign-out wipes the queue; 401 and 500 keep entries; retry every 15 seconds](/blog-covers/diag-outbox.png)

The queue is **keyed by note id**: a save is the whole note, so later saves replace earlier ones and there's nothing to merge. Each entry remembers which server version it started from, so if the note changed meanwhile, the edit still goes through _and you're told_. Sign-out wipes the queue (entries have no owner, and the next person must not inherit them). A 401 or 500 keeps it (losing offline writing is the one unforgivable failure). And since the browser's `online` event knows nothing about _your_ server, it also retries every 15 seconds.

## Never hijack the caret

You're typing. The same note changes somewhere else: another device, a sync tool, a shell. The worst thing an editor can do now is move your cursor, or quietly throw one of the two versions away.

![Diagram: never patch the live editor; ignore your own echo; with nothing unsaved, remount with a fresh key; with unsaved text, hold and ask; for a shared live note, merge in the live room](/blog-covers/diag-caret.png)

Here's the hard case, for real: I'm mid-sentence when a shell appends a line to the same file.

![GIF: typing in a note while a shell appends a line to its file; a "This note was modified externally" banner appears and the footer says "Not saved — choose an option above"; tail shows the outside line still on disk; after Overwrite with Local, tail shows the typed text](/blog-covers/gif-caret-guard.gif)

_The terminal on the left is the file on disk. Nothing is written until I choose._

The rules, from `NoteEditor.tsx`:

**1. The editor is uncontrolled.** It reads its text once. To show a new version, Papyra remounts it with a new key, never pushes text into the live DOM:

```tsx
// Luthor is uncontrolled (defaultContent only
// applies on mount), so adopting a remote body means remounting with a fresh
// key — never patching the live DOM, which would hijack the caret.
```

**2. Never replace unsaved words.** Ask the editor itself, not just a React flag (a flag set by an event handler can still read `false` in the same tick as the keystroke).

**3. While the banner is up, autosave waits.** Saving now would replace the outside version before you'd chosen:

```ts
// A revision the editor hasn't adopted is on disk (NoteEditor's "modified
// externally" banner). Autosave stands down until the person chooses — saving
// now would replace that revision before they had. A save that still goes out
// (Overwrite with Local, or closing with the banner up) asks the server to
// archive the revision first, so History keeps it whatever the throttle says.
```

Then you choose. **Overwrite with Local** keeps your text, and the outside version goes into History first (I checked, with the normal snapshot throttle on). **Review** loads the outside version instead, and first keeps what you'd typed as a History version (a toast links straight to it). If that can't be saved, nothing is replaced and the banner stays. Either way, nobody's words are thrown away.

**4. Ignore your own echo.** Your save comes back as "this note changed". If it matches what you just saved, do nothing, or the editor remounts on every pause.

**5. Know who made the change.** The editor's change event says `'user'`, `'programmatic'` or `'remote'`. Only typing is an edit.

**6. Shared notes merge instead.** When two people really type at once, there's no "pick one":

![GIF: two windows side by side, two people editing the same note with named cursors](/blog-covers/gif-collab.gif)

Both people's typing goes into a live room (Yjs) running inside the same container, and each cursor stays put. The server still writes the result to the `.md` file.

## Lexical is an engine, not an editor

All of this sits on [Lexical](https://lexical.dev), which is great, and is not a rich text editor. It's what you _build_ one from. Toolbars, Markdown, images, `[[links]]`: that became [luthor](https://www.luthor.fyi/), an editor library I vibe-coded the same way, and Papyra only owns the thin top layer.

![Diagram: Lexical 0.40 is the engine; luthor-headless adds typed extensions; the luthor PapyraEditor preset is a ready Markdown editor; Papyra owns only a thin host adapter on top](/blog-covers/diag-luthor.png)

![GIF: typing two square brackets and "Quar" in a note, choosing Quarterly review from the dropdown, and the link appearing](/blog-covers/gif-wikilink.gif)

The editor never calls Papyra's API itself. Every way out (picture URLs, uploads, opening a linked note) goes through one adapter, and the server checks every request.

## The shape of it

Remount, never patch. Never overwrite unsaved words behind someone's back, and never overwrite someone else's without keeping a copy. Ignore your own echo. Track who changed what. And where two people really do type at once, merge.

None of it is clever. All of it is the difference between an editor you trust and one you don't.

***

_I'm Rahul. I vibe-coded Papyra, and luthor under it, with AI coding assistants: what would have taken me a year or more to build by hand took a few months. Papyra is GPLv3 and self-hosted: one Docker container, your notes as plain Markdown files._

_[GitHub](https://github.com/lyfie-org/papyra) · [Live demo, no signup](https://papyra.app/demo) · [Docs](https://papyra.app/docs)_
