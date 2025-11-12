-- Create storage bucket for task attachments
insert into storage.buckets (id, name, public)
values ('task-attachments', 'task-attachments', false);

-- RLS policies for task attachments
create policy "Users can view their own task attachments"
on storage.objects
for select
using (
  bucket_id = 'task-attachments' 
  and auth.uid()::text = (storage.foldername(name))[1]
);

create policy "Users can upload their own task attachments"
on storage.objects
for insert
with check (
  bucket_id = 'task-attachments' 
  and auth.uid()::text = (storage.foldername(name))[1]
);

create policy "Users can update their own task attachments"
on storage.objects
for update
using (
  bucket_id = 'task-attachments' 
  and auth.uid()::text = (storage.foldername(name))[1]
);

create policy "Users can delete their own task attachments"
on storage.objects
for delete
using (
  bucket_id = 'task-attachments' 
  and auth.uid()::text = (storage.foldername(name))[1]
);

-- Add attachments column to tasks table
alter table public.tasks
add column attachments jsonb default '[]'::jsonb;