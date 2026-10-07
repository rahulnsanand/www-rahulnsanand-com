---
title: A tour of Papyra 1.0 in 20 pictures
description: Every screen of a self-hosted notes app, one picture at a time. No account needed to try it.
date: 2026-09-28
tags:
  - selfhosted
  - productivity
  - opensource
  - webdev
coverImage: /blog-covers/cover-02-tour.png
youtubeUrl: ''
mediumUrl: ''
devtoUrl: ''
---

This is the short tour of [Papyra](https://github.com/lyfie-org/papyra), a notes app you run on your own server. Mostly pictures, very few words.

Want to click along? There's a [live demo](https://papyra.app/demo). It's the real app with a fake backend, running in your browser. No sign-up.

## 1. The desk

Notes are cards. Pin them, colour them, tag them, drag them around.

![The Papyra desk with pinned cards at the top and coloured cards below](/blog-covers/app-desk.png)

## 2. Light or dark

![GIF: the theme toggle flips the whole desk from light to dark and back](/blog-covers/gif-theme.gif)

## 3. Writing

Click a card and it opens on top of the desk, so you never lose your place.

![A note open in the editor over the dimmed desk](/blog-covers/app-editor.png)

There's no save button. Stop typing and it saves.

![GIF: typing a sentence; the footer shows "Saving…" then "Saved to local disk"](/blog-covers/gif-autosave.gif)

## 4. Linking notes

Type `[[` and pick a note.

![GIF: typing two square brackets and "Quar", then choosing "Quarterly review" from the dropdown](/blog-covers/gif-wikilink.gif)

Every note shows what links to it at the bottom.

![The Revenue model note with a "Linked mentions" section listing three notes that link to it](/blog-covers/app-backlinks.png)

## 5. Finding things

Ctrl+K searches titles, text, tags, and the text inside pictures (if you turn OCR on).

![GIF: search narrowing as "sourdough" is typed, then "per seat"](/blog-covers/gif-search.gif)

## 6. To-do lists

![The To Do page: Groceries and This week, with ticked and unticked items](/blog-covers/app-todo.png)

## 7. Tags and smart collections

A smart collection is a saved rule, like "tagged work and pinned". Notes show up while they match.

![The Collections page with a "Pinned work" smart collection and a row of tags with counts](/blog-covers/app-collections.png)

## 8. Pictures and PDFs

Drop files in. Pictures get thumbnails. PDFs open in place.

![A note with a large picture of a sourdough loaf](/blog-covers/app-media-image.png)

![A note with a PDF previewed inline](/blog-covers/app-media-pdf.png)

## 9. Going back in time

Every note keeps its earlier versions. Step through them, see what changed, restore one.

![GIF: stepping back through versions of a reading list, then the Changes view](/blog-covers/gif-history.gif)

## 10. Editing together

Share a note with someone on your server and you can both type in it at once.

![GIF: two windows side by side, two people editing the same note with named cursors](/blog-covers/gif-collab.gif)

## 11. Comments

Select text, comment on it, resolve it when it's done.

![A note with highlighted text and a comments panel with two threads](/blog-covers/app-comments.png)

## 12. Sharing

Share with a person (view or edit), or make a link. Links can expire or stop after a number of views.

![The share dialog: add a person, or create a link with expiry and max views](/blog-covers/app-share.png)

Here's what someone sees when they open a link:

![A public, view-only shared note: "Sourdough, finally working", shared by Ana Moreno](/blog-covers/app-public-link.png)

## 13. Shared with me

![The "Shared with me" page for Jun, showing two notes Ana shared, marked "Can edit"](/blog-covers/app-shared-with-me.png)

## 14. Notifications

![The notifications tray showing two comments from Jun](/blog-covers/app-notifications.png)

## 15. The vault

Lock a note and it's blurred everywhere. Your PIN (or fingerprint) opens it.

![The Vault page with two blurred locked notes](/blog-covers/app-vault.png)

![GIF: typing the vault PIN on a locked note, which then opens](/blog-covers/gif-vault.gif)

## 16. Offline

No signal? Keep typing. It catches up when you're back.

![GIF: offline typing, "Saved on this device — will sync", then the card updates after reconnecting](/blog-covers/gif-offline.gif)

## 17. Sign-in

Every account has an authenticator app. Passkeys and single sign-on work too.

![The sign-in screen with a "Sign in with a passkey" button](/blog-covers/app-login.png)

![The second step: "Enter the code from your authenticator app"](/blog-covers/app-login-code.png)

## 18. Security settings

Authenticator apps, passkeys, the vault PIN, and every signed-in browser (which you can rename or sign out) live here.

![Settings, Security: authenticator app, passkeys and locked-note PIN](/blog-covers/app-settings-security.png)

## 19. Data in and out

Import from Obsidian or Google Keep. Export everything as plain Markdown in a zip.

![Settings, Data & Storage: import, export all notes, and an encrypted backup download](/blog-covers/app-settings-data.png)

## 20. On your phone

![Papyra on a phone-sized screen](/blog-covers/app-mobile-desk.png)

That's the tour. The [demo](https://papyra.app/demo) is the same app. Go break it.

***

_I'm Rahul. I vibe-coded Papyra with AI coding assistants: what would have taken me a year or more to build by hand took a few months. It's GPLv3 and self-hosted: one Docker container, your notes as plain Markdown files._

_[GitHub](https://github.com/lyfie-org/papyra) · [Live demo, no signup](https://papyra.app/demo) · [Docs](https://papyra.app/docs)_
