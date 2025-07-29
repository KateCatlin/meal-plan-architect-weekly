-- Fix database function security by setting proper search_path
-- This prevents potential function hijacking attacks

-- Drop and recreate the existing functions with secure search_path
DROP FUNCTION IF EXISTS public.update_updated_at_column();
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Create secure update_updated_at_column function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = ''
AS $function$
BEGIN
NEW.updated_at = now();
RETURN NEW;
END;
$function$;

-- Create secure handle_new_user function  
CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = ''
AS $function$
BEGIN
  INSERT INTO public.profiles (user_id, display_name)
  VALUES (new.id, new.raw_user_meta_data ->> 'display_name');
  RETURN new;
END;
$function$;