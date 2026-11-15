begin;

create table public.administrators (
  user_id uuid primary key references auth.users(id) on delete cascade,
  name text not null check (char_length(name) between 2 and 100),
  email text not null check (char_length(email) <= 254),
  created_at timestamptz not null default now()
);
create function public.is_admin() returns boolean
language sql stable security definer set search_path = ''
as $$ select exists(select 1 from public.administrators where user_id = auth.uid()); $$;
revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated;

create table public.campaigns (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 3 and 120),
  category text not null check (category in ('Alimentos','Agasalhos','Higiene','Brinquedos','Educação','Outros')),
  description text not null default '' check (char_length(description) <= 5000),
  beneficiary text not null default '' check (char_length(beneficiary) <= 200),
  location text not null default '' check (char_length(location) <= 300),
  starts_on date not null default current_date,
  ends_on date not null,
  status text not null default 'active' check (status in ('planned','active','completed','archived')),
  published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint campaign_dates check (ends_on >= starts_on)
);
create table public.campaign_needs (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.campaigns(id) on delete restrict,
  item text not null check (char_length(item) between 2 and 100),
  goal numeric(12,2) not null check (goal > 0 and goal <= 100000000),
  unit text not null check (char_length(unit) between 1 and 30),
  active boolean not null default true,
  position integer not null default 0
);
create table public.donations (
  id uuid primary key default gen_random_uuid(),
  need_id uuid not null references public.campaign_needs(id) on delete restrict,
  quantity numeric(12,2) not null check (quantity > 0 and quantity <= 100000000),
  donor_name text not null default '' check (char_length(donor_name) <= 150),
  donor_contact text not null default '' check (char_length(donor_contact) <= 200),
  notes text not null default '' check (char_length(notes) <= 2000),
  status text not null default 'pending' check (status in ('pending','received','cancelled')),
  donated_on date not null default current_date check (donated_on <= current_date),
  created_by uuid references auth.users(id) on delete set null default auth.uid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table public.site_settings (
  id integer primary key default 1 check (id = 1),
  hero_title text not null default 'Solidariedade que transforma a nossa comunidade.' check (char_length(hero_title) between 5 and 160),
  hero_description text not null default 'Conheça as campanhas do Bahamas Solidário e descubra como fazer parte de cada transformação.' check (char_length(hero_description) <= 600),
  about text not null default 'Conectamos pessoas e iniciativas para apoiar quem mais precisa, com organização, cuidado e transparência.' check (char_length(about) <= 5000),
  contact_email text not null default '' check (char_length(contact_email) <= 254),
  contact_phone text not null default '' check (char_length(contact_phone) <= 40),
  collection_address text not null default '' check (char_length(collection_address) <= 500),
  opening_hours text not null default '' check (char_length(opening_hours) <= 200),
  donation_instructions text not null default 'Escolha uma campanha e confira os itens necessários. Entre em contato com nossa equipe para combinar a entrega.' check (char_length(donation_instructions) <= 3000),
  privacy_notice text not null default 'As informações pessoais de doadores são restritas à equipe administrativa. O portal divulga somente campanhas e resultados agregados.' check (char_length(privacy_notice) <= 3000),
  updated_at timestamptz not null default now()
);
insert into public.site_settings(id) values(1);
create table public.audit_log (
  id bigint generated always as identity primary key,
  actor_id uuid,
  action text not null,
  entity text not null,
  entity_id text not null,
  created_at timestamptz not null default now()
);
create table public.legacy_imports (
  fingerprint text primary key,
  created_at timestamptz not null default now()
);
create index donations_need_status on public.donations(need_id,status);
create index donations_date on public.donations(donated_on desc);
create index needs_campaign on public.campaign_needs(campaign_id);
create index campaigns_public on public.campaigns(published,status,ends_on);
create index audit_created on public.audit_log(created_at desc);

create function public.touch_updated() returns trigger
language plpgsql set search_path = '' as $$ begin new.updated_at = clock_timestamp(); return new; end $$;
create trigger campaign_touch before update on public.campaigns for each row execute function public.touch_updated();
create trigger donation_touch before update on public.donations for each row execute function public.touch_updated();
create trigger settings_touch before update on public.site_settings for each row execute function public.touch_updated();
create function public.record_audit() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  insert into public.audit_log(actor_id,action,entity,entity_id)
  values(auth.uid(),tg_op,tg_table_name,coalesce(to_jsonb(new)->>'id',to_jsonb(old)->>'id',to_jsonb(new)->>'user_id',to_jsonb(old)->>'user_id','1'));
  return coalesce(new,old);
end $$;
create trigger campaign_audit after insert or update on public.campaigns for each row execute function public.record_audit();
create trigger donation_audit after insert or update on public.donations for each row execute function public.record_audit();
create trigger settings_audit after update on public.site_settings for each row execute function public.record_audit();
create trigger team_audit after insert or delete on public.administrators for each row execute function public.record_audit();

alter table public.administrators enable row level security;
alter table public.campaigns enable row level security;
alter table public.campaign_needs enable row level security;
alter table public.donations enable row level security;
alter table public.site_settings enable row level security;
alter table public.audit_log enable row level security;
alter table public.legacy_imports enable row level security;
create policy team_read on public.administrators for select to authenticated using(public.is_admin());
create policy campaign_read on public.campaigns for select to authenticated using(public.is_admin());
create policy needs_read on public.campaign_needs for select to authenticated using(public.is_admin());
create policy donation_admin on public.donations for all to authenticated using(public.is_admin()) with check(public.is_admin());
create policy settings_read on public.site_settings for select to anon, authenticated using(true);
create policy settings_update on public.site_settings for update to authenticated using(public.is_admin()) with check(public.is_admin());
create policy audit_read on public.audit_log for select to authenticated using(public.is_admin());
revoke all on public.administrators, public.campaigns, public.campaign_needs, public.donations, public.site_settings, public.audit_log, public.legacy_imports from anon, authenticated;
grant select on public.site_settings to anon, authenticated;
grant select on public.administrators, public.campaigns, public.campaign_needs, public.audit_log to authenticated;
grant select,insert,update on public.donations to authenticated;
grant update on public.site_settings to authenticated;

-- A única leitura pública das campanhas é esta projeção, sem nomes ou contatos de doadores.
create function public.public_campaigns() returns jsonb
language sql stable security definer set search_path = '' as $$
select coalesce(jsonb_agg(result order by created_at desc),'[]'::jsonb) from (
  select c.created_at, jsonb_build_object(
    'id',c.id,'name',c.name,'category',c.category,'description',c.description,
    'beneficiary',c.beneficiary,'location',c.location,'starts_on',c.starts_on,'ends_on',c.ends_on,
    'status',c.status,'published',true,'updated_at',c.updated_at,
    'needs',coalesce((select jsonb_agg(jsonb_build_object('id',n.id,'item',n.item,'goal',n.goal,'unit',n.unit,
      'received',coalesce((select sum(d.quantity) from public.donations d where d.need_id=n.id and d.status='received'),0)) order by n.position)
      from public.campaign_needs n where n.campaign_id=c.id and n.active),'[]'::jsonb),
    'donation_count',(select count(*) from public.donations d join public.campaign_needs n on n.id=d.need_id where n.campaign_id=c.id and d.status='received')
  ) result from public.campaigns c where c.published and c.status <> 'archived'
) q $$;
revoke all on function public.public_campaigns() from public;
grant execute on function public.public_campaigns() to anon, authenticated;

-- Campanha e suas necessidades são salvas na mesma transação; histórico de doações nunca é apagado.
create function public.save_campaign(payload jsonb) returns uuid
language plpgsql security definer set search_path = '' as $$
declare cid uuid; nid uuid; n jsonb; kept uuid[] := '{}'; pos integer := 0; previous timestamptz;
begin
  if not public.is_admin() then raise exception 'Acesso negado' using errcode='42501'; end if;
  if coalesce(jsonb_typeof(payload->'needs'),'') <> 'array' or jsonb_array_length(payload->'needs') not between 1 and 50 then raise exception 'Informe entre 1 e 50 itens'; end if;
  if nullif(payload->>'id','') is not null then
    cid := (payload->>'id')::uuid;
    select updated_at into previous from public.campaigns where id=cid for update;
    if not found then raise exception 'Campanha não encontrada'; end if;
    if previous is distinct from (payload->>'updated_at')::timestamptz then raise exception 'A campanha foi alterada por outra pessoa. Atualize a página.'; end if;
    update public.campaigns set name=trim(payload->>'name'),category=payload->>'category',description=coalesce(payload->>'description',''),
      beneficiary=coalesce(payload->>'beneficiary',''),location=coalesce(payload->>'location',''),starts_on=(payload->>'starts_on')::date,
      ends_on=(payload->>'ends_on')::date,status=payload->>'status',published=(payload->>'published')::boolean where id=cid;
  else
    insert into public.campaigns(name,category,description,beneficiary,location,starts_on,ends_on,status,published)
    values(trim(payload->>'name'),payload->>'category',coalesce(payload->>'description',''),coalesce(payload->>'beneficiary',''),coalesce(payload->>'location',''),
      (payload->>'starts_on')::date,(payload->>'ends_on')::date,payload->>'status',(payload->>'published')::boolean) returning id into cid;
  end if;
  for n in select * from jsonb_array_elements(payload->'needs') loop
    nid := coalesce(nullif(n->>'id','')::uuid,gen_random_uuid());
    if exists(select 1 from public.campaign_needs where id=nid and campaign_id<>cid) then raise exception 'Item inválido'; end if;
    if exists(select 1 from public.campaign_needs x join public.donations d on d.need_id=x.id where x.id=nid and (x.item<>trim(n->>'item') or x.unit<>trim(n->>'unit'))) then
      raise exception 'Um item com doações mantém o nome e a unidade. Crie outro item para substituir.';
    end if;
    insert into public.campaign_needs(id,campaign_id,item,goal,unit,position,active)
    values(nid,cid,trim(n->>'item'),(n->>'goal')::numeric,trim(n->>'unit'),pos,true)
    on conflict(id) do update set item=excluded.item,goal=excluded.goal,unit=excluded.unit,position=excluded.position,active=true;
    kept := array_append(kept,nid); pos := pos+1;
  end loop;
  update public.campaign_needs set active=false where campaign_id=cid and not(id=any(kept));
  return cid;
end $$;
revoke all on function public.save_campaign(jsonb) from public;
grant execute on function public.save_campaign(jsonb) to authenticated;

-- Migração opcional dos registros do antigo navegador: atômica e protegida contra duplicação.
create function public.import_legacy(payload jsonb) returns integer
language plpgsql security definer set search_path = '' as $$
declare c jsonb; d jsonb; cid uuid; nid uuid; ids jsonb := '{}'; fingerprint text; count_imported integer := 0;
begin
  if not public.is_admin() then raise exception 'Acesso negado' using errcode='42501'; end if;
  if coalesce(jsonb_typeof(payload->'campaigns'),'') <> 'array' or coalesce(jsonb_typeof(payload->'donations'),'') <> 'array' or jsonb_array_length(payload->'campaigns') > 200 or jsonb_array_length(payload->'donations') > 5000 then raise exception 'Arquivo inválido ou muito grande'; end if;
  fingerprint := md5(payload::text);
  insert into public.legacy_imports(fingerprint) values(fingerprint);
  perform set_config('app.importing_legacy','true',true);
  for c in select * from jsonb_array_elements(payload->'campaigns') loop
    cid := public.save_campaign(jsonb_build_object('name',c->>'name','category',case when c->>'category'='Livros' then 'Educação' else c->>'category' end,
      'starts_on',least(current_date,(c->>'end')::date),'ends_on',c->>'end','status',case when c->>'status'='Concluída' then 'completed' else 'active' end,
      'published',false,'needs',c->'needs'));
    ids := ids || jsonb_build_object(c->>'id',cid); count_imported := count_imported+1;
  end loop;
  for d in select * from jsonb_array_elements(coalesce(payload->'donations','[]')) loop
    cid := (ids->>(d->>'campaign'))::uuid;
    select id into nid from public.campaign_needs where campaign_id=cid and item=d->>'item' and unit=d->>'unit' order by position limit 1;
    if nid is null then raise exception 'Doação sem item correspondente. Corrija o arquivo antes de importar.'; end if;
    insert into public.donations(need_id,quantity,notes,status) values(nid,(d->>'quantity')::numeric,coalesce(d->>'notes',''),case when d->>'status'='Recebida' then 'received' else 'pending' end);
  end loop;
  return count_imported;
exception when unique_violation then raise exception 'Este arquivo já foi importado';
end $$;
revoke all on function public.import_legacy(jsonb) from public;
grant execute on function public.import_legacy(jsonb) to authenticated;

create function public.check_donation() returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if (tg_op='INSERT' or new.need_id<>old.need_id) and coalesce(current_setting('app.importing_legacy',true),'')<>'true' then
    if not exists(select 1 from public.campaign_needs n join public.campaigns c on c.id=n.campaign_id where n.id=new.need_id and n.active and c.status='active') then raise exception 'Selecione um item de campanha ativa'; end if;
  end if;
  return new;
end $$;
create trigger donation_validate before insert or update on public.donations for each row execute function public.check_donation();

create function public.remove_administrator(target uuid) returns void
language plpgsql security definer set search_path = '' as $$
begin
  if not public.is_admin() then raise exception 'Acesso negado' using errcode='42501'; end if;
  if target = auth.uid() then raise exception 'Você não pode revogar o próprio acesso'; end if;
  lock table public.administrators in exclusive mode;
  delete from public.administrators where user_id=target;
  if not found then raise exception 'Administrador não encontrado'; end if;
end $$;
revoke all on function public.remove_administrator(uuid) from public;
grant execute on function public.remove_administrator(uuid) to authenticated;
commit;
