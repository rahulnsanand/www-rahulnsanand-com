---
title: Full-text search in 300 lines of Lucene.NET (and the bugs it taught me)
description: "Papyra's whole search layer: one writer, one document per note, a per-user fence, and two ways results used to leak."
date: 2026-10-02
tags:
  - dotnet
  - csharp
  - search
  - lucene
coverImage: ''
youtubeUrl: ''
mediumUrl: ''
devtoUrl: ''
---

Lucene.NET has a documentation problem. Most of what you'll find is a port of a 2011 Java tutorial, or a post that indexes three strings and stops.

So here's a complete one: the whole search layer of [Papyra](https://github.com/lyfie-org/papyra), one file, under 300 lines, multi-user, with highlighted snippets.

![GIF: typing "sourdough" into Papyra's search; results narrow and the match is highlighted; then "per seat" finds the pricing note](/blog-covers/gif-search.gif)

Version: **Lucene.NET 4.8.0-beta00017**. It's been "beta" for years, everyone uses it, the API is stable. Pin it.

Why not SQLite's FTS5, when Papyra already has SQLite? A real highlighter, title-beats-body boosts, a real query parser. And the index is a folder you can delete and rebuild, which suits an app where the files are the truth.

## 1. One writer, forever

Lucene allows **one `IndexWriter` per index folder** and enforces it with a `write.lock` file. Open one per request and the second overlapping request gets `LockObtainFailedException`.

![Diagram: opening a writer per request makes the second one fail on write.lock; one singleton writer shared by every caller works](/blog-covers/diag-one-writer.png)

So there's exactly one, created at startup, registered as a singleton:

```csharp
_writer = new IndexWriter(_dir, new IndexWriterConfig(Version, _analyzer)
{
    OpenMode = OpenMode.CREATE_OR_APPEND,
});
_writer.Commit(); // materialize segments so the first Search can open a reader
```

That last `Commit()` matters. A brand-new index has no segments, and opening a reader on it throws. Without it, the very first search on a fresh install crashes.

Readers are the opposite: cheap, one per search, opened straight off the writer so a note saved a millisecond ago is findable.

## 2. One note, one document

![Table: the Lucene document fields: key, id and userId (StringField), title (TextField, boost 2, stored), tags, body (TextField, not stored), extractedText (not stored)](/blog-covers/diag-lucene-doc.png)

The surprise: **the body is searchable but not stored.** Storing it would roughly double the index for text that's already in the `.md` file. Search returns ids; the snippet is cut from the file.

## 3. Fence every query to one person

```csharp
using var reader = DirectoryReader.Open(_writer, applyAllDeletes: true);

var query = new BooleanQuery
{
    { new TermQuery(new Term("userId", userId)), Occur.MUST },
    { ParseQuery(queryText), Occur.MUST },
};
```

The user filter is **part of the query**, not a check on the results afterwards. Filtering afterwards is always one missing `continue` away from a leak.

## 4. The bug where one user's note replaced another's

Note ids are random, so keying on the id felt safe. Except one isn't: when someone @mentions you, Papyra adds a line to **your** `Inbox.md`, whose id is the literal string `Inbox`. Here's one, in a real vault:

![Terminal: Jun's notes folder contains Inbox.md, whose header says id: Inbox, created when Ana mentioned him](/blog-covers/term-mention.png)

![Diagram: two vaults each have a note with id "Inbox"; keyed on the bare id, Lucene lets one replace the other and the startup cache throws on a duplicate key; the fix is to key on (userId, noteId)](/blog-covers/diag-id-collision.png)

Two symptoms. In search, one person's inbox silently **replaced** the other's. And at startup, the cache load hit a duplicate key, threw, and the container restarted, forever. The fix is to put the owner in every key:

```csharp
private static string DocKey(string userId, string noteId) => $"{userId}:{noteId}";
```

The `:` is only safe because note ids are also file names, and the path guard rejects `:` in them. Deletes needed the same fix: "delete the document with id `Inbox`" would have wiped everyone's.

Lesson: **"unique" always means "unique within something."** Put the something in the key.

## 5. Survive whatever people type

```csharp
try { return parser.Parse(queryText); }
catch (ParseException) { return parser.Parse(QueryParserBase.Escape(queryText)); }
```

Search for `C++` or `TODO:` and Lucene's parser throws. So try it as syntax, and if that fails, search it as plain text.

## 6. Snippets that don't leak

A result list is a way to read your notes, a few words at a time. Two ways Papyra's used to show too much:

![Diagram: leak 1, raw markdown and internal markers in snippets, fixed by flattening to prose; leak 2, a body match on a locked note answers questions about it, fixed by never indexing locked bodies](/blog-covers/diag-snippet-leaks.png)

**The machinery.** Snippets were cut from raw Markdown: heading hashes, link syntax, internal markers. Now the body is flattened to prose first:

```csharp
body = PlainText.Flatten(body);
```

**The locked note.** If a locked note's text were indexed, searching "passport" would answer _"does my locked note contain passport?"_ without unlocking it. So its text is never indexed, and in 1.0 neither is its title (locked notes are encrypted on disk, and the index is on disk too). Titles are matched in memory instead:

![Search for "travel": "Travel documents" is listed as "Locked note", with no snippet](/blog-covers/app-search-locked.png)

## Honest limits

- **StandardAnalyzer only.** No stemming, weak for Chinese, Japanese and Korean.
- **No fuzzy matching** unless you type `word~`.
- **A commit per save.** Right for typing, wrong for bulk imports.
- **No benchmarks.** I haven't measured it against FTS5, so I won't print a number.

The file is [`SearchIndexService.cs`](https://github.com/lyfie-org/papyra/blob/main/papyra.api/src/Papyra.Api/Storage/SearchIndexService.cs). About ten minutes to read.

***

_I'm Rahul, and I build Papyra on my own. It's GPLv3 and self-hosted: one Docker container, your notes as plain Markdown files._
[_GitHub_](https://github.com/lyfie-org/papyra) _·_ [_Live demo, no signup_](https://papyra.app/demo) _·_ [_Docs_](https://papyra.app/docs)
