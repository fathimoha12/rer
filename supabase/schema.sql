-- Edge Journal Supabase schema
-- Run this in the Supabase SQL editor after creating your project.

create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  timezone text default 'UTC',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.trading_accounts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null default 'Primary account',
  firm_name text,
  starting_balance numeric(14, 2) not null default 0,
  account_type text not null default 'Challenge',
  currency text not null default 'USD',
  account_phase text,
  broker_name text,
  max_daily_loss numeric(14, 2) not null default 0,
  max_loss numeric(14, 2) not null default 0,
  target_profit_phase_1 numeric(14, 2) not null default 0,
  target_profit_phase_2 numeric(14, 2) not null default 0,
  rules_notes text,
  is_active boolean not null default true,
  default_risk_amount numeric(14, 2) not null default 100,
  default_rr numeric(8, 3) not null default 3,
  max_daily_risk_percent numeric(5, 2) not null default 3,
  max_weekly_drawdown_percent numeric(5, 2) not null default 6,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.strategies (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  description text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  unique (user_id, name)
);

do $$
begin
  if not exists (select 1 from pg_type where typname = 'trade_direction') then
    create type public.trade_direction as enum ('Buy', 'Sell');
  end if;
end $$;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'trade_result') then
    create type public.trade_result as enum ('TP', 'SL', 'BE', 'Partial', 'Open');
  end if;
end $$;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'trading_session') then
    create type public.trading_session as enum ('Asia', 'London', 'New York');
  end if;
end $$;

create table if not exists public.trades (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  strategy_id uuid references public.strategies(id) on delete set null,
  pair text not null,
  direction public.trade_direction not null,
  entry numeric(16, 6) not null,
  stop_loss numeric(16, 6) not null,
  take_profit numeric(16, 6) not null,
  risk_amount numeric(14, 2) not null,
  reward_amount numeric(14, 2) not null,
  rr numeric(8, 3) not null default 3,
  result public.trade_result not null,
  profit_loss numeric(14, 2) not null,
  r_multiple numeric(8, 3) not null,
  trade_date date not null,
  purging_time time,
  session public.trading_session not null,
  strategy_names text[] not null default '{}',
  area text not null default 'Backtesting',
  backtest_cycle text not null default 'Journey 1',
  trading_account_id uuid references public.trading_accounts(id) on delete set null,
  account_profile_name text,
  prop_firm_name text,
  account_size numeric(14, 2),
  account_phase text,
  broker_name text,
  strategy_points text[] not null default '{}',
  emotion text,
  mistake text,
  notes text,
  screenshot_url text,
  before_screenshot_url text,
  after_screenshot_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.trades add column if not exists before_screenshot_url text;
alter table public.trades add column if not exists after_screenshot_url text;
alter table public.trades add column if not exists backtest_cycle text not null default 'Journey 1';
alter table public.trades add column if not exists purging_time time;
alter table public.trades add column if not exists trading_account_id uuid references public.trading_accounts(id) on delete set null;
alter table public.trades add column if not exists account_profile_name text;
alter table public.trades add column if not exists prop_firm_name text;
alter table public.trades add column if not exists account_size numeric(14, 2);
alter table public.trades add column if not exists account_phase text;
alter table public.trades add column if not exists broker_name text;

alter table public.trading_accounts add column if not exists firm_name text;
alter table public.trading_accounts add column if not exists account_type text not null default 'Challenge';
alter table public.trading_accounts add column if not exists account_phase text;
alter table public.trading_accounts add column if not exists broker_name text;
alter table public.trading_accounts add column if not exists max_daily_loss numeric(14, 2) not null default 0;
alter table public.trading_accounts add column if not exists max_loss numeric(14, 2) not null default 0;
alter table public.trading_accounts add column if not exists target_profit_phase_1 numeric(14, 2) not null default 0;
alter table public.trading_accounts add column if not exists target_profit_phase_2 numeric(14, 2) not null default 0;
alter table public.trading_accounts add column if not exists rules_notes text;
alter table public.trading_accounts add column if not exists is_active boolean not null default true;

create table if not exists public.screenshots (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  trade_id uuid references public.trades(id) on delete cascade,
  storage_path text,
  public_url text,
  caption text,
  created_at timestamptz not null default now()
);

create table if not exists public.journal_notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  trade_id uuid references public.trades(id) on delete cascade,
  title text,
  body text not null,
  note_date date not null default current_date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.course_lessons (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  module text not null default 'Course',
  youtube_url text not null,
  youtube_id text not null,
  description text,
  duration_minutes integer,
  lesson_order integer not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.course_playlists (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  category text not null default 'Course playlist',
  youtube_url text not null,
  playlist_id text not null,
  first_video_id text,
  playlist_order integer not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, playlist_id)
);

create table if not exists public.admin_course_playlists (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  category text not null default 'Course playlist',
  youtube_url text not null,
  playlist_id text not null unique,
  first_video_id text,
  playlist_order integer not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.admin_course_videos (
  id uuid primary key default gen_random_uuid(),
  playlist_id text not null references public.admin_course_playlists(playlist_id) on delete cascade,
  video_id text not null,
  title text not null,
  module text not null default 'Course video',
  duration text not null default '0:00',
  video_order integer not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (playlist_id, video_id)
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_updated_at on public.profiles;
create trigger profiles_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

drop trigger if exists trading_accounts_updated_at on public.trading_accounts;
create trigger trading_accounts_updated_at
before update on public.trading_accounts
for each row execute function public.set_updated_at();

drop trigger if exists trades_updated_at on public.trades;
create trigger trades_updated_at
before update on public.trades
for each row execute function public.set_updated_at();

drop trigger if exists journal_notes_updated_at on public.journal_notes;
create trigger journal_notes_updated_at
before update on public.journal_notes
for each row execute function public.set_updated_at();

drop trigger if exists course_lessons_updated_at on public.course_lessons;
create trigger course_lessons_updated_at
before update on public.course_lessons
for each row execute function public.set_updated_at();

drop trigger if exists course_playlists_updated_at on public.course_playlists;
create trigger course_playlists_updated_at
before update on public.course_playlists
for each row execute function public.set_updated_at();

drop trigger if exists admin_course_playlists_updated_at on public.admin_course_playlists;
create trigger admin_course_playlists_updated_at
before update on public.admin_course_playlists
for each row execute function public.set_updated_at();

drop trigger if exists admin_course_videos_updated_at on public.admin_course_videos;
create trigger admin_course_videos_updated_at
before update on public.admin_course_videos
for each row execute function public.set_updated_at();

create or replace function public.limit_backtesting_trades()
returns trigger
language plpgsql
as $$
declare
  current_section_trades integer;
  max_section_trades integer;
begin
  max_section_trades := case
    when new.area = 'Backtesting' then 100
    when new.area = 'Forward Testing' then 10
    when new.area = 'Funded Challenge' then 100
    when new.area = 'Account Challenge' then 100
    else null
  end;

  if max_section_trades is not null then
    new.backtest_cycle = coalesce(nullif(new.backtest_cycle, ''), 'Journey 1');

    select count(*) into current_section_trades
    from public.trades
    where user_id = new.user_id
      and area = new.area
      and coalesce(nullif(backtest_cycle, ''), 'Journey 1') = new.backtest_cycle
      and id <> new.id;

    if current_section_trades >= max_section_trades then
      raise exception '% journey limit reached. Maximum % trades allowed per journey.', new.area, max_section_trades;
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists trades_limit_backtesting on public.trades;
create trigger trades_limit_backtesting
before insert or update on public.trades
for each row execute function public.limit_backtesting_trades();

create or replace function public.enforce_live_daily_trade_discipline()
returns trigger
language plpgsql
as $$
declare
  same_day_trades integer;
  same_session_trades integer;
begin
  if new.area in ('Forward Testing', 'Funded Challenge', 'Account Challenge') then
    new.backtest_cycle = coalesce(nullif(new.backtest_cycle, ''), 'Journey 1');

    select count(*) into same_day_trades
    from public.trades
    where user_id = new.user_id
      and area = new.area
      and coalesce(nullif(backtest_cycle, ''), 'Journey 1') = new.backtest_cycle
      and trade_date = new.trade_date
      and id <> new.id;

    if same_day_trades >= 3 then
      raise exception 'Over trading blocked. Maximum 3 trades per day for %, divided across Asia, London, and New York.', new.area;
    end if;

    select count(*) into same_session_trades
    from public.trades
    where user_id = new.user_id
      and area = new.area
      and coalesce(nullif(backtest_cycle, ''), 'Journey 1') = new.backtest_cycle
      and trade_date = new.trade_date
      and session = new.session
      and id <> new.id;

    if same_session_trades > 0 then
      raise exception 'Session discipline blocked. Only one % trade is allowed per day in the % session.', new.area, new.session;
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists trades_live_daily_trade_discipline on public.trades;
create trigger trades_live_daily_trade_discipline
before insert or update on public.trades
for each row execute function public.enforce_live_daily_trade_discipline();

alter table public.profiles enable row level security;
alter table public.trading_accounts enable row level security;
alter table public.strategies enable row level security;
alter table public.trades enable row level security;
alter table public.screenshots enable row level security;
alter table public.journal_notes enable row level security;
alter table public.course_lessons enable row level security;
alter table public.course_playlists enable row level security;
alter table public.admin_course_playlists enable row level security;
alter table public.admin_course_videos enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own" on public.profiles
for select using (auth.uid() = id);
drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own" on public.profiles
for insert with check (auth.uid() = id);
drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles
for update using (auth.uid() = id) with check (auth.uid() = id);

drop policy if exists "trading_accounts_own" on public.trading_accounts;
create policy "trading_accounts_own" on public.trading_accounts
for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "strategies_own" on public.strategies;
create policy "strategies_own" on public.strategies
for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "trades_own" on public.trades;
create policy "trades_own" on public.trades
for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "screenshots_own" on public.screenshots;
create policy "screenshots_own" on public.screenshots
for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "journal_notes_own" on public.journal_notes;
create policy "journal_notes_own" on public.journal_notes
for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "course_lessons_own" on public.course_lessons;
create policy "course_lessons_own" on public.course_lessons
for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "course_playlists_own" on public.course_playlists;
create policy "course_playlists_own" on public.course_playlists
for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create index if not exists trades_user_date_idx on public.trades(user_id, trade_date desc);
create index if not exists trades_user_pair_idx on public.trades(user_id, pair);
create index if not exists trades_user_strategy_idx on public.trades(user_id, strategy_id);
create index if not exists trades_user_backtest_cycle_idx on public.trades(user_id, area, backtest_cycle);
create index if not exists trades_user_trading_account_idx on public.trades(user_id, trading_account_id);
create index if not exists trading_accounts_user_active_idx on public.trading_accounts(user_id, is_active);
create index if not exists journal_notes_user_date_idx on public.journal_notes(user_id, note_date desc);
create index if not exists course_lessons_user_order_idx on public.course_lessons(user_id, lesson_order, created_at);
create index if not exists course_playlists_user_order_idx on public.course_playlists(user_id, playlist_order, created_at);
create index if not exists admin_course_playlists_order_idx on public.admin_course_playlists(playlist_order, created_at);
create index if not exists admin_course_videos_playlist_order_idx on public.admin_course_videos(playlist_id, video_order, created_at);
