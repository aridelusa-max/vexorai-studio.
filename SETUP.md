# Supabase setup — VEXORAI Studio v1

**Do not run this migration until you have confirmed that the Supabase project selected is the one intended for VEXORAI Studio v1.** It creates new tables and policies, and a trigger for new auth users. It does not configure Google OAuth, email settings, Storage buckets, an AI backend, or deployments.

## What this migration prepares

- `profiles`
- `projects`
- `project_files`
- `conversations` and `messages`
- `project_versions`
- `deployments`
- `usage_records`
- Row-level security (RLS) policies scoped to authenticated user IDs
- A trigger to create a profile row when a new Auth user is created

The schema intentionally keeps projects private even if the `visibility` column is changed. Public/unlisted sharing must not be enabled until separately designed share-token policies are implemented.

## Apply only after review

1. Sign in to Supabase and select the intended project.
2. Confirm the project name and project URL before proceeding.
3. Open **SQL Editor** and create a new query.
4. Paste the contents of `migrations/202610190001_initial_schema.sql`.
5. Review the SQL, then run it only if you understand that it creates these tables, policies, and trigger.
6. In **Table Editor**, verify that the new tables exist. Do not share secret keys or passwords in chat.

## Auth configuration is a separate step

Email/password and Google OAuth need to be configured in Supabase Auth. Add only the exact local and Vercel callback URLs you intend to use. Google OAuth requires a Google Cloud OAuth client and correct redirect URI. Do not claim login works until sign-up, verification, sign-in, sign-out, password reset, and session handling have been tested.

## Client configuration safety

The Supabase project URL and publishable/anon key may be used in client-side configuration when RLS is correctly enforced. Never put the `service_role` key, database password, AI-provider secret, or OAuth client secret in React code, `.env` files committed to GitHub, screenshots, or chat.
