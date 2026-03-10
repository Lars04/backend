-- USERS
CREATE TABLE IF NOT EXISTS public.users (
	id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
	first_name VARCHAR(100) NOT NULL,
	last_name VARCHAR(100),
	email VARCHAR(100) NOT NULL,
	phone VARCHAR(20) DEFAULT '+993',
	password TEXT NOT NULL,
	role INTEGER NOT NULL DEFAULT 1 CHECK (role in (0, 1)),
	is_active_license BOOLEAN DEFAULT FALSE,
	activation_link TEXT,
	reset_pass_link TEXT,
	is_verify BOOLEAN NOT NULL DEFAULT FALSE,
	enable_reset_pass BOOLEAN NOT NULL DEFAULT FALSE,
 	created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- SESSION
CREATE TABLE IF NOT EXISTS public.sessions (
	id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
	user_id UUID UNIQUE REFERENCES public.users(id) ON DELETE CASCADE,
	refresh_token TEXT NOT NULL,
	expires_token_at TIMESTAMPTZ DEFAULT NULL,
	expires_forget_pass_at TIMESTAMPTZ DEFAULT NULL, 
	created_at TIMESTAMPTZ DEFAULT now(),
	updated_at TIMESTAMPTZ DEFAULT now()
);

-- License
CREATE TABLE IF NOT EXISTS public.license (
	id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
	user_id UUID UNIQUE REFERENCES public.users(id) ON DELETE CASCADE,
	license license_type NOT NULL DEFAULT 'TRIAL',
	expires_license_at TIMESTAMPTZ DEFAULT null,
	created_at TIMESTAMPTZ DEFAULT now(),
	updated_at TIMESTAMPTZ DEFAULT now()
);