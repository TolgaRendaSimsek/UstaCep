-- ================================================================
-- UstaCep Initial PostgreSQL Database Migration
-- Multi-Tenant Data Isolation with Row Level Security (RLS)
-- ================================================================

-- 1. Custom Enum Types
create type public.job_status as enum ('waiting', 'in_progress', 'completed');
create type public.payment_status as enum ('unpaid', 'partial', 'paid');

-- 2. Shared updated_at Trigger Function
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- 3. Table Definitions

-- Customers Table (Müşteri Defteri)
create table public.customers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  phone text not null,
  address text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Jobs Table (İşlerim)
create table public.jobs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  customer_id uuid references public.customers(id) on delete set null,
  title text not null,
  description text,
  status public.job_status not null default 'waiting',
  price numeric(12, 2) not null default 0.00,
  appointment_date timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Payments Table (Ödemeler & Tahsilat)
create table public.payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  job_id uuid not null references public.jobs(id) on delete cascade,
  amount numeric(12, 2) not null default 0.00,
  status public.payment_status not null default 'unpaid',
  payment_date timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Job Photos Table (İş Fotoğrafları)
create table public.job_photos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  job_id uuid not null references public.jobs(id) on delete cascade,
  storage_path text not null,
  created_at timestamptz not null default now()
);

-- 4. Triggers for updated_at
create trigger set_customers_updated_at
  before update on public.customers
  for each row execute function public.handle_updated_at();

create trigger set_jobs_updated_at
  before update on public.jobs
  for each row execute function public.handle_updated_at();

create trigger set_payments_updated_at
  before update on public.payments
  for each row execute function public.handle_updated_at();

-- 5. Indexes
create index idx_customers_user_id on public.customers(user_id);
create index idx_jobs_user_id on public.jobs(user_id);
create index idx_jobs_customer_id on public.jobs(customer_id);
create index idx_jobs_status on public.jobs(status);
create index idx_jobs_appointment_date on public.jobs(appointment_date);
create index idx_payments_user_id on public.payments(user_id);
create index idx_payments_job_id on public.payments(job_id);
create index idx_job_photos_job_id on public.job_photos(job_id);

-- 6. Row Level Security (RLS) & Multi-Tenant Security Policies

alter table public.customers enable row level security;
alter table public.jobs enable row level security;
alter table public.payments enable row level security;
alter table public.job_photos enable row level security;

-- Customers RLS Policies
create policy "Users can view own customers"
  on public.customers for select
  using (auth.uid() = user_id);

create policy "Users can insert own customers"
  on public.customers for insert
  with check (auth.uid() = user_id);

create policy "Users can update own customers"
  on public.customers for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete own customers"
  on public.customers for delete
  using (auth.uid() = user_id);

-- Jobs RLS Policies
create policy "Users can view own jobs"
  on public.jobs for select
  using (auth.uid() = user_id);

create policy "Users can insert own jobs"
  on public.jobs for insert
  with check (auth.uid() = user_id);

create policy "Users can update own jobs"
  on public.jobs for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete own jobs"
  on public.jobs for delete
  using (auth.uid() = user_id);

-- Payments RLS Policies
create policy "Users can view own payments"
  on public.payments for select
  using (auth.uid() = user_id);

create policy "Users can insert own payments"
  on public.payments for insert
  with check (auth.uid() = user_id);

create policy "Users can update own payments"
  on public.payments for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete own payments"
  on public.payments for delete
  using (auth.uid() = user_id);

-- Job Photos RLS Policies
create policy "Users can view own job photos"
  on public.job_photos for select
  using (auth.uid() = user_id);

create policy "Users can insert own job photos"
  on public.job_photos for insert
  with check (auth.uid() = user_id);

create policy "Users can update own job photos"
  on public.job_photos for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete own job photos"
  on public.job_photos for delete
  using (auth.uid() = user_id);
