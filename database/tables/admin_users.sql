create table if not exists public.admin_users (
	user_id uuid primary key,
	email text,
	is_active boolean not null default true,
	created_at timestamptz not null default now()
);

create index if not exists admin_users_is_active_idx on public.admin_users(is_active);
