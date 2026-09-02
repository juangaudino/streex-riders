-- STREEX Pricing Engine.
-- All pricing records are tenant-scoped and are only read/written by authenticated
-- Admin server functions using the service role. The browser never receives direct
-- table access or a Maps server credential.

create table if not exists public.pricing_profiles (
  id uuid primary key default gen_random_uuid(),
  tenant_id text not null references public.tenants(id) on delete cascade,
  name text not null check (char_length(trim(name)) between 1 and 80),
  is_active boolean not null default true,
  is_default boolean not null default false,
  settings jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (tenant_id, name)
);

create unique index if not exists pricing_profiles_one_default_per_tenant
  on public.pricing_profiles (tenant_id)
  where is_default and is_active;

create table if not exists public.pricing_zones (
  id uuid primary key default gen_random_uuid(),
  tenant_id text not null references public.tenants(id) on delete cascade,
  name text not null check (char_length(trim(name)) between 1 and 100),
  kind text not null default 'included'
    check (kind in ('included', 'special')),
  address text not null,
  place_id text,
  latitude numeric(9,6) not null check (latitude between -90 and 90),
  longitude numeric(9,6) not null check (longitude between -180 and 180),
  radius_meters integer not null check (radius_meters between 50 and 160934),
  adjustment_cents integer not null default 0 check (adjustment_cents >= 0),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (tenant_id, name)
);

create table if not exists public.pricing_flat_rates (
  id uuid primary key default gen_random_uuid(),
  tenant_id text not null references public.tenants(id) on delete cascade,
  pricing_profile_id uuid not null references public.pricing_profiles(id) on delete cascade,
  origin_zone_id uuid not null references public.pricing_zones(id) on delete restrict,
  destination_zone_id uuid not null references public.pricing_zones(id) on delete restrict,
  price_cents integer not null check (price_cents > 0),
  included_stops integer not null default 0 check (included_stops between 0 and 10),
  is_bidirectional boolean not null default true,
  starts_at timestamptz,
  ends_at timestamptz,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (ends_at is null or starts_at is null or ends_at > starts_at),
  check (origin_zone_id <> destination_zone_id)
);

create index if not exists pricing_flat_rates_lookup_idx
  on public.pricing_flat_rates (tenant_id, pricing_profile_id, is_active, starts_at, ends_at);

create table if not exists public.pricing_promotions (
  id uuid primary key default gen_random_uuid(),
  tenant_id text not null references public.tenants(id) on delete cascade,
  code text not null,
  name text not null check (char_length(trim(name)) between 1 and 100),
  discount_type text not null check (discount_type in ('fixed', 'percent')),
  discount_value integer not null check (discount_value > 0),
  is_active boolean not null default true,
  starts_at timestamptz,
  ends_at timestamptz,
  restrictions jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (tenant_id, code),
  check (
    (discount_type = 'fixed' and discount_value <= 1000000)
    or (discount_type = 'percent' and discount_value <= 100)
  ),
  check (ends_at is null or starts_at is null or ends_at > starts_at)
);

create table if not exists public.referral_partners (
  id uuid primary key default gen_random_uuid(),
  tenant_id text not null references public.tenants(id) on delete cascade,
  name text not null check (char_length(trim(name)) between 1 and 120),
  referral_type text not null default 'partner',
  passenger_discount_type text check (passenger_discount_type in ('fixed', 'percent')),
  passenger_discount_value integer check (passenger_discount_value > 0),
  commission_type text not null check (commission_type in ('fixed', 'percent')),
  commission_value integer not null check (commission_value > 0),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (tenant_id, name),
  check (
    passenger_discount_type is null
    or passenger_discount_value is not null
  ),
  check (
    (passenger_discount_type <> 'percent' or passenger_discount_value <= 100)
    and (commission_type <> 'percent' or commission_value <= 100)
  )
);

create table if not exists public.pricing_quotes (
  id uuid primary key default gen_random_uuid(),
  tenant_id text not null references public.tenants(id) on delete cascade,
  booking_id uuid references public.bookings(id) on delete set null,
  pricing_profile_id uuid references public.pricing_profiles(id) on delete set null,
  promotion_id uuid references public.pricing_promotions(id) on delete set null,
  referral_partner_id uuid references public.referral_partners(id) on delete set null,
  created_by_user_id uuid references auth.users(id) on delete set null,
  service_type text not null check (service_type in ('one_way', 'airport_transfer', 'multi_stop', 'long_distance', 'hourly')),
  pricing_mode text not null check (pricing_mode in ('flat_rate', 'dynamic', 'hourly')),
  status text not null default 'draft' check (status in ('draft', 'sent', 'void', 'completed')),
  commission_status text not null default 'not_applicable'
    check (commission_status in ('not_applicable', 'calculated', 'payable', 'paid', 'void')),
  customer_name text,
  customer_email text,
  pickup text not null,
  destination text not null,
  stops jsonb not null default '[]'::jsonb,
  service_at timestamptz not null,
  route_snapshot jsonb not null,
  calculation_snapshot jsonb not null,
  recommended_cents integer not null check (recommended_cents >= 0),
  final_cents integer,
  discount_cents integer not null default 0 check (discount_cents >= 0),
  referral_commission_cents integer not null default 0 check (referral_commission_cents >= 0),
  sent_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (final_cents is null or final_cents >= 0)
);

create index if not exists pricing_quotes_tenant_created_idx
  on public.pricing_quotes (tenant_id, created_at desc);
create index if not exists pricing_quotes_booking_idx
  on public.pricing_quotes (booking_id, created_at desc)
  where booking_id is not null;

create table if not exists public.pricing_promo_redemptions (
  id uuid primary key default gen_random_uuid(),
  tenant_id text not null references public.tenants(id) on delete cascade,
  promotion_id uuid not null references public.pricing_promotions(id) on delete restrict,
  pricing_quote_id uuid not null unique references public.pricing_quotes(id) on delete cascade,
  customer_email text,
  redeemed_at timestamptz not null default now()
);

create index if not exists pricing_promo_redemptions_promotion_idx
  on public.pricing_promo_redemptions (promotion_id, redeemed_at desc);

alter table public.pricing_profiles enable row level security;
alter table public.pricing_zones enable row level security;
alter table public.pricing_flat_rates enable row level security;
alter table public.pricing_promotions enable row level security;
alter table public.referral_partners enable row level security;
alter table public.pricing_quotes enable row level security;
alter table public.pricing_promo_redemptions enable row level security;

revoke all on public.pricing_profiles, public.pricing_zones, public.pricing_flat_rates,
  public.pricing_promotions, public.referral_partners, public.pricing_quotes,
  public.pricing_promo_redemptions from anon, authenticated;
grant all on public.pricing_profiles, public.pricing_zones, public.pricing_flat_rates,
  public.pricing_promotions, public.referral_partners, public.pricing_quotes,
  public.pricing_promo_redemptions to service_role;
