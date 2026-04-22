-- Add industry, workload_ids, and edit_token columns to champions
alter table champions
  add column if not exists industry     text,
  add column if not exists workload_ids uuid[] not null default '{}',
  add column if not exists edit_token   uuid   not null default gen_random_uuid();

-- Back-fill workload_ids for any existing rows that have workload_id set
update champions
  set workload_ids = array[workload_id]
  where workload_ids = '{}' and workload_id is not null;
