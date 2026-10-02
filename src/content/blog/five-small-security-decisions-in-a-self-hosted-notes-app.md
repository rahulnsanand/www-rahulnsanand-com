---
title: Five small security decisions in a self-hosted notes app
description: A missing slash, the wrong hash, an honest status code, a fingerprint, and the one door into someone else's vault. How Papyra handles each.
date: 2026-10-21
tags:
  - security
  - dotnet
  - webdev
  - selfhosted
coverImage: ''
youtubeUrl: ''
mediumUrl: ''
devtoUrl: ''
---

None of these are big. Each one is the kind of thing that's easy to get almost right. Here's how [Papyra](https://github.com/lyfie-org/papyra) handles them.

## 1. The trailing slash that stops users/1 reading users/10

Each person's notes live in their own folder:

![find listing of the data volume: users/1 and users/2, each with its own notes folder](/blog-covers/term-tree.png)

The check almost everyone writes first:

```csharp
var full = Path.GetFullPath(Path.Combine(baseDir, requested));
if (!full.StartsWith(baseDir)) throw new SecurityException();
```

It stops `../../etc/passwd`. It doesn't stop this:

![Diagram: base /data/users/1 and a resolved path /data/users/10/notes/secret.md; plain StartsWith says true; with a trailing separator the fence is /data/users/1/ and the check correctly fails](/blog-covers/diag-path-jail.png)

String prefixes don't know about folders. The fix is one character, plus an ordinal comparison:

```csharp
// Fence with a trailing separator so a sibling dir sharing a prefix
// (users/1 vs users/10) can't sneak past a naive StartsWith.
var fence = baseFull.EndsWith(Path.DirectorySeparatorChar)
    ? baseFull
    : baseFull + Path.DirectorySeparatorChar;

if (!combined.StartsWith(fence, StringComparison.Ordinal))
    throw new SecurityException($"Path '{requestedName}' escapes the user vault.");
```

And because a note id becomes a file name, ids get a second check: no `..`, `/`, `\`, `%`, `:` (an NTFS hidden stream), control characters, or Windows device names like `CON`. The fence keeps paths inside the folder; the name check keeps names sane. You need both.

## 2. Slow hash or fast hash? Ask who chose the secret

![Diagram: passwords and vault PINs are chosen by people and guessable, so they get BCrypt (the PIN also gets a lockout); API keys are 32 random bytes, so they get fast SHA-256](/blog-covers/diag-hash-choice.png)

A slow hash like BCrypt protects **guessable** secrets. A Papyra API key isn't guessable:

```csharp
// 32 bytes of entropy → high enough that a plain SHA-256 (no per-row bcrypt) is
// a safe, fast lookup key.
var raw = RandomNumberGenerator.GetBytes(32);
var token = $"papyra_{secret}";
```

And BCrypt would hurt: a key arrives on every request with no username, and a salted hash can't be looked up, so you'd check it against **every key**, slowly. SHA-256 lets you hash once and look it up.

The in-between case is the vault PIN, 6 to 12 digits. A person chose it and there aren't many, so it gets BCrypt **and** a lockout:

```csharp
// BCrypt cost for the PIN hash. A PIN has little entropy, so the lockout is
// the real defence; the cost still makes an offline attack on a leaked
// database slower per guess.
```

## 3. 410 Gone, not 404

A status code is a sentence. Here's a "view once" share link read twice, next to two other cases:

![Terminal: a view-once link returns 200 on the first view and 410 with "This link has reached its view limit." on the second; a made-up link returns 404; the switched-off AI chat route also returns 404](/blog-covers/term-gone.png)

A used-up link **did exist**, so it says `410` with a reason. A made-up link says `404`. And a switched-off feature also says `404`, not `403`:

```csharp
/// 404 rather than 403 on purpose. "Switched off for now" is not "you may not",
/// and an endpoint that does not exist yet is the honest answer for a client
/// that finds the route in an older copy of the docs.
```

What a reader sees:

![A Papyra shared-link page that reads "This link has reached its view limit."](/blog-covers/app-link-gone.png)

## 4. Unlocking a vault with a fingerprint

Locked notes open with a PIN or, optionally, a passkey:

![GIF: clicking a locked note, typing the PIN, and the note opening](/blog-covers/gif-vault.gif)

![Diagram: the server issues a fresh single-use challenge tied to the host; the device signs it with Touch ID or Windows Hello; the server verifies signature, origin and host; the result is a 5-minute unlock token kept in memory](/blog-covers/diag-webauthn.png)

The part that broke in production was the **relying party id**. I'd set it once (`localhost`). Self-hosted apps don't have one address: LAN name, Tailscale name, real domain. So now it follows the host the page was loaded from, and the browser and authenticator do the rest of the binding.

What success buys is small on purpose: a 5-minute token, in memory only, extended while you read.

```csharp
// Deliberately ephemeral: tokens die with the process, so a restart re-locks
// everything. Nothing sensitive is persisted.
```

The blur on the Vault page is looks. The lock is the server refusing to send the text without that token.

## 5. The one door into someone else's vault

Everyone's notes are walled off. One feature has to cross the wall: `@mentions`. When Ana writes `@jun`, something lands in **Jun's** vault:

![Jun's notifications: "@ana mentioned you in Launch plan", quoting the line](/blog-covers/app-notifications-jun.png)

```csharp
// This is the ONLY code path in Papyra that writes into a vault the caller does
// not own. It touches exactly one file — the recipient's Inbox.md — and gets
// there through PathGuard against the *recipient's* base dir.
```

The door is as small as it can be: one file, the same path check as everything else, detected on the server (so API keys can't skip it), capped at 20 deliveries per sender per recipient per hour, and **no text copied** unless Jun can already read the note. Jun sees the line above only because Ana shared that note with him. Mention an unknown username and nothing happens, silently: a note body shouldn't tell you which accounts exist.

***

_I'm Rahul, and I build Papyra on my own. It's GPLv3 and self-hosted: one Docker container, your notes as plain Markdown files._
[_GitHub_](https://github.com/lyfie-org/papyra) _·_ [_Live demo, no signup_](https://papyra.app/demo) _·_ [_Docs_](https://papyra.app/docs)
