create table public.recipes (
  id uuid default gen_random_uuid() primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  servings int,
  ingredients jsonb not null,
  steps jsonb not null,
  nutrition jsonb,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);