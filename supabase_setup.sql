-- SQL to create the waitlist_signups table and indexes

create table if not exists public.waitlist_signups (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  category text not null check (category in ('books','games','music')),
  query text,
  source text not null default 'tipofmy',
  utm_source text,
  utm_medium text,
  utm_campaign text,
  created_at timestamptz not null default now()
);

-- Indexes for better performance
create index if not exists waitlist_signups_created_at_idx
  on public.waitlist_signups(created_at desc);

create index if not exists waitlist_signups_category_idx
  on public.waitlist_signups(category);

-- Prevent duplicate signups for the same category and email
create unique index if not exists waitlist_unique_email_category
  on public.waitlist_signups (lower(email), category);

-- Enable RLS (Row Level Security) if needed
-- alter table public.waitlist_signups enable row level security;
