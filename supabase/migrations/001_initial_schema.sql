-- Moody Drinking Game - Initial Database Schema
-- Migration: 001_initial_schema.sql
-- Created: 2026-01-06

-- Extension for UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ===========================================
-- ENUM TYPES
-- ===========================================

CREATE TYPE subscription_tier AS ENUM ('free', 'premium', 'vip');

CREATE TYPE challenge_type AS ENUM (
  'challenge', 'question', 'event', 
  'roulette', 'wheelshot', 'oracle', 
  'explosion', 'guessword', 'selfie', 
  'tapbattle', 'hotseat', 'flashquiz'
);

CREATE TYPE payout_status AS ENUM ('pending', 'processing', 'paid', 'failed');

-- ===========================================
-- CORE TABLES
-- ===========================================

-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  subscription_tier subscription_tier DEFAULT 'free',
  affiliate_code VARCHAR(20) UNIQUE,
  referred_by UUID REFERENCES users(id),
  is_active BOOLEAN DEFAULT true,
  last_login_at TIMESTAMPTZ
);

-- User statistics
CREATE TABLE user_stats (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  games_played INT DEFAULT 0,
  challenges_completed INT DEFAULT 0,
  favorite_mode VARCHAR(50),
  total_play_time_minutes INT DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===========================================
-- GAME CONTENT TABLES
-- ===========================================

-- Game modes
CREATE TABLE modes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(50) NOT NULL UNIQUE,
  description TEXT,
  is_premium BOOLEAN DEFAULT false,
  icon_url TEXT,
  sort_order SMALLINT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Challenges/Questions
CREATE TABLE challenges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type challenge_type NOT NULL,
  level SMALLINT CHECK (level BETWEEN 1 AND 10) DEFAULT 5,
  min_players SMALLINT DEFAULT 2,
  max_players SMALLINT,
  is_premium BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Challenge translations (i18n)
CREATE TABLE challenge_translations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  challenge_id UUID REFERENCES challenges(id) ON DELETE CASCADE,
  locale VARCHAR(5) NOT NULL, -- 'fr', 'en', 'es', etc.
  text TEXT NOT NULL,
  UNIQUE(challenge_id, locale)
);

-- Challenge-Mode junction table
CREATE TABLE challenge_modes (
  challenge_id UUID REFERENCES challenges(id) ON DELETE CASCADE,
  mode_id UUID REFERENCES modes(id) ON DELETE CASCADE,
  PRIMARY KEY (challenge_id, mode_id)
);

-- Tags for categorization
CREATE TABLE tags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(50) NOT NULL,
  category VARCHAR(50), -- 'theme', 'intensity', 'audience'
  UNIQUE(name, category)
);

-- Challenge-Tag junction table
CREATE TABLE challenge_tags (
  challenge_id UUID REFERENCES challenges(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (challenge_id, tag_id)
);

-- ===========================================
-- MINI-GAMES TABLES
-- ===========================================

CREATE TABLE mini_games (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type VARCHAR(50) NOT NULL UNIQUE,
  component_name VARCHAR(100) NOT NULL,
  is_premium BOOLEAN DEFAULT false,
  difficulty SMALLINT CHECK (difficulty BETWEEN 1 AND 3) DEFAULT 2,
  min_players SMALLINT DEFAULT 2,
  max_players SMALLINT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE mini_game_config (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  mini_game_id UUID REFERENCES mini_games(id) ON DELETE CASCADE,
  key VARCHAR(100) NOT NULL,
  value JSONB NOT NULL,
  UNIQUE(mini_game_id, key)
);

CREATE TABLE mini_game_translations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  mini_game_id UUID REFERENCES mini_games(id) ON DELETE CASCADE,
  locale VARCHAR(5) NOT NULL,
  name VARCHAR(100) NOT NULL,
  instructions TEXT,
  UNIQUE(mini_game_id, locale)
);

-- ===========================================
-- GAME SESSION TABLES
-- ===========================================

CREATE TABLE game_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  mode_id UUID REFERENCES modes(id),
  started_at TIMESTAMPTZ DEFAULT NOW(),
  ended_at TIMESTAMPTZ,
  rounds_played INT DEFAULT 0,
  heat_level SMALLINT DEFAULT 1,
  is_completed BOOLEAN DEFAULT false
);

CREATE TABLE session_players (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID REFERENCES game_sessions(id) ON DELETE CASCADE,
  player_name VARCHAR(50) NOT NULL,
  score INT DEFAULT 0,
  challenges_count INT DEFAULT 0,
  drinks_count INT DEFAULT 0
);

CREATE TABLE session_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID REFERENCES game_sessions(id) ON DELETE CASCADE,
  challenge_id UUID REFERENCES challenges(id),
  mini_game_id UUID REFERENCES mini_games(id),
  players_targeted TEXT[], -- Array of player names
  played_at TIMESTAMPTZ DEFAULT NOW(),
  round_number INT
);

-- ===========================================
-- AFFILIATE SYSTEM TABLES
-- ===========================================

CREATE TABLE affiliates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) UNIQUE,
  code VARCHAR(20) UNIQUE NOT NULL,
  commission_rate DECIMAL(5,2) DEFAULT 20.00, -- 20%
  total_referrals INT DEFAULT 0,
  total_earnings DECIMAL(10,2) DEFAULT 0,
  pending_earnings DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true
);

CREATE TABLE affiliate_payouts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  affiliate_id UUID REFERENCES affiliates(id),
  amount DECIMAL(10,2) NOT NULL,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  status payout_status DEFAULT 'pending',
  paid_at TIMESTAMPTZ,
  payment_method VARCHAR(50),
  transaction_id VARCHAR(255),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE affiliate_conversions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  affiliate_id UUID REFERENCES affiliates(id),
  referred_user_id UUID REFERENCES users(id),
  subscription_id UUID,
  amount DECIMAL(10,2) NOT NULL,
  commission DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===========================================
-- SUBSCRIPTION TABLES
-- ===========================================

CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  plan VARCHAR(50) NOT NULL, -- 'premium_monthly', 'premium_yearly', 'vip_monthly'
  status VARCHAR(20) DEFAULT 'active', -- 'active', 'cancelled', 'expired', 'paused'
  started_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  store_transaction_id VARCHAR(255),
  platform VARCHAR(20), -- 'ios', 'android', 'web'
  auto_renew BOOLEAN DEFAULT true,
  price_paid DECIMAL(10,2),
  currency VARCHAR(3) DEFAULT 'EUR'
);

CREATE TABLE purchases (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  product_id VARCHAR(100) NOT NULL, -- 'pack_caliente', 'theme_neon', etc.
  store_transaction_id VARCHAR(255),
  platform VARCHAR(20),
  price_paid DECIMAL(10,2),
  currency VARCHAR(3) DEFAULT 'EUR',
  purchased_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===========================================
-- INDEXES FOR PERFORMANCE
-- ===========================================

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_affiliate_code ON users(affiliate_code);
CREATE INDEX idx_users_referred_by ON users(referred_by);

CREATE INDEX idx_challenges_type ON challenges(type);
CREATE INDEX idx_challenges_level ON challenges(level);
CREATE INDEX idx_challenges_active ON challenges(is_active) WHERE is_active = true;

CREATE INDEX idx_challenge_translations_locale ON challenge_translations(locale);
CREATE INDEX idx_challenge_translations_challenge ON challenge_translations(challenge_id);

CREATE INDEX idx_game_sessions_user ON game_sessions(user_id);
CREATE INDEX idx_game_sessions_started ON game_sessions(started_at);

CREATE INDEX idx_session_players_session ON session_players(session_id);
CREATE INDEX idx_session_history_session ON session_history(session_id);

CREATE INDEX idx_affiliates_code ON affiliates(code);
CREATE INDEX idx_affiliates_user ON affiliates(user_id);

CREATE INDEX idx_subscriptions_user ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);
CREATE INDEX idx_subscriptions_expires ON subscriptions(expires_at);

-- ===========================================
-- ROW LEVEL SECURITY (RLS)
-- ===========================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_players ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE affiliates ENABLE ROW LEVEL SECURITY;
ALTER TABLE affiliate_payouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE affiliate_conversions ENABLE ROW LEVEL SECURITY;

-- Users can view/update their own data
CREATE POLICY "Users can view own data" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own data" ON users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can view own stats" ON user_stats
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view own sessions" ON game_sessions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create sessions" ON game_sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own sessions" ON game_sessions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own subscriptions" ON subscriptions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view own purchases" ON purchases
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view own affiliate data" ON affiliates
  FOR SELECT USING (auth.uid() = user_id);

-- Public read access for game content
CREATE POLICY "Public can read modes" ON modes
  FOR SELECT USING (is_active = true);

CREATE POLICY "Public can read challenges" ON challenges
  FOR SELECT USING (is_active = true);

CREATE POLICY "Public can read challenge translations" ON challenge_translations
  FOR SELECT USING (true);

CREATE POLICY "Public can read tags" ON tags
  FOR SELECT USING (true);

CREATE POLICY "Public can read mini games" ON mini_games
  FOR SELECT USING (is_active = true);

-- ===========================================
-- FUNCTIONS & TRIGGERS
-- ===========================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_challenges_updated_at
  BEFORE UPDATE ON challenges
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_stats_updated_at
  BEFORE UPDATE ON user_stats
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to credit affiliate on conversion
CREATE OR REPLACE FUNCTION credit_affiliate(
  p_affiliate_id UUID,
  p_amount DECIMAL(10,2)
)
RETURNS VOID AS $$
BEGIN
  UPDATE affiliates
  SET 
    total_earnings = total_earnings + p_amount,
    pending_earnings = pending_earnings + p_amount,
    total_referrals = total_referrals + 1
  WHERE id = p_affiliate_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get random challenges for a mode
CREATE OR REPLACE FUNCTION get_random_challenges(
  p_mode_id UUID,
  p_locale VARCHAR(5),
  p_level_min SMALLINT DEFAULT 1,
  p_level_max SMALLINT DEFAULT 10,
  p_limit INT DEFAULT 10,
  p_exclude_ids UUID[] DEFAULT '{}'
)
RETURNS TABLE (
  id UUID,
  type challenge_type,
  level SMALLINT,
  text TEXT,
  is_premium BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.id,
    c.type,
    c.level,
    ct.text,
    c.is_premium
  FROM challenges c
  JOIN challenge_modes cm ON c.id = cm.challenge_id
  JOIN challenge_translations ct ON c.id = ct.challenge_id
  WHERE cm.mode_id = p_mode_id
    AND ct.locale = p_locale
    AND c.level BETWEEN p_level_min AND p_level_max
    AND c.is_active = true
    AND c.id != ALL(p_exclude_ids)
  ORDER BY RANDOM()
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
