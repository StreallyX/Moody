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
-- REPORTS TABLE (for user feedback)
-- ===========================================

CREATE TABLE reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  card_id VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  resolved BOOLEAN DEFAULT false,
  resolved_at TIMESTAMPTZ
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
  category VARCHAR(50) -- 'theme', 'intensity', 'audience'
);

-- Challenge-Tags junction
CREATE TABLE challenge_tags (
  challenge_id UUID REFERENCES challenges(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (challenge_id, tag_id)
);

-- ===========================================
-- MINI-GAMES
-- ===========================================

CREATE TABLE mini_games (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type challenge_type NOT NULL,
  component_name VARCHAR(100) NOT NULL,
  is_premium BOOLEAN DEFAULT false,
  difficulty SMALLINT DEFAULT 1,
  min_players SMALLINT DEFAULT 2,
  max_players SMALLINT,
  duration_seconds SMALLINT DEFAULT 30,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
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
-- AFFILIATE SYSTEM
-- ===========================================

CREATE TABLE affiliate_earnings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  affiliate_id UUID REFERENCES users(id) ON DELETE CASCADE,
  referred_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  amount DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'EUR',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE affiliate_payouts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  affiliate_id UUID REFERENCES users(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'EUR',
  status payout_status DEFAULT 'pending',
  requested_at TIMESTAMPTZ DEFAULT NOW(),
  processed_at TIMESTAMPTZ
);

-- ===========================================
-- INDEXES
-- ===========================================

CREATE INDEX idx_challenges_type ON challenges(type);
CREATE INDEX idx_challenges_level ON challenges(level);
CREATE INDEX idx_challenge_translations_locale ON challenge_translations(locale);
CREATE INDEX idx_users_affiliate_code ON users(affiliate_code);
CREATE INDEX idx_reports_card_id ON reports(card_id);
CREATE INDEX idx_reports_created_at ON reports(created_at);
