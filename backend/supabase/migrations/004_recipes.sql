create table recipes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id),
  title text not null,
  servings int not null,
  ingredients jsonb not null,
  steps jsonb not null,
  nutrition jsonb,
  created_at timestamptz default now()
);