-- ============================================================================
-- FidèleResto : durcissement de la sécurité Supabase (20/10/2026)
-- À coller tel quel dans Supabase > SQL Editor > Run. Peut être relancé sans risque.
-- ============================================================================
begin;

-- 0) Colonne du boost 1re visite (utilisée par la vue ci-dessous)
alter table public.restaurants add column if not exists boost_premiere_visite smallint default 2;

-- ----------------------------------------------------------------------------
-- 1) LECTURE : avant, n'importe qui pouvait lire TOUTES les colonnes de TOUS les
--    restaurants (téléphone du gérant, identifiants Stripe, parrain...).
--    Maintenant : le propriétaire lit sa ligne ; le public passe par une vue
--    qui ne montre que ce dont les pages client ont besoin.
-- ----------------------------------------------------------------------------
drop policy if exists "Lecture publique restaurants" on public.restaurants;
drop policy if exists "Le proprietaire lit son restaurant" on public.restaurants;
create policy "Le proprietaire lit son restaurant" on public.restaurants
  for select to authenticated
  using (auth.uid() = user_id);

drop view if exists public.restaurants_public;
create view public.restaurants_public as
  select id, slug, nom_restaurant, plan, statut_abonnement, google_avis_url,
         fidelite_tampons_requis, fidelite_recompense,
         menu_type, menu_url, menu_html, boost_premiere_visite
  from public.restaurants;
revoke all on public.restaurants_public from anon, authenticated;
grant select on public.restaurants_public to anon, authenticated;

-- ----------------------------------------------------------------------------
-- 2) MODIFICATION : avant, un restaurateur pouvait se passer lui-même en plan
--    "Complet" actif depuis la console du navigateur (abonnement gratuit).
--    Maintenant : il ne peut modifier QUE ses réglages ; plan, statut,
--    Stripe, compteurs... ne bougent que côté serveur (webhook Stripe, admin).
-- ----------------------------------------------------------------------------
revoke update on public.restaurants from anon, authenticated;
do $$
declare col text;
begin
  foreach col in array array[
    'nom_restaurant', 'google_avis_url', 'roue_frequence_jours', 'boost_premiere_visite',
    'panier_moyen', 'parties_estimees_jour',
    'fidelite_tampons_requis', 'fidelite_montant_min', 'fidelite_recompense',
    'relance_active', 'relance_jours_inactivite', 'relance_pourcentage'
  ] loop
    if exists (select 1 from information_schema.columns
               where table_schema = 'public' and table_name = 'restaurants' and column_name = col) then
      execute format('grant update (%I) on public.restaurants to authenticated', col);
    end if;
  end loop;
end $$;

-- ----------------------------------------------------------------------------
-- 3) CRÉATION : le restaurateur ne peut créer que SON restaurant (slug = début
--    de son identifiant), sans pouvoir choisir son plan ni son statut.
-- ----------------------------------------------------------------------------
revoke insert on public.restaurants from anon, authenticated;
do $$
declare col text;
begin
  foreach col in array array[
    'user_id', 'slug', 'nom_restaurant', 'google_avis_url', 'telephone', 'ville', 'parrain', 'scan_qr'
  ] loop
    if exists (select 1 from information_schema.columns
               where table_schema = 'public' and table_name = 'restaurants' and column_name = col) then
      execute format('grant insert (%I) on public.restaurants to authenticated', col);
    end if;
  end loop;
end $$;
drop policy if exists "Creation restaurant par son proprietaire" on public.restaurants;
create policy "Creation restaurant par son proprietaire" on public.restaurants
  for insert to authenticated
  with check (auth.uid() = user_id and slug = left(auth.uid()::text, 8));

revoke delete on public.restaurants from anon, authenticated;

-- ----------------------------------------------------------------------------
-- 4) CARTE DE FIDÉLITÉ : avant, un client pouvait créer sa carte avec
--    999 tampons depuis la console. Maintenant : une carte neuve part de 0.
-- ----------------------------------------------------------------------------
drop policy if exists "Le client cree sa propre carte" on public.cartes_fidelite;
create policy "Le client cree sa propre carte" on public.cartes_fidelite
  for insert to authenticated
  with check (auth.uid() = client_id and coalesce(tampons, 0) = 0);

-- ----------------------------------------------------------------------------
-- 5) Ménage : règle de lecture en double sur roue_config
-- ----------------------------------------------------------------------------
drop policy if exists "Enable read access for all users" on public.roue_config;

commit;
