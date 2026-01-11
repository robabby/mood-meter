-- Migration: Create entries table
-- Stores mood journal entries with color and energy data

-- Entries table
create table public.entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  text text not null,
  color_h smallint not null,
  color_s smallint not null,
  color_l smallint not null,
  energy_value real not null,
  energy_level text not null,
  ai_generated boolean default true not null,
  reasoning text,
  entry_date date not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null,

  -- Constraints
  constraint entries_color_h_range check (color_h >= 0 and color_h <= 360),
  constraint entries_color_s_range check (color_s >= 0 and color_s <= 100),
  constraint entries_color_l_range check (color_l >= 0 and color_l <= 100),
  constraint entries_energy_value_range check (energy_value >= 0 and energy_value <= 1),
  constraint entries_energy_level_valid check (
    energy_level in ('depleted', 'low', 'balanced', 'elevated', 'high')
  )
);

comment on table public.entries is 'Mood journal entries with emotional energy and color data';
comment on column public.entries.color_h is 'HSL hue 0-360';
comment on column public.entries.color_s is 'HSL saturation 0-100';
comment on column public.entries.color_l is 'HSL lightness 0-100';
comment on column public.entries.energy_value is 'Energy level 0-1 from AI analysis';
comment on column public.entries.energy_level is 'Categorical energy: depleted/low/balanced/elevated/high';
comment on column public.entries.ai_generated is 'False when user manually adjusted the color';
comment on column public.entries.entry_date is 'The day this entry represents (may differ from created_at)';

-- Indexes
create index entries_user_id_idx on public.entries(user_id);
create index entries_user_date_idx on public.entries(user_id, entry_date);

-- Enable RLS
alter table public.entries enable row level security;

-- RLS Policies
create policy "Users can view own entries"
  on public.entries for select
  using (auth.uid() = user_id);

create policy "Users can insert own entries"
  on public.entries for insert
  with check (auth.uid() = user_id);

create policy "Users can update own entries"
  on public.entries for update
  using (auth.uid() = user_id);

create policy "Users can delete own entries"
  on public.entries for delete
  using (auth.uid() = user_id);

-- Updated timestamp trigger (reuses function from profiles migration)
create trigger entries_updated_at
  before update on public.entries
  for each row execute function public.handle_updated_at();
