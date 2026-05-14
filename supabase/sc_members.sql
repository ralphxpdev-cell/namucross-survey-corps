create table if not exists sc_members (
  name       text primary key,
  api_key    text not null,
  updated_at timestamptz default now()
);

alter table sc_members enable row level security;
create policy "allow_all" on sc_members for all using (true) with check (true);
