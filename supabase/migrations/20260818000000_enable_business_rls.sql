-- Dashboard data is owned by the MAKU user who owns the business.
-- Public widget routes use the service role and are unaffected by these policies.

alter table businesses enable row level security;
alter table assistants enable row level security;
alter table knowledge enable row level security;
alter table knowledge_chunks enable row level security;
alter table services enable row level security;
alter table faqs enable row level security;
alter table policies enable row level security;
alter table conversations enable row level security;
alter table messages enable row level security;
alter table leads enable row level security;

create policy "business owners can manage businesses"
  on businesses for all
  using (owner_id = auth.uid()::text)
  with check (owner_id = auth.uid()::text);

create policy "business owners can manage assistants"
  on assistants for all
  using (exists (
    select 1 from businesses
    where businesses.id = assistants.business_id
      and businesses.owner_id = auth.uid()::text
  ))
  with check (exists (
    select 1 from businesses
    where businesses.id = assistants.business_id
      and businesses.owner_id = auth.uid()::text
  ));

create policy "business owners can manage knowledge"
  on knowledge for all
  using (exists (
    select 1 from businesses
    where businesses.id = knowledge.business_id
      and businesses.owner_id = auth.uid()::text
  ))
  with check (exists (
    select 1 from businesses
    where businesses.id = knowledge.business_id
      and businesses.owner_id = auth.uid()::text
  ));

create policy "business owners can manage knowledge chunks"
  on knowledge_chunks for all
  using (exists (
    select 1 from businesses
    where businesses.id = knowledge_chunks.business_id
      and businesses.owner_id = auth.uid()::text
  ))
  with check (exists (
    select 1 from businesses
    where businesses.id = knowledge_chunks.business_id
      and businesses.owner_id = auth.uid()::text
  ));

create policy "business owners can manage services"
  on services for all
  using (exists (
    select 1 from businesses
    where businesses.id = services.business_id
      and businesses.owner_id = auth.uid()::text
  ))
  with check (exists (
    select 1 from businesses
    where businesses.id = services.business_id
      and businesses.owner_id = auth.uid()::text
  ));

create policy "business owners can manage faqs"
  on faqs for all
  using (exists (
    select 1 from businesses
    where businesses.id = faqs.business_id
      and businesses.owner_id = auth.uid()::text
  ))
  with check (exists (
    select 1 from businesses
    where businesses.id = faqs.business_id
      and businesses.owner_id = auth.uid()::text
  ));

create policy "business owners can manage policies"
  on policies for all
  using (exists (
    select 1 from businesses
    where businesses.id = policies.business_id
      and businesses.owner_id = auth.uid()::text
  ))
  with check (exists (
    select 1 from businesses
    where businesses.id = policies.business_id
      and businesses.owner_id = auth.uid()::text
  ));

create policy "business owners can manage conversations"
  on conversations for all
  using (exists (
    select 1 from assistants
    join businesses on businesses.id = assistants.business_id
    where assistants.id = conversations.assistant_id
      and businesses.owner_id = auth.uid()::text
  ))
  with check (exists (
    select 1 from assistants
    join businesses on businesses.id = assistants.business_id
    where assistants.id = conversations.assistant_id
      and businesses.owner_id = auth.uid()::text
  ));

create policy "business owners can manage messages"
  on messages for all
  using (exists (
    select 1
    from conversations
    join assistants on assistants.id = conversations.assistant_id
    join businesses on businesses.id = assistants.business_id
    where conversations.id = messages.conversation_id
      and businesses.owner_id = auth.uid()::text
  ))
  with check (exists (
    select 1
    from conversations
    join assistants on assistants.id = conversations.assistant_id
    join businesses on businesses.id = assistants.business_id
    where conversations.id = messages.conversation_id
      and businesses.owner_id = auth.uid()::text
  ));

create policy "business owners can manage leads"
  on leads for all
  using (exists (
    select 1 from businesses
    where businesses.id = leads.business_id
      and businesses.owner_id = auth.uid()::text
  ))
  with check (exists (
    select 1 from businesses
    where businesses.id = leads.business_id
      and businesses.owner_id = auth.uid()::text
  ));