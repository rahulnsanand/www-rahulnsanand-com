---
title: 'Papyra 1.0: self-hosted notes that are just Markdown files'
description: A Google Keep-style notes app for your own server, where every note is a plain .md file you can open with anything.
date: 2026-09-23
tags:
  - papyra
  - self-hosted
  - markdown
  - open-source
  - selfhosted
  - productivity
coverImage: ''
youtubeUrl: ''
mediumUrl: ''
devtoUrl: ''
---

Papyra 1.0 is out. It's a notes app you run on your own server. It looks like Google Keep, and every note is a plain `.md` file.

That's the whole idea. The rest of this post is pictures.

![The Papyra desk: pinned and unpinned note cards in a warm, paper-coloured grid](/blog-covers/app-desk.png)

_The desk. Cards you can pin, colour, tag and drag around._

## The folder is the storage

Every note is a Markdown file with a small YAML header. Here's one, straight off the disk:

![cat of a note file: YAML frontmatter with id, title, tags, colour, then the Markdown body with a table](/blog-covers/term-cat.png)

_No database blob. No export step. Just a file._

And here's the whole data folder. Your notes live in `users/1/notes/`. Everything Papyra keeps for itself goes in a hidden `.papyra/` folder.

![find listing of the data volume: users/1/notes/*.md, users/1/media, and hidden .papyra folders for caches](/blog-covers/term-tree.png)

There _is_ a SQLite database and a search index. They're caches. Delete them and Papyra rebuilds them from the files.

## Other tools can edit your notes

Because they're files, anything can change them. Papyra notices and catches up. Here I add a line to a to-do list from a shell, and the open app updates on its own:

![GIF: a shell appends a line to groceries.md and the Groceries list in the open app gains "Coffee beans, not ground" a moment later](/blog-covers/gif-shell-edit.gif)

_A real command on the real file. No reload._

Point Obsidian at the folder and it opens. Write a new note in Obsidian and it shows up in Papyra. `grep` works. Syncthing works. Git works.

## What's in 1.0

**Live editing together.** Share a note and two people can type in it at the same time, with named cursors. It's still a `.md` file on disk.

![GIF: two browser windows side by side, Ana and Jun editing the same Lisbon trip note, each seeing the other's cursor and text appear](/blog-covers/gif-collab.gif)

**Search that's fast.** Press Ctrl+K and type.

![GIF: typing "sourdough" then "per seat" into search; results narrow and highlight the match](/blog-covers/gif-search.gif)

**Links between notes.** Type `[[` to link another note. Every note lists what links to it.

![GIF: typing two square brackets and "Quar" in a note, picking "Quarterly review" from the dropdown, and the link appearing](/blog-covers/gif-wikilink.gif)

**Version history.** Step back through earlier versions and see what changed.

![GIF: opening History on a reading list, stepping to an older version, then the Changes view with added and removed lines](/blog-covers/gif-history.gif)

**A vault for private notes.** Locked notes are blurred, open with a PIN (or your fingerprint), and are encrypted on disk.

![GIF: a locked "Travel documents" note asks for the vault PIN, the PIN is typed, and the note opens](/blog-covers/gif-vault.gif)

**Comments.** Select text, leave a comment, resolve it later.

![A note with highlighted passages and a comments panel showing two open threads from Jun](/blog-covers/app-comments.png)

**Pictures and PDFs inside notes.** Drop them in. PDFs preview in place.

![A note with an attached PDF opened inline, showing a small table of figures](/blog-covers/app-media-pdf.png)

**Works offline.** Keep typing with no signal. It syncs when you're back.

![GIF: the network drops, a sentence is typed, the label says "Saved on this device — will sync", then the note syncs and the card updates](/blog-covers/gif-offline.gif)

Also in the box: two-step sign-in with an authenticator app, passkeys, single sign-on (OIDC), sharing by link, import from Obsidian and Google Keep, export to a zip, sealed backup files, and backup to a private GitHub repo.

It works on phones, too.

![Papyra on a phone-sized screen, showing the desk](/blog-covers/app-mobile-desk.png)

## Install

One container, one volume:

```bash
curl -O https://raw.githubusercontent.com/lyfie-org/papyra/main/docker-compose.hub.yml
docker compose -f docker-compose.hub.yml up -d
```

Open `http://localhost:8080` and create the first account. That's it.

## The honest part

I build Papyra on my own. 1.0 means I use it every day and I'm happy for you to. It does not mean it's finished or bug-free. It makes backups for you: keep them.

There's no hosted version and no native mobile app. There's an AI assistant in the code, but it's switched off for now.

And if Papyra isn't for you, delete it. You still have a folder of Markdown files. That's the point.

***

_I'm Rahul, and I build Papyra on my own. It's GPLv3 and self-hosted: one Docker container, your notes as plain Markdown files._
[_GitHub_](https://github.com/lyfie-org/papyra) _·_ [_Live demo, no signup_](https://papyra.app/demo) _·_ [_Docs_](https://papyra.app/docs)
