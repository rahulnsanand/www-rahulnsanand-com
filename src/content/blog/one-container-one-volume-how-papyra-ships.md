---
title: 'One container, one volume: how Papyra ships'
description: A .NET API, a React app and a live-editing engine in one Docker image. Plus friendly env vars, a demo with no server, and a 7,500-line Program.cs.
date: 2026-10-24
tags:
  - docker
  - selfhosted
  - dotnet
  - devops
coverImage: /blog-covers/cover-09-one-container.png
youtubeUrl: ''
mediumUrl: ''
devtoUrl: ''
---

[Papyra](https://github.com/lyfie-org/papyra)'s promise is: one container, one volume. Here's what that means, and four small things that make it hold.

```bash
curl -O https://raw.githubusercontent.com/lyfie-org/papyra/main/docker-compose.hub.yml
docker compose -f docker-compose.hub.yml up -d
```

Open `http://localhost:8080`. Setup walks you through your account and authenticator app.

![Diagram: one container on port 8080 with an entrypoint that drops root, a .NET API serving the app and API, and a Node live-editing engine as a child process; one /data volume with notes, media and a hidden .papyra folder holding caches and keys](/blog-covers/diag-container.png)

## 1. Even live editing lives inside

1.0 added live editing. The easy way would have been a second container. Instead the API starts the engine as a child process, and browsers only ever talk to the API:

```dockerfile
# nodejs: runs the bundled collab engine (live editing) as a child of the API.
RUN apk add --no-cache icu-libs su-exec shadow tzdata nodejs
```

Don't want it? `PAPYRA_COLLAB_ENABLED=false`, and shared notes use plain autosave.

The image also ships a health check, and because startup catches up with the notes folder _before_ the port opens, a green check means search already matches your files. The entrypoint reads `PUID`/`PGID` so files in `/data` are owned by you, not root, and you can still edit them over Syncthing or SMB.

## 2. Environment variables for humans

.NET wants nested settings spelled with double underscores. Get it slightly wrong and nothing errors. The setting is just ignored.

![Diagram: the .NET spelling (Papyra__DataDir, Cors__AllowedOrigins__0, __1) next to what a person types (PAPYRA_DATA_DIR, PAPYRA_ALLOWED_ORIGINS as one comma-separated value); Papyra accepts both and the .NET spelling wins](/blog-covers/diag-env-names.png)

So Papyra accepts what people would guess, with lists comma-separated like every other image:

```csharp
private static readonly (string Env, string Key)[] Scalars =
[
    ("PAPYRA_DATA_DIR", "Papyra:DataDir"),
    ("PAPYRA_ALLOW_INSECURE_COOKIES", "Papyra:AllowInsecureCookies"),
    ("PAPYRA_COLLAB_ENABLED", "Features:Collab"),
    // …
];
```

The .NET spellings still work and win if both are set. Twenty lines that remove a whole family of "I set it and nothing happened".

The compose file stays short (one image, one port, one volume) and every setting lives in one table in the [configuration docs](https://papyra.app/docs/configuration/). The one I'd point everyone at came from a real problem: open Papyra at a bare address like `http://192.168.1.50:8080`, or over a Tailscale IP, and signing in appears to work, then logs you straight back out. Browsers won't keep a `Secure` session cookie for a site that isn't https (localhost excepted).

```yaml
PAPYRA_ALLOW_INSECURE_COOKIES: "true"   # only on a network that's already private
```

## 3. A demo with no server at all

The hardest part of self-hosted software is the Docker command before someone has seen the app. So there's a [demo](https://papyra.app/demo) that runs entirely in the browser:

![The Papyra demo: the real desk with a banner at the bottom saying "This is a demo. Everything runs in your browser — nothing is sent anywhere."](/blog-covers/app-demo.png)

It's the real app. Papyra has no central API client, just a lot of `fetch()` calls (141 lines across 57 files), so the demo build replaces `globalThis.fetch` and answers `/api/*` in the tab:

![Diagram: the normal build sends /api requests to the Papyra server; the demo build sends the same requests to a replaced globalThis.fetch that runs a fake server in the tab](/blog-covers/diag-static-demo.png)

No call site knows. So the demo can't drift from the app.

One trap worth knowing if you host a single-page app on Cloudflare Pages: the usual `/demo/* /demo/index.html 200` rule is rejected as an infinite loop, and per-route rules turn into cached redirects. What works is no rule at all: a copy of `index.html` named `404.html`. Pages serves it for unknown paths and leaves the URL alone.

## 4. A 7,500-line Program.cs

![Terminal: wc -l says Program.cs has about 7,500 lines; grep counts its route groups and Map calls](/blog-covers/term-programcs.png)

Almost every HTTP route is in one Minimal API file, grouped:

![Diagram: the line number where each route group starts in Program.cs, from /api/auth to /api/backups; newer features live in separate files](/blog-covers/diag-program-map.png)

It sounds bad. In practice, one Ctrl+F finds any route, its auth rule and its docs together, and a route missing `.RequireAuthorization()` stands out. The costs are real too: your editor feels it, and helpers at the bottom become a junk drawer.

What actually happened as it grew: the newest features didn't go in.

```csharp
app.MapMedia();      // Features/MediaEndpoints.cs
app.MapCollab();     // Collab/CollabEndpoints.cs
app.MapComments();   // Features/CommentEndpoints.cs
```

You don't need a rule for when to split. The code tells you, one feature at a time.

## Back up one thing

The volume holds everything: notes, attachments, and `.papyra/` (search index, database, and the **key ring**). Most of `.papyra/` can be rebuilt. The keys can't: they keep you signed in and unlock locked notes. Back up the whole volume.

***

_I'm Rahul. I vibe-coded Papyra with AI coding assistants: what would have taken me a year or more to build by hand took a few months. It's GPLv3 and self-hosted: one Docker container, your notes as plain Markdown files._

_[GitHub](https://github.com/lyfie-org/papyra) · [Live demo, no signup](https://papyra.app/demo) · [Docs](https://papyra.app/docs)_
