-- Migration: Create user_purchases table
-- Cette table stocke les achats de modes par utilisateur

-- Créer la table user_purchases
CREATE TABLE IF NOT EXISTS user_purchases (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  mode_id VARCHAR(50) NOT NULL,
  purchased_at TIMESTAMPTZ DEFAULT NOW(),
  price DECIMAL(10, 2) DEFAULT 0,
  currency VARCHAR(3) DEFAULT 'EUR',
  transaction_id VARCHAR(255),
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- Un utilisateur ne peut acheter un mode qu'une fois
  UNIQUE(user_id, mode_id)
);

-- Index pour les recherches fréquentes
CREATE INDEX IF NOT EXISTS idx_user_purchases_user_id ON user_purchases(user_id);
CREATE INDEX IF NOT EXISTS idx_user_purchases_mode_id ON user_purchases(mode_id);

-- Row Level Security (RLS)
ALTER TABLE user_purchases ENABLE ROW LEVEL SECURITY;

-- Politique : Les utilisateurs ne peuvent voir que leurs propres achats
CREATE POLICY "Users can view own purchases"
  ON user_purchases
  FOR SELECT
  USING (auth.uid() = user_id);

-- Politique : Les utilisateurs peuvent créer leurs propres achats
CREATE POLICY "Users can insert own purchases"
  ON user_purchases
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Politique : Pas de mise à jour (les achats sont définitifs)
-- Politique : Pas de suppression (les achats sont définitifs)

-- Commentaires
COMMENT ON TABLE user_purchases IS 'Stocke les achats de modes de jeu par utilisateur';
COMMENT ON COLUMN user_purchases.user_id IS 'ID de l''utilisateur Supabase';
COMMENT ON COLUMN user_purchases.mode_id IS 'ID du mode acheté (ex: couples, caliente)';
COMMENT ON COLUMN user_purchases.price IS 'Prix payé';
COMMENT ON COLUMN user_purchases.transaction_id IS 'ID de transaction RevenueCat/Store (optionnel)';
