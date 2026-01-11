# Supabase Schema Design

**Ticket:** [SG-182](https://linear.app/sherpagg/issue/SG-182/supabase-schema-entries-table)
**Status:** Design complete, ready for implementation

## Overview

Database schema for Mood Meter, covering authentication configuration, user profiles, and mood entries.

## Key Design Decisions

### Authentication

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Auth providers | Google OAuth + Email/Password | Google for low friction, email for privacy-conscious users |
| Username | None | Not a social app; no need for unique identifiers |
| Display name | Optional, user-chosen | "What should we call you?" — personal touch without bureaucracy |
| Display name source | User input, or Google name, or email prefix | Graceful fallbacks |

### Why No Username?

This is a **personal journaling app**, not a social network:
- No sharing features
- No public profiles
- No @mentions or lookups

A display name is sufficient for greeting users warmly.

### Profiles Table

Extends Supabase's `auth.users` with app-specific data:

```sql
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,                    -- "What should we call you?"
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
```

**Notes:**
- `id` matches `auth.users.id` — no separate UUID
- `display_name` nullable — fallback to auth metadata or email
- Trigger auto-creates profile row on user signup

### Entries Table

Stores mood journal entries:

```sql
create table entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  text text not null,
  color_h smallint not null,      -- HSL hue 0-360
  color_s smallint not null,      -- HSL saturation 0-100
  color_l smallint not null,      -- HSL lightness 0-100
  energy_value real not null,     -- 0-1 float
  energy_level text not null,     -- depleted/low/balanced/elevated/high
  ai_generated boolean default true,
  reasoning text,
  entry_date date not null,       -- The day this entry is for
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
```

**Notes:**
- `on delete cascade` — entries deleted when user account deleted
- `ai_generated` — false when user manually adjusts the color
- `entry_date` — separate from `created_at` to support backdating

## Indexes

```sql
-- Fast lookup by user
create index entries_user_id_idx on entries(user_id);

-- Calendar queries: "show me all entries for January 2026"
create index entries_user_date_idx on entries(user_id, entry_date);
```

## Row Level Security (RLS)

Both tables enforce strict user isolation:

```sql
-- Profiles: users can only access their own profile
alter table profiles enable row level security;

create policy "Users can view own profile"
  on profiles for select using (auth.uid() = id);

create policy "Users can update own profile"
  on profiles for update using (auth.uid() = id);

-- Entries: users can only access their own entries
alter table entries enable row level security;

create policy "Users can view own entries"
  on entries for select using (auth.uid() = user_id);

create policy "Users can insert own entries"
  on entries for insert with check (auth.uid() = user_id);

create policy "Users can update own entries"
  on entries for update using (auth.uid() = user_id);

create policy "Users can delete own entries"
  on entries for delete using (auth.uid() = user_id);
```

## Auto-create Profile on Signup

Trigger ensures every user has a profile row:

```sql
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id)
  values (new.id);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
```

## Updated Timestamp Trigger

Keep `updated_at` current:

```sql
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger profiles_updated_at
  before update on profiles
  for each row execute function public.handle_updated_at();

create trigger entries_updated_at
  before update on entries
  for each row execute function public.handle_updated_at();
```

## Supabase Auth Configuration

Configure in Supabase Dashboard → Authentication → Providers:

1. **Email:** Enable with "Confirm email" (recommended)
2. **Google:** Enable with OAuth credentials from Google Cloud Console

## Files

- `supabase/migrations/20260111000000_create_profiles.sql`
- `supabase/migrations/20260111000001_create_entries.sql`
- `src/types/database.ts` — Generated TypeScript types

## Onboarding Flow

```
User signs up (Google or Email)
    ↓
Trigger creates empty profile row
    ↓
First app visit detects null display_name
    ↓
Show: "What should we call you?"
    ↓
Save to profiles.display_name
    ↓
"Good morning, [name]"
```

## Implementation Checklist

- [ ] Create `supabase/migrations/` directory
- [ ] Write profiles migration
- [ ] Write entries migration
- [ ] Generate TypeScript types
- [ ] Document how to run migrations
