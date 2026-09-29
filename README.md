# Morni

One selfie a day, straight to your person's home screen.

| Folder | What |
|---|---|
| `ios/` | SwiftUI app + WidgetKit widgets + Notification Service Extension (XcodeGen project) |
| `supabase/` | Postgres schema, RLS, Edge Functions (push, invites, subscriptions, widget feed) |
| `web/` | Landing page, invite links, legal pages (Next.js, deployed to a VPS with Docker + Caddy) |
| `design/` | Brand, mood stickers and app icon sources (`design/scripts`) |
| `marketing/` | App Store copy (EN/FR/ES), TikTok scripts, launch checklist |
| `docs/` | Plan and step-by-step setup (`docs/SETUP.md`) |

No Mac needed: iOS builds and TestFlight uploads run on GitHub Actions.
