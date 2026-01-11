# Supabase Setup

## Running Migrations

Migrations are in `migrations/` and should be run in order via the Supabase Dashboard or CLI.

### Option 1: Supabase Dashboard (Recommended for first setup)

1. Go to your Supabase project → SQL Editor
2. Run each migration file in order:
   - `20260111000000_create_profiles.sql`
   - `20260111000001_create_entries.sql`

### Option 2: Supabase CLI

```bash
# Link to your project
supabase link --project-ref your-project-ref

# Run migrations
supabase db push
```

## Auth Configuration

Configure these providers in Supabase Dashboard → Authentication → Providers:

### Email (Required)

1. Enable Email provider
2. Recommended: Enable "Confirm email" for production

### Google OAuth (Recommended)

1. Create OAuth credentials in Google Cloud Console
2. Add authorized redirect URI: `https://YOUR_PROJECT.supabase.co/auth/v1/callback`
3. Enable Google provider in Supabase
4. Add Client ID and Client Secret

## Environment Variables

Add to `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## Schema Overview

### profiles

Extends `auth.users` with app-specific data:

- `display_name`: User-chosen name for greetings

### entries

Mood journal entries:

- `text`: Journal entry content
- `color_h/s/l`: HSL color values
- `energy_value`: 0-1 energy level
- `energy_level`: Categorical (depleted/low/balanced/elevated/high)
- `ai_generated`: False when user manually adjusted color
- `entry_date`: The day the entry represents

Both tables have RLS policies ensuring users can only access their own data.
