# lojaFullstack

Projeto full stack com frontend React (Vite) e backend Express, usando Supabase como banco de dados.

## 1. Configurar variaveis de ambiente

Importante: mantenha `*.env.example` apenas com placeholders. Nunca commitar chaves reais no repositorio.

Backend:
1. Copie `lojinha-backend/.env.example` para `lojinha-backend/.env`
2. Preencha:
	 - `SUPABASE_URL`
	 - `SUPABASE_SERVICE_ROLE_KEY` (secret/service role key, apenas backend)
	 - `FRONTEND_URLS` (exemplo: `http://localhost:3000,http://localhost:5173`)
	 - `ALLOW_INSECURE_TLS` (`false` por padrao; use `true` apenas em desenvolvimento se sua rede intercepta SSL)

Frontend:
1. Copie `lojinha-frontend/.env.example` para `lojinha-frontend/.env`
2. Preencha:
	 - `VITE_SUPABASE_URL`
	 - `VITE_SUPABASE_ANON_KEY` (publishable key)
	 - `VITE_API_URL` (padrao: `http://localhost:5000`)

## 2. Criar tabelas no Supabase

Execute no SQL Editor do Supabase o script:

- `database/tables/products.sql`
- `database/tables/orders.sql`
- `database/tables/product_categories.sql`
- `database/tables/admin_users.sql`

Depois de criar as tabelas, promova ao menos um usuario para admin executando no SQL Editor:

```sql
insert into public.admin_users (user_id, email)
values ('UUID_DO_USUARIO', 'admin@exemplo.com')
on conflict (user_id) do update
set is_active = true,
	email = excluded.email;
```

Padrao adotado para o projeto:

- Cada tabela deve ficar em um arquivo proprio.
- Todos os arquivos de criacao/insercao devem ficar na pasta `database/tables`.

## 3. Rodar o projeto

Backend:
```bash
cd lojinha-backend
npm install
npm run dev
```

Frontend:
```bash
cd lojinha-frontend
npm install
npm run dev
```

## 4. Endpoints principais

- `GET /api/products`
- `GET /api/products/:id`
- `GET /api/orders`
- `GET /api/orders/:id`
- `POST /api/orders`
- `PUT /api/orders/:id`
- `DELETE /api/orders/:id`
- `POST /api/orders/sync-cart`
- `POST /api/orders/:id/checkout`

As rotas agora leem e escrevem dados nas tabelas `products`, `orders` e `order_items` no Supabase.
