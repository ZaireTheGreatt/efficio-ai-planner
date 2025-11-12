-- Create enum for user roles
create type public.app_role as enum ('admin', 'user');

-- Create user_roles table
create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  role app_role not null default 'user',
  created_at timestamp with time zone default now(),
  unique (user_id, role)
);

-- Enable RLS
alter table public.user_roles enable row level security;

-- Create security definer function to check roles
create or replace function public.has_role(_user_id uuid, _role app_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.user_roles
    where user_id = _user_id
      and role = _role
  )
$$;

-- RLS policies for user_roles
create policy "Users can view their own roles"
on public.user_roles
for select
using (auth.uid() = user_id);

create policy "Admins can view all roles"
on public.user_roles
for select
using (public.has_role(auth.uid(), 'admin'));

-- Update profiles RLS to allow admins to view all profiles
create policy "Admins can view all profiles"
on public.profiles
for select
using (public.has_role(auth.uid(), 'admin'));

-- Trigger to create default user role on signup
create or replace function public.handle_new_user_role()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.user_roles (user_id, role)
  values (new.id, 'user');
  return new;
end;
$$;

create trigger on_auth_user_created_role
  after insert on auth.users
  for each row execute procedure public.handle_new_user_role();