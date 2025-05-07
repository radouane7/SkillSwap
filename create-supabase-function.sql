-- Fonction pour trouver les matchs d'un utilisateur
-- Cette fonction recherche les utilisateurs qui offrent des compétences dont l'utilisateur a besoin
-- et qui ont besoin de compétences que l'utilisateur offre
CREATE OR REPLACE FUNCTION public.find_matches(input_user_id integer)
RETURNS TABLE (
  id integer,
  username text,
  email text,
  password text,
  first_name text,
  last_name text,
  bio text,
  location text,
  profile_image text,
  verified boolean,
  rating numeric,
  review_count integer,
  subscription_status text,
  stripe_customer_id text,
  stripe_subscription_id text,
  subscription_expires_at timestamp with time zone,
  monthly_proposal_count integer,
  last_proposal_reset timestamp with time zone,
  created_at timestamp with time zone,
  firebase_uid text,
  provider text,
  country text,
  city text
) 
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT DISTINCT u.*
  FROM users u
  WHERE u.id <> input_user_id
  AND (
    -- Les utilisateurs qui offrent des compétences dont l'utilisateur a besoin
    EXISTS (
      SELECT 1
      FROM user_skills us_need
      JOIN user_skills us_offer ON us_need.skill_id = us_offer.skill_id
      WHERE us_need.user_id = input_user_id
      AND us_need.is_offered = false
      AND us_offer.user_id = u.id
      AND us_offer.is_offered = true
    )
    -- ET qui ont besoin de compétences que l'utilisateur offre
    AND EXISTS (
      SELECT 1
      FROM user_skills us_offer
      JOIN user_skills us_need ON us_offer.skill_id = us_need.skill_id
      WHERE us_offer.user_id = input_user_id
      AND us_offer.is_offered = true
      AND us_need.user_id = u.id
      AND us_need.is_offered = false
    )
  );
END;
$$;