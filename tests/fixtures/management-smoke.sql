begin;
select set_config('request.jwt.claim.sub',(select user_id::text from public.administrators order by created_at limit 1),true);
set local role authenticated;
do $$
declare cid uuid; pid uuid; tid uuid; mid uuid; result_date date;
begin
 if not public.is_admin() then raise exception 'Administrador esperado não autorizado'; end if;
 cid := public.save_campaign(jsonb_build_object('name','Verificação interna sem persistência','category','Alimentos','description','Teste transacional','starts_on',current_date,'ends_on',current_date+1,'status','active','published',false,'needs',jsonb_build_array(jsonb_build_object('item','Arroz','goal',10,'unit','kg'))));
 insert into public.campaign_plans(campaign_id,objective,budget) values(cid,'Validar planejamento',100) returning id into pid;
 update public.campaign_plans set audience='Público de teste' where id=pid;
 insert into public.management_tasks(campaign_id,title,deadline,status) values(cid,'Validar tarefa',current_date,'done') returning id,completed_on into tid,result_date;
 if result_date is null then raise exception 'Conclusão não registrada'; end if;
 update public.management_tasks set status='doing' where id=tid;
 if exists(select 1 from public.management_tasks where id=tid and completed_on is not null) then raise exception 'Reabertura incorreta'; end if;
 insert into public.campaign_expenses(campaign_id,description,amount) values(cid,'Gasto de validação',10);
 insert into public.marketing_actions(campaign_id,title,channel,publish_on,status) values(cid,'Divulgação de validação','whatsapp',current_date,'draft') returning id into mid;
 update public.marketing_actions set status='published',reach=100,interactions=10,clicks=20,conversions=2,cost=5 where id=mid;
 if (select count(*) from public.audit_log where entity_id in(pid::text,tid::text,mid::text)) < 6 then raise exception 'Auditoria incompleta'; end if;
end $$;
rollback;
select 'Operações autorizadas e auditoria verificadas; todos os registros do teste foram revertidos.' as resultado;
