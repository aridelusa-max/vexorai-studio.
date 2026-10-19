# VEXORAI Studio — prototype v1

**Tagline:** Imagine it. Build beyond.

A separate, mobile-friendly React + Vite prototype for an AI website-building platform, using the VEXORAI neon glass-orb visual identity. This folder does not change the existing LumaForge or DreamBuild projects.

## Included and currently local-only
- Dark futuristic dashboard and responsive editor UI
- Starter templates and editable sections
- Section add/reorder/delete and undo/redo
- Browser-local autosave and project save on this device
- HTML export
- Prompt-to-draft demo (local rules, **not connected to a live AI model**)
- Supabase starter schema and setup notes

## Not yet implemented
Real account sign-in, cloud project storage, real AI generation, code sandbox, image uploads, GitHub sync, deployment, billing, and team collaboration. Do not advertise these as working until implemented and tested.

## Run and verify
Requires Node.js and npm in a supported development environment:

```bash
npm install
npm run build
npm run dev
```

Test `npm run build` before deploying. No secrets or API keys belong in client code or GitHub. The Supabase migration is a starter only and is not connected to this app; review it and use a brand-new Supabase project for VEXORAI only. Never run it against LumaForge's project.

## Safe next steps
1. Create a new GitHub repository named `vexorai-studio`.
2. Upload this folder's contents, preserving `src/` and `supabase/`.
3. Verify the build in the target environment.
4. Create a separate Vercel project and separate Supabase project only after testing.
5. Add real auth, cloud persistence, and server-side AI one phase at a time.
