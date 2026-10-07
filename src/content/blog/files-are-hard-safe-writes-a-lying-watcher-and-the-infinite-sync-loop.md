---
title: 'Files are hard: safe writes, a lying watcher, and the infinite sync loop'
description: Three things you have to get right when an app's storage is a folder of files other tools also edit. Measured, with the real code.
date: 2026-10-07
tags:
  - dotnet
  - csharp
  - filesystem
  - programming
coverImage: /blog-covers/cover-04-files-are-hard.png
youtubeUrl: ''
mediumUrl: ''
devtoUrl: ''
---

[Papyra](https://github.com/lyfie-org/papyra) keeps every note as a `.md` file, and other tools (Syncthing, git, your editor) are allowed to change them. That's three problems you don't have with a database:

1. Writing a file without ever leaving it half-written.
2. Knowing when _someone else_ changed a file.
3. Not hearing your own writes and looping forever.

## 1. Writing a file safely

This is the line almost everyone writes:

```csharp
await File.WriteAllTextAsync(path, content);
```

It **empties the file first**, then writes. If the process dies in between (power cut, OOM kill, container stopped), you get an empty file, the old text is gone too, and nothing throws.

![Diagram: WriteAllText empties the note and a crash leaves 0 bytes; Papyra writes a temp file, fsyncs it, then atomically replaces the note, so a reader sees old or new, never half](/blog-covers/diag-atomic-write.png)

Papyra's version, from `MarkdownStorageService.cs`, trimmed a little:

```csharp
var tmp = Path.Combine(dir ?? ".", $"{Guid.NewGuid():N}.tmp");

await WithBackoff(async () =>
{
    await using (var fs = new FileStream(tmp, FileMode.Create, FileAccess.Write, FileShare.None))
    {
        await fs.WriteAsync(Encoding.UTF8.GetBytes(content), ct);
        await fs.FlushAsync(ct);         // .NET's buffer → the OS
        fs.Flush(flushToDisk: true);     // the OS → the actual disk (fsync)
    }
    return true;
});

await WithBackoff(() =>
{
    if (File.Exists(path)) File.Replace(tmp, path, destinationBackupFileName: null);
    else File.Move(tmp, path, overwrite: true); // Replace throws if there's no target yet
    return Task.FromResult(true);
});
```

Four decisions, each a bug someone has shipped:

- **The temp file goes next to the note, not in `/tmp`.** A rename is only atomic on the same disk, and in a container `/tmp` and your data volume never are.

  ![Diagram: a temp file in /tmp has to be copied byte by byte onto the data volume; a temp file beside the note is renamed in one atomic step](/blog-covers/diag-same-volume.png)

- **Flush twice.** The first survives a process crash. The second survives a power cut.
- **`File.Replace` with a fallback.** It throws for a brand-new note, so the first save uses `File.Move`.
- **Retry on locks.** Syncthing or an editor holding a file for a moment is normal. Three tries, 50 ms doubling.

What it doesn't give you: the folder entry itself isn't fsynced (.NET has no portable API), "atomic" weakens on network shares and FAT32, and it protects one file, not two that must change together.

## 2. FileSystemWatcher is lying to you

Not maliciously. But "a file changed" is not what its events mean. I measured: a tiny console app watching a folder while saving one note exactly the way above.

![Terminal: dotnet run; one save produces seven FileSystemWatcher events in 15 ms: Created and Changed for the temp file, Created and Deleted for a hidden note.md~RF…TMP backup, two Renamed events, and a final Deleted](/blog-covers/term-fsw.png)

_Seven events, for one save. Windows 11, NTFS, .NET 10._

Windows' `ReplaceFile` even makes and deletes a hidden backup on the way. Other tools add their own steps, and Linux reports a different sequence. So never act on an event:

![Diagram: seven raw events go through a *.md filter, a 200 ms per-path debounce and the write-ring check, and come out as one update](/blog-covers/diag-watcher-events.png)

- **Debounce per path.** Each new event for a file cancels the pending one. 200 ms.
- **Retry the read.** The event can arrive while the other program still has the file open.
- **Ask only for what you use.** `NotifyFilters.FileName | LastWrite | Size`, filter `*.md`.
- **Expect dropped events.** The watcher's buffer can overflow during a big sync. Papyra rescans everything at startup and rebuilds search nightly; an immediate rescan on overflow isn't there yet.
- **One watcher per user.** The user id comes from _which_ watcher fired, not from parsing a path.

## 3. The infinite sync loop

If your app writes files and watches the same folder, you've built a loop:

![Diagram: API writes note.md, the watcher fires, the app re-reads and broadcasts, the browser re-saves, and the cycle repeats; three guards below break it: write ring, debounce, backoff](/blog-covers/diag-sync-loop.png)

The debounce and the retries above are two of the guards. The third is the **write ring**: the app knows which writes were its own, so it writes that down _first_:

```csharp
public sealed class WriteRing
{
    private static readonly TimeSpan Window = TimeSpan.FromMilliseconds(500);
    private readonly IMemoryCache _cache;
    public WriteRing(IMemoryCache cache) => _cache = cache;

    public void Mark(string path) =>
        _cache.Set(Key(path), true, new MemoryCacheEntryOptions { SlidingExpiration = Window });

    public bool IsSelfWrite(string path) => _cache.TryGetValue(Key(path), out _);

    private static string Key(string path) => "writering:" + Path.GetFullPath(path);
}
```

```csharp
writeRing.Mark(path); // log self-write before touching disk (loop prevention)
await storage.WriteAsync(path, note, ct);
```

Mark **before** writing (the event can beat the write's return). Normalise the path (the endpoint and the watcher spell it differently). And the 500 ms window is a judgement call: too short and the loop returns, too long and you swallow a real edit.

With all three, outside edits still arrive, and your own don't echo:

![GIF: a shell appends a line to groceries.md; the open To Do list shows it a moment later](/blog-covers/gif-shell-edit.gif)

## The short version

Write to a temp file on the same disk, fsync, rename, retry. Treat watcher events as hints, not facts. Remember your own writes. And always keep a way to rebuild everything from the files, because the guards keep the normal case cheap, but rebuilding is what keeps it correct.

***

_I'm Rahul. I vibe-coded Papyra with AI coding assistants: what would have taken me a year or more to build by hand took a few months. It's GPLv3 and self-hosted: one Docker container, your notes as plain Markdown files._

_[GitHub](https://github.com/lyfie-org/papyra) · [Live demo, no signup](https://papyra.app/demo) · [Docs](https://papyra.app/docs)_
