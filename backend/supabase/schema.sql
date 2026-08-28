-- Run in Supabase SQL Editor. Enable Row Level Security before production.
create table if not exists schemes (id text primary key, name text not null, region text not null, trade text not null);
create table if not exists trainees (id text primary key, name text not null, scheme_id text references schemes(id), cohort text, gender text, contact text, consent boolean default false, trained_on date);
create table if not exists check_ins (id uuid primary key default gen_random_uuid(), trainee_id text references trainees(id), date date default current_date, status text, role text, wage_band text, using_skill boolean, self_employed boolean);
create table if not exists employer_validations (id uuid primary key default gen_random_uuid(), trainee_id text references trainees(id), employer_name text, date date default current_date, status text, tenure text, wage_band text);
-- Recommended: keep direct client access disabled. This MVP uses the server-side
-- service-role key only; add RLS policies and authenticated user identities before production.
