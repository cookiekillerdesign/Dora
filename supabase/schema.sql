-- =====================================================================
-- Сайт Доры: база для админки. Выполните весь файл в Supabase → SQL Editor.
-- Потом:
--   1) Authentication → Users → Add user (ваш email и пароль)
--   2) insert into admins (user_id) values ('id-этого-пользователя');
--   3) Authentication → Sign In / Providers: выключите регистрацию новых пользователей
-- =====================================================================

-- Кто может редактировать сайт. Без записи здесь вход в админку ничего не даёт.
create table if not exists public.admins (
  user_id uuid primary key references auth.users on delete cascade
);
alter table public.admins enable row level security;
drop policy if exists "admins see themselves" on public.admins;
create policy "admins see themselves" on public.admins for select to authenticated using (user_id = auth.uid());

create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.admins where user_id = auth.uid())
$$;
grant execute on function public.is_admin() to authenticated;

-- Публичные блоки: главы, вырезки, тур, анонсы, мерч, соцсети, ссылки
create table if not exists public.content (
  key text primary key,
  data jsonb not null,
  updated_at timestamptz default now()
);
alter table public.content enable row level security;
drop policy if exists "content readable" on public.content;
drop policy if exists "content admin write" on public.content;
create policy "content readable" on public.content for select using (true);
create policy "content admin write" on public.content for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- Закрытый блок организаторов: напрямую читать могут только админы
create table if not exists public.private_content (
  key text primary key,
  data jsonb not null,
  updated_at timestamptz default now()
);
alter table public.private_content enable row level security;
drop policy if exists "private admin only" on public.private_content;
create policy "private admin only" on public.private_content for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- Организаторы получают фото и документы только с верным кодом (сам код не возвращается)
create or replace function public.org_kit(pin text) returns jsonb
language sql stable security definer set search_path = public as $$
  select data - 'pin' from public.private_content
  where key = 'organizers' and data ->> 'pin' = pin
$$;
grant execute on function public.org_kit(text) to anon, authenticated;

-- Хранилище для фото и файлов из админки
insert into storage.buckets (id, name, public) values ('media', 'media', true)
on conflict (id) do nothing;
drop policy if exists "media admin insert" on storage.objects;
drop policy if exists "media admin update" on storage.objects;
drop policy if exists "media admin delete" on storage.objects;
create policy "media admin insert" on storage.objects for insert to authenticated
  with check (bucket_id = 'media' and public.is_admin());
create policy "media admin update" on storage.objects for update to authenticated
  using (bucket_id = 'media' and public.is_admin());
create policy "media admin delete" on storage.objects for delete to authenticated
  using (bucket_id = 'media' and public.is_admin());

-- Стартовый набор для организаторов (код 1111, поменяйте его в админке)
insert into public.private_content (key, data) values ('organizers', '{
  "pin": "1111",
  "bio": {"ru": "Дора (Дарья Шиханова) - певица и автор песен из Саратова. Придумала жанр «кьют-рок», прославилась вирусной «Дорадурой», а затем ушла в поп-R&B на альбомах MISS и LOVESONGS.", "en": "Dora (Daria Shikhanova) is a singer-songwriter from Saratov. She coined the genre cute-rock and broke through with the viral hit Doradura."},
  "photos": [],
  "docs": [
    {"id": "tech", "title": {"ru": "Технический райдер", "en": "Technical rider"}, "url": null},
    {"id": "hosp", "title": {"ru": "Бытовой райдер", "en": "Hospitality rider"}, "url": null},
    {"id": "stage", "title": {"ru": "Сценический план", "en": "Stage plot"}, "url": null},
    {"id": "press", "title": {"ru": "Логотипы и пресс-релиз", "en": "Logos and press release"}, "url": null}
  ]
}'::jsonb) on conflict (key) do nothing;
