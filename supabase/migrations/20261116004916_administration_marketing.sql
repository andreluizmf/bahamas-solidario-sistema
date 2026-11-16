begin;

create table public.campaign_plans (
 id uuid primary key default gen_random_uuid(),
 campaign_id uuid not null unique references public.campaigns(id) on delete restrict,
 objective text not null default '' check (char_length(objective) <= 1500),
 responsible text not null default '' check (char_length(responsible) <= 100),
 audience text not null default '' check (char_length(audience) <= 800),
 value_proposition text not null default '' check (char_length(value_proposition) <= 1000),
 budget numeric(12,2) not null default 0 check (budget between 0 and 100000000),
 analysis jsonb not null default '{}'::jsonb check (jsonb_typeof(analysis) = 'object' and octet_length(analysis::text) <= 24000),
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);
create table public.management_tasks (
 id uuid primary key default gen_random_uuid(),
 campaign_id uuid not null references public.campaigns(id) on delete restrict,
 title text not null check (char_length(title) between 3 and 160),
 responsible text not null default '' check (char_length(responsible) <= 100),
 deadline date not null,
 status text not null default 'todo' check (status in ('todo','doing','done','cancelled')),
 notes text not null default '' check (char_length(notes) <= 2000),
 completed_on date,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);
create table public.campaign_expenses (
 id uuid primary key default gen_random_uuid(),
 campaign_id uuid not null references public.campaigns(id) on delete restrict,
 description text not null check (char_length(description) between 3 and 160),
 category text not null default 'operacao' check (category in ('operacao','logistica','materiais','outros')),
 amount numeric(12,2) not null check (amount > 0 and amount <= 100000000),
 occurred_on date not null default current_date check (occurred_on <= current_date),
 status text not null default 'recorded' check (status in ('recorded','cancelled')),
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);
create table public.marketing_actions (
 id uuid primary key default gen_random_uuid(),
 campaign_id uuid not null references public.campaigns(id) on delete restrict,
 title text not null check (char_length(title) between 3 and 160),
 channel text not null check (channel in ('instagram','whatsapp','email','loja','parcerias','outros')),
 responsible text not null default '' check (char_length(responsible) <= 100),
 publish_on date not null,
 status text not null default 'draft' check (status in ('draft','scheduled','published','cancelled')),
 message text not null default '' check (char_length(message) <= 3000),
 reach integer not null default 0 check (reach between 0 and 100000000),
 interactions integer not null default 0 check (interactions between 0 and 100000000),
 clicks integer not null default 0 check (clicks between 0 and 100000000),
 conversions integer not null default 0 check (conversions between 0 and 100000000),
 cost numeric(12,2) not null default 0 check (cost between 0 and 100000000),
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now(),
 constraint published_results_only check (status in ('published','cancelled') or (reach = 0 and interactions = 0 and clicks = 0 and conversions = 0)),
 constraint publication_not_future check (status <> 'published' or publish_on <= current_date)
);
create index management_tasks_campaign_deadline on public.management_tasks(campaign_id, deadline);
create index campaign_expenses_campaign_date on public.campaign_expenses(campaign_id, occurred_on);
create index marketing_actions_campaign_date on public.marketing_actions(campaign_id, publish_on);

create function public.set_task_completion() returns trigger
language plpgsql set search_path = '' as $$
begin
 if new.status = 'done' then
   if tg_op = 'INSERT' then new.completed_on := (now() at time zone 'America/Sao_Paulo')::date;
   elsif old.status <> 'done' then new.completed_on := (now() at time zone 'America/Sao_Paulo')::date;
   else new.completed_on := old.completed_on;
   end if;
 else new.completed_on := null;
 end if;
 return new;
end $$;
revoke all on function public.set_task_completion() from public, anon, authenticated;
create trigger task_completion before insert or update on public.management_tasks for each row execute function public.set_task_completion();

-- All records are internal; no public reads, writes or deletion API.
do $$
declare table_name text;
begin
 foreach table_name in array array['campaign_plans','management_tasks','campaign_expenses','marketing_actions'] loop
   execute format('alter table public.%I enable row level security', table_name);
   execute format('revoke all on public.%I from public, anon, authenticated', table_name);
   execute format('grant select, insert, update on public.%I to authenticated', table_name);
   execute format('create policy admin_read on public.%I for select to authenticated using ((select public.is_admin()))', table_name);
   execute format('create policy admin_insert on public.%I for insert to authenticated with check ((select public.is_admin()))', table_name);
   execute format('create policy admin_update on public.%I for update to authenticated using ((select public.is_admin())) with check ((select public.is_admin()))', table_name);
   execute format('create trigger management_touch before update on public.%I for each row execute function public.touch_updated()', table_name);
   execute format('create trigger management_audit after insert or update on public.%I for each row execute function public.record_audit()', table_name);
 end loop;
end $$;
notify pgrst, 'reload schema';
commit;
