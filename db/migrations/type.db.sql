-- ========================
-- 3. TYPES
-- ========================


DO $$
BEGIN
  IF NOT EXISTS (
		SELECT 1 FROM pg_type t 
		JOIN pg_namespace n ON n.oid = t.typnamespace 
		WHERE t.typname = 'license_type'
    AND n.nspname = 'public') 
		THEN
    CREATE TYPE public.license_type AS ENUM 
		('TRIAL', 'MONTH', 'YEAR', 'FOREVER', 'CUSTOM');
  END IF;
	
END
$$;

