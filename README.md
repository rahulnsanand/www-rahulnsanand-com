<div align="center">
  <img src="https://raw.githubusercontent.com/rahulnsanand/www-rahulnsanand-com/main/public/logo-light.png" alt="Rahul NS Anand logo" width="220" />

  <h1>Rahul NS Anand - Developer Portfolio</h1>
  <p><strong>Minimal. Intentional. SEO-first. Built for signal, not noise.</strong></p>

  <p>
    <a href="https://www.rahulnsanand.com">🌐 Live Site</a> |
    <a href="https://github.com/rahulnsanand/www-rahulnsanand-com">📦 Repository</a> |
    <a href="https://www.rahulnsanand.com/blogs">📝 Blogs</a> |
    <a href="https://www.rahulnsanand.com/projects">🚀 Projects</a>
  </p>

  <p>
    <img alt="Website" src="https://img.shields.io/website?url=https%3A%2F%2Fwww.rahulnsanand.com&style=for-the-badge&logo=google-chrome&logoColor=white&label=site" />
    <img alt="Next.js" src="https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=nextdotjs" />
    <img alt="React" src="https://img.shields.io/badge/React-19-149ECA?style=for-the-badge&logo=react&logoColor=white" />
    <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white" />
    <img alt="PNPM" src="https://img.shields.io/badge/PNPM-9-F69220?style=for-the-badge&logo=pnpm&logoColor=white" />
    <img alt="License" src="https://img.shields.io/badge/License-AGPL--3.0-8A2BE2?style=for-the-badge" />
    <img alt="GitHub stars" src="https://img.shields.io/github/stars/rahulnsanand/www-rahulnsanand-com?style=for-the-badge" />
  </p>
</div>

## 🧭 What This Project Is
A narrative-first portfolio and technical writing site for **Rahul NS Anand**, focused on:
- 🧠 AI + personal data product thinking
- ⚙️ reliable engineering systems
- 🎨 quiet, premium, design-led UX
- 🔍 discoverability via structured SEO content

## 🧱 Tech Stack
- ⚡ **Next.js 16** (App Router)
- ⚛️ **React 19**
- 🔐 **TypeScript** (strict)
- 🎯 **TailwindCSS + custom global styles**
- 🧩 **Phosphor Icons**
- 🔎 **Fuse.js** for client-side blog search
- 🎞️ **Motion** for transitions and micro-interactions

## 🌟 Key Features
- 🏠 Clean landing page with social portal links
- 👤 About page driven by structured JSON content
- ✍️ Markdown blog system with frontmatter validation
- 🔍 Fast blog search + recent/previous blog split
- 📈 Auto-generated SEO artifacts:
  - `robots.ts`
  - `sitemap.ts`
  - `public/llms.txt`
  - `public/llms-full.txt`
  - `public/seo/content-index.json`
- 🌓 Theme persistence (light/dark)

## 🗂️ Project Structure
```txt
src/
  app/             # routes, metadata, seo handlers
  components/      # home, blog, layout, ui building blocks
  content/         # blog markdown + about data
  lib/             # content parsing, formatting helpers
  styles/          # global design system styles
scripts/           # content + SEO generators
public/            # logos, blog media fallback, generated public SEO files
```

## 🚀 Run Locally
```bash
pnpm install
pnpm dev
```
Open `http://localhost:3000`

## 🛠️ Useful Commands
```bash
pnpm dev          # start local development
pnpm lint         # run ESLint
pnpm typecheck    # run type checks
pnpm build        # production build
pnpm sync:content # regenerate robots/sitemap/llms/content index
```

## 📝 Blog Authoring Quickstart
Create a markdown file in `src/content/blog` with required frontmatter:

```md
---
title: "Your title"
description: "Short summary"
date: "2026-03-06"
tags:
  - engineering
  - product
coverImage: "https://..." # optional
youtubeUrl: "https://..." # optional
---

Your content here.
```

## 🔗 Connect
- 🐙 GitHub: https://github.com/rahulnsanand
- 💼 LinkedIn: https://www.linkedin.com/in/rahulnsanand
- ▶️ YouTube: https://www.youtube.com/@rahulnsanand
- ✍️ Medium: https://medium.com/@rahulnsanand
- 👨‍💻 Dev.to: https://dev.to/rahulnsanand

---

## 👨‍💻 Developer Note
Want to reuse this portfolio as your own starter? Go for it.

If this project helps you, please:
1. ⭐ Star this repo: https://github.com/rahulnsanand/www-rahulnsanand-com
2. 🙏 Add a small credit link back to Rahul (in README/footer/about).

That keeps the open-source energy fair and sustainable. 💙
