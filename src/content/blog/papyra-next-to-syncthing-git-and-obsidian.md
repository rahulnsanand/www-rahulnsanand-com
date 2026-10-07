---
title: Papyra next to Syncthing, git and Obsidian
description: Your notes folder is shared with other tools. How Papyra keeps their keys, adopts their files and handles sync conflicts, shown for real.
date: 2026-10-10
tags:
  - selfhosted
  - syncthing
  - obsidian
  - markdown
coverImage: /blog-covers/cover-05-next-to-syncthing-git-obsidian.png
youtubeUrl: ''
mediumUrl: ''
devtoUrl: ''
---

[Papyra](https://github.com/lyfie-org/papyra) doesn't want to be your only notes tool. Your notes are a folder of Markdown files, and other tools are welcome in it. Every picture below is the real thing.

![find listing of the data volume: notes and media under users/1, Papyra's own state hidden in .papyra folders](/blog-covers/term-tree.png)

Point your tools at `users/<id>/notes` (and `media` for attachments). Leave the hidden `.papyra/` folders alone.

## Any editor, or a script

Change a file from outside, and the open app catches up:

![GIF: a shell appends a line to groceries.md; the open To Do list shows it a moment later](/blog-covers/gif-shell-edit.gif)

## Notes made somewhere else

Make a new note in another app, with no Papyra header at all, and it turns up as a normal note, titled from its first heading:

![GIF: a shell writes "Made in Obsidian.md" with just a heading and two lines; a "Made in Obsidian" card appears on the open desk](/blog-covers/gif-adopt.gif)

Papyra gives it an id and writes that one line back into the file, because shares, comments, history and links all hang off it, and they have to survive the file being renamed:

![Terminal: the new file before and after: Papyra added a three-line header with only an id, the body is unchanged, and the modified time is restored](/blog-covers/term-adopt.png)

_One `id:` line added. Body untouched, other tools' keys untouched, modified time put back._

```csharp
// The id is written back into the file. Shares, comments, history, links and
// the grid order all key on it, so it has to outlive the things a file name
// doesn't: Papyra renaming the file after its title, or the user renaming it in
// Obsidian.
```

The id is derived from the file's path, so even if the write-back can't happen (a read-only folder, YAML too broken to touch) the note keeps the same id as long as the file stays put.

## Keys that aren't Papyra's

Obsidian plugins and static site generators put their own keys in a note's header. Papyra owns ten keys and leaves the rest alone. Here I add two by hand, then pin the note through Papyra's API:

![Terminal: sed adds "aliases" and "cssclass" to deploy-runbook.md; a PUT to the Papyra API returns 200; head shows aliases and cssclass still there, and pinned is now true](/blog-covers/term-foreign.png)

The values survive (the style may not: `[a, b]` comes back as a block list). The rule that makes it work is the merge order:

![Diagram: three layers merged in order: keys the note had when read, then keys in the file right now (wins), then Papyra's ten keys stamped last; updated: is never written](/blog-covers/diag-frontmatter-merge.png)

The file on disk _right now_ beats the copy in memory, so an edit another tool made while the note sat open survives Papyra's next save. And Papyra never writes `updated:` (the file's modified time already says that), so glancing at a note doesn't create a git diff.

Reading is just as forgiving. Markdig finds the header, YamlDotNet reads it into a dictionary, and broken YAML means "no header", not a crash:

```csharp
catch
{
    fm = new Dictionary<string, object?>(); // graceful ignorance
}
```

The body still loads. You can fix the YAML later, in any editor.

## Syncthing, Dropbox, Nextcloud

When two devices edit one note offline, the sync tool keeps both and leaves a conflict copy like `revenue-model.sync-conflict-20261001-091500-PHONE01.md`. It looks like a note and carries the same id. Papyra spots it by name, keeps it out of your notes, and flags the card:

![GIF: a Syncthing-style conflict copy is created and the Revenue model card shows a "Sync conflict — resolve" badge](/blog-covers/gif-sync-conflict.gif)

Then you choose:

![The Resolve Conflict dialog: a full-width line diff with this note's line in red and the copy's line in green, then the unchanged rest of the note, and Keep Left, Keep Both and Keep Right buttons](/blog-covers/app-conflict-resolver.png)

![Diagram: three choices. Keep left: the copy goes to Trash. Keep right: your version is snapshotted to History, then replaced. Keep both: the copy becomes a new note](/blog-covers/diag-conflict-choices.png)

None of them lose text. I ran "Keep right" against a live server to check: the note took the phone's text, the version it replaced was in History (the snapshot skips the usual few-minutes throttle), and the copy was in the Trash folder.

## Edits while Papyra is off

Sync doesn't stop when your server does. At startup Papyra compares every file to its cache before taking a request: new files are indexed (and adopted, if they have no id), changed ones re-indexed, deleted ones dropped:

![Terminal: with Papyra stopped, a note is deleted and a header-less note is written; on restart the cold-boot log reports what it indexed and pruned, before "Now listening"](/blog-covers/term-coldboot.png)

## git

`git init` the notes folder and commit whenever you like. Or use Settings → Backup, which pushes to a private GitHub repo with full history and never force-pushes:

![Settings, Backup: "Back up to GitHub. An off-server copy of your notes, with full history." and a warning that anyone who can read the repo can read the notes](/blog-covers/app-settings-sync.png)

Mind the warning: that copy is plain text. Keep the repo private.

## Where it still frays

- **Links are by title, files are by slug.** Papyra names files like `revenue-model.md` and inserts links like `[[Revenue model]]`. Papyra resolves both ways; Obsidian looks for `Revenue model.md` and shows the link as unresolved.
- **Locked notes are encrypted on disk.** Other tools see a header and a line of ciphertext.
- **Don't sync `.papyra/`.** Two servers sharing one search index will fight.

Papyra should be one tool on your notes, not the gatekeeper to them.

***

_I'm Rahul. I vibe-coded Papyra with AI coding assistants: what would have taken me a year or more to build by hand took a few months. It's GPLv3 and self-hosted: one Docker container, your notes as plain Markdown files._

_[GitHub](https://github.com/lyfie-org/papyra) · [Live demo, no signup](https://papyra.app/demo) · [Docs](https://papyra.app/docs)_
