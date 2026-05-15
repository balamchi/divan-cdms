
-- 1. Seed companies (idempotent on clickup_folder_id)
INSERT INTO public.companies (id, name, clickup_folder_id, clickup_company_field_value, active)
VALUES
  ('fb5bcc0c-666e-437f-abd0-8a1507b30c99', 'Vivia Riu Medspa', '90149079675', '95d3c7ee-2b9d-4920-ae95-2fe202daaf4e', true),
  (gen_random_uuid(), 'MapleDerm',         '90148903278', '247938d4-8f43-4501-951f-214cf858c4ee', true),
  (gen_random_uuid(), 'Par Aesthetics',    '90148903378', 'cea2feed-186e-4e74-8006-276142b21119', true),
  (gen_random_uuid(), 'Muchin',            '90148903396', '43f4c31e-2dac-416f-8b21-013fbc968234', true),
  (gen_random_uuid(), 'Venus Cosmedical',  '90148903432', 'f593e3cc-bd2a-4f16-ab32-0612bae7d3bf', true),
  (gen_random_uuid(), 'Rose Beauty',       '90148903463', '473aa810-9465-4697-b723-b0a405a45fa2', true),
  (gen_random_uuid(), 'Maxx & Afi',        '90148942905', '3debddc6-783a-41a2-9d55-1be5ac7e9bce', true)
ON CONFLICT (clickup_folder_id) DO UPDATE
  SET name = EXCLUDED.name,
      clickup_company_field_value = EXCLUDED.clickup_company_field_value,
      active = EXCLUDED.active;

-- 2. Backfill clickup_tasks_cache.company_id by folder_id
UPDATE public.clickup_tasks_cache t
   SET company_id = c.id
  FROM public.companies c
 WHERE t.company_id IS NULL
   AND t.folder_id IS NOT NULL
   AND t.folder_id = c.clickup_folder_id;

-- 3. Seed test users (idempotent on email)
INSERT INTO public.users (email, full_name, role, company_id)
VALUES
  ('balamchi@divangroup.ca', 'Shahab Balamchi', 'admin',  NULL),
  ('rahil@divangroup.ca',    'Rahil Nemati',    'team',   NULL),
  ('vivi@viviariu.com',      'Vivi',            'client', 'fb5bcc0c-666e-437f-abd0-8a1507b30c99')
ON CONFLICT (email) DO UPDATE
  SET full_name  = EXCLUDED.full_name,
      role       = EXCLUDED.role,
      company_id = EXCLUDED.company_id;
