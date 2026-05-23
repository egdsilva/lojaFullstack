create table if not exists public.product_categories (
	name text primary key,
	created_at timestamptz not null default now()
);
