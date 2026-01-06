-- Moody Drinking Game - Seed Data
-- This file contains sample content for development and testing

-- ===========================================
-- GAME MODES
-- ===========================================

INSERT INTO modes (id, name, description, is_premium, sort_order) VALUES
  ('11111111-1111-1111-1111-111111111111', 'friends', 'Classic party mode for friends', false, 1),
  ('22222222-2222-2222-2222-222222222222', 'caliente', 'Spicy mode for adventurous players', true, 2),
  ('33333333-3333-3333-3333-333333333333', 'couples', 'Romantic challenges for couples', true, 3),
  ('44444444-4444-4444-4444-444444444444', 'extreme', 'Hardcore challenges for brave souls', true, 4);

-- ===========================================
-- TAGS
-- ===========================================

INSERT INTO tags (id, name, category) VALUES
  ('aaaa1111-1111-1111-1111-111111111111', 'funny', 'theme'),
  ('aaaa2222-2222-2222-2222-222222222222', 'embarrassing', 'theme'),
  ('aaaa3333-3333-3333-3333-333333333333', 'physical', 'theme'),
  ('aaaa4444-4444-4444-4444-444444444444', 'creative', 'theme'),
  ('aaaa5555-5555-5555-5555-555555555555', 'social', 'theme'),
  ('bbbb1111-1111-1111-1111-111111111111', 'mild', 'intensity'),
  ('bbbb2222-2222-2222-2222-222222222222', 'medium', 'intensity'),
  ('bbbb3333-3333-3333-3333-333333333333', 'hot', 'intensity');

-- ===========================================
-- MINI-GAMES
-- ===========================================

INSERT INTO mini_games (id, type, component_name, is_premium, difficulty, min_players) VALUES
  ('mg111111-1111-1111-1111-111111111111', 'roulette', 'RouletteCard', false, 1, 2),
  ('mg222222-2222-2222-2222-222222222222', 'wheelshot', 'WheelShotCard', false, 1, 2),
  ('mg333333-3333-3333-3333-333333333333', 'explosion', 'ExplosionCard', false, 2, 2),
  ('mg444444-4444-4444-4444-444444444444', 'oracle', 'OracleCard', false, 1, 2),
  ('mg555555-5555-5555-5555-555555555555', 'guessword', 'GuessWordCard', true, 2, 3),
  ('mg666666-6666-6666-6666-666666666666', 'flashquiz', 'FlashQuizCard', true, 2, 2),
  ('mg777777-7777-7777-7777-777777777777', 'hotseat', 'HotSeatCard', false, 1, 3),
  ('mg888888-8888-8888-8888-888888888888', 'tapbattle', 'TapBattleCard', true, 2, 2);

INSERT INTO mini_game_translations (mini_game_id, locale, name, instructions) VALUES
  ('mg111111-1111-1111-1111-111111111111', 'en', 'Russian Roulette', 'Take turns pulling the trigger. The unlucky one drinks!'),
  ('mg111111-1111-1111-1111-111111111111', 'fr', 'Roulette Russe', 'Tirez à tour de rôle. Le malchanceux boit!'),
  ('mg222222-2222-2222-2222-222222222222', 'en', 'Wheel of Shots', 'Spin the wheel to determine your fate!'),
  ('mg222222-2222-2222-2222-222222222222', 'fr', 'Roue des Shots', 'Faites tourner la roue pour connaître votre sort!'),
  ('mg333333-3333-3333-3333-333333333333', 'en', 'Bomb Timer', 'Pass the bomb before it explodes!'),
  ('mg333333-3333-3333-3333-333333333333', 'fr', 'Bombe à Retardement', 'Passez la bombe avant qu''elle explose!'),
  ('mg444444-4444-4444-4444-444444444444', 'en', 'The Oracle', 'The oracle reveals who must drink...'),
  ('mg444444-4444-4444-4444-444444444444', 'fr', 'L''Oracle', 'L''oracle révèle qui doit boire...'),
  ('mg555555-5555-5555-5555-555555555555', 'en', 'Guess the Word', 'Make your team guess the word without saying it!'),
  ('mg555555-5555-5555-5555-555555555555', 'fr', 'Devine le Mot', 'Faites deviner le mot à votre équipe sans le dire!'),
  ('mg666666-6666-6666-6666-666666666666', 'en', 'Flash Quiz', 'Answer quickly or drink!'),
  ('mg666666-6666-6666-6666-666666666666', 'fr', 'Quiz Éclair', 'Répondez vite ou buvez!'),
  ('mg777777-7777-7777-7777-777777777777', 'en', 'Hot Seat', 'Answer personal questions or take a drink!'),
  ('mg777777-7777-7777-7777-777777777777', 'fr', 'Sellette', 'Répondez aux questions personnelles ou buvez!'),
  ('mg888888-8888-8888-8888-888888888888', 'en', 'Tap Battle', 'Tap faster than your opponent!'),
  ('mg888888-8888-8888-8888-888888888888', 'fr', 'Bataille de Taps', 'Tapez plus vite que votre adversaire!');

-- ===========================================
-- CHALLENGES - FRIENDS MODE (English)
-- ===========================================

-- Level 1-3 (Easy)
INSERT INTO challenges (id, type, level, min_players, is_premium) VALUES
  ('c0000001-0001-0001-0001-000000000001', 'challenge', 2, 2, false),
  ('c0000001-0001-0001-0001-000000000002', 'challenge', 2, 2, false),
  ('c0000001-0001-0001-0001-000000000003', 'challenge', 3, 2, false),
  ('c0000001-0001-0001-0001-000000000004', 'question', 2, 2, false),
  ('c0000001-0001-0001-0001-000000000005', 'question', 3, 2, false);

INSERT INTO challenge_translations (challenge_id, locale, text) VALUES
  ('c0000001-0001-0001-0001-000000000001', 'en', '{player1} must do their best celebrity impression'),
  ('c0000001-0001-0001-0001-000000000001', 'fr', '{player1} doit faire sa meilleure imitation de célébrité'),
  ('c0000001-0001-0001-0001-000000000002', 'en', '{player1} and {player2} must have a staring contest. Loser drinks!'),
  ('c0000001-0001-0001-0001-000000000002', 'fr', '{player1} et {player2} doivent faire un concours de regard. Le perdant boit!'),
  ('c0000001-0001-0001-0001-000000000003', 'en', 'Everyone point to who they think is the worst dancer. That person drinks!'),
  ('c0000001-0001-0001-0001-000000000003', 'fr', 'Tout le monde pointe celui qui danse le moins bien. Cette personne boit!'),
  ('c0000001-0001-0001-0001-000000000004', 'en', '{player1}, what''s the most embarrassing song on your playlist?'),
  ('c0000001-0001-0001-0001-000000000004', 'fr', '{player1}, quelle est la chanson la plus gênante de ta playlist?'),
  ('c0000001-0001-0001-0001-000000000005', 'en', '{player1}, if you could swap lives with anyone here for a day, who would it be?'),
  ('c0000001-0001-0001-0001-000000000005', 'fr', '{player1}, si tu pouvais échanger ta vie avec quelqu''un ici pour une journée, qui serait-ce?');

-- Level 4-6 (Medium)
INSERT INTO challenges (id, type, level, min_players, is_premium) VALUES
  ('c0000001-0001-0001-0001-000000000006', 'challenge', 5, 2, false),
  ('c0000001-0001-0001-0001-000000000007', 'challenge', 5, 3, false),
  ('c0000001-0001-0001-0001-000000000008', 'challenge', 6, 2, false),
  ('c0000001-0001-0001-0001-000000000009', 'question', 5, 2, false),
  ('c0000001-0001-0001-0001-000000000010', 'question', 6, 2, false);

INSERT INTO challenge_translations (challenge_id, locale, text) VALUES
  ('c0000001-0001-0001-0001-000000000006', 'en', '{player1} must speak in an accent for the next 3 rounds'),
  ('c0000001-0001-0001-0001-000000000006', 'fr', '{player1} doit parler avec un accent pendant les 3 prochains tours'),
  ('c0000001-0001-0001-0001-000000000007', 'en', 'The group must create a 30-second TikTok dance. Worst performer drinks!'),
  ('c0000001-0001-0001-0001-000000000007', 'fr', 'Le groupe doit créer une danse TikTok de 30 secondes. Le pire danseur boit!'),
  ('c0000001-0001-0001-0001-000000000008', 'en', '{player1} must let {player2} post anything on their social media'),
  ('c0000001-0001-0001-0001-000000000008', 'fr', '{player1} doit laisser {player2} poster ce qu''il veut sur ses réseaux'),
  ('c0000001-0001-0001-0001-000000000009', 'en', '{player1}, what''s a secret you''ve never told anyone here?'),
  ('c0000001-0001-0001-0001-000000000009', 'fr', '{player1}, quel secret n''as-tu jamais dit à personne ici?'),
  ('c0000001-0001-0001-0001-000000000010', 'en', '{player1}, who here would you trust least with your phone unlocked?'),
  ('c0000001-0001-0001-0001-000000000010', 'fr', '{player1}, à qui ici ferais-tu le moins confiance avec ton téléphone déverrouillé?');

-- Level 7-10 (Hard)
INSERT INTO challenges (id, type, level, min_players, is_premium) VALUES
  ('c0000001-0001-0001-0001-000000000011', 'challenge', 7, 2, false),
  ('c0000001-0001-0001-0001-000000000012', 'challenge', 8, 2, false),
  ('c0000001-0001-0001-0001-000000000013', 'challenge', 8, 3, false),
  ('c0000001-0001-0001-0001-000000000014', 'question', 7, 2, false),
  ('c0000001-0001-0001-0001-000000000015', 'question', 8, 2, false);

INSERT INTO challenge_translations (challenge_id, locale, text) VALUES
  ('c0000001-0001-0001-0001-000000000011', 'en', '{player1} must call their ex and say "I miss you" on speaker'),
  ('c0000001-0001-0001-0001-000000000011', 'fr', '{player1} doit appeler son ex et dire "Tu me manques" sur haut-parleur'),
  ('c0000001-0001-0001-0001-000000000012', 'en', '{player1} must let the group send one text from their phone'),
  ('c0000001-0001-0001-0001-000000000012', 'fr', '{player1} doit laisser le groupe envoyer un message depuis son téléphone'),
  ('c0000001-0001-0001-0001-000000000013', 'en', 'Everyone shares their screen time. Highest drinks double!'),
  ('c0000001-0001-0001-0001-000000000013', 'fr', 'Tout le monde montre son temps d''écran. Le plus élevé boit double!'),
  ('c0000001-0001-0001-0001-000000000014', 'en', '{player1}, what''s the worst thing you''ve done that no one here knows about?'),
  ('c0000001-0001-0001-0001-000000000014', 'fr', '{player1}, quelle est la pire chose que tu as faite que personne ici ne sait?'),
  ('c0000001-0001-0001-0001-000000000015', 'en', '{player1}, if you had to date someone here, who would it be and why?'),
  ('c0000001-0001-0001-0001-000000000015', 'fr', '{player1}, si tu devais sortir avec quelqu''un ici, qui serait-ce et pourquoi?');

-- ===========================================
-- CHALLENGES - CALIENTE MODE (Spicy)
-- ===========================================

INSERT INTO challenges (id, type, level, min_players, is_premium) VALUES
  ('c0000002-0002-0002-0002-000000000001', 'challenge', 4, 2, true),
  ('c0000002-0002-0002-0002-000000000002', 'challenge', 5, 2, true),
  ('c0000002-0002-0002-0002-000000000003', 'challenge', 6, 2, true),
  ('c0000002-0002-0002-0002-000000000004', 'challenge', 7, 2, true),
  ('c0000002-0002-0002-0002-000000000005', 'challenge', 8, 2, true),
  ('c0000002-0002-0002-0002-000000000006', 'question', 5, 2, true),
  ('c0000002-0002-0002-0002-000000000007', 'question', 6, 2, true),
  ('c0000002-0002-0002-0002-000000000008', 'question', 7, 2, true),
  ('c0000002-0002-0002-0002-000000000009', 'question', 8, 2, true),
  ('c0000002-0002-0002-0002-000000000010', 'question', 9, 2, true);

INSERT INTO challenge_translations (challenge_id, locale, text) VALUES
  ('c0000002-0002-0002-0002-000000000001', 'en', '{player1} must give {player2} a sensual shoulder massage for 30 seconds'),
  ('c0000002-0002-0002-0002-000000000001', 'fr', '{player1} doit faire un massage sensuel des épaules à {player2} pendant 30 secondes'),
  ('c0000002-0002-0002-0002-000000000002', 'en', '{player1} must whisper something seductive in {player2}''s ear'),
  ('c0000002-0002-0002-0002-000000000002', 'fr', '{player1} doit chuchoter quelque chose de séduisant à l''oreille de {player2}'),
  ('c0000002-0002-0002-0002-000000000003', 'en', '{player1} and {player2} must maintain eye contact while complimenting each other'),
  ('c0000002-0002-0002-0002-000000000003', 'fr', '{player1} et {player2} doivent se regarder dans les yeux en se faisant des compliments'),
  ('c0000002-0002-0002-0002-000000000004', 'en', '{player1} must do their sexiest dance move'),
  ('c0000002-0002-0002-0002-000000000004', 'fr', '{player1} doit faire son pas de danse le plus sexy'),
  ('c0000002-0002-0002-0002-000000000005', 'en', '{player1} must remove one item of clothing (accessories count!)'),
  ('c0000002-0002-0002-0002-000000000005', 'fr', '{player1} doit enlever un vêtement (les accessoires comptent!)'),
  ('c0000002-0002-0002-0002-000000000006', 'en', '{player1}, what''s your biggest turn-on?'),
  ('c0000002-0002-0002-0002-000000000006', 'fr', '{player1}, qu''est-ce qui t''excite le plus?'),
  ('c0000002-0002-0002-0002-000000000007', 'en', '{player1}, describe your ideal romantic evening'),
  ('c0000002-0002-0002-0002-000000000007', 'fr', '{player1}, décris ta soirée romantique idéale'),
  ('c0000002-0002-0002-0002-000000000008', 'en', '{player1}, what''s the craziest place you''ve ever kissed someone?'),
  ('c0000002-0002-0002-0002-000000000008', 'fr', '{player1}, quel est l''endroit le plus fou où tu as embrassé quelqu''un?'),
  ('c0000002-0002-0002-0002-000000000009', 'en', '{player1}, who here would you most like to see in swimwear?'),
  ('c0000002-0002-0002-0002-000000000009', 'fr', '{player1}, qui ici aimerais-tu le plus voir en maillot de bain?'),
  ('c0000002-0002-0002-0002-000000000010', 'en', '{player1}, what''s your most secret fantasy?'),
  ('c0000002-0002-0002-0002-000000000010', 'fr', '{player1}, quel est ton fantasme le plus secret?');

-- ===========================================
-- CHALLENGE-MODE ASSOCIATIONS
-- ===========================================

-- Friends mode challenges
INSERT INTO challenge_modes (challenge_id, mode_id)
SELECT c.id, '11111111-1111-1111-1111-111111111111'
FROM challenges c
WHERE c.id LIKE 'c0000001%';

-- Caliente mode challenges
INSERT INTO challenge_modes (challenge_id, mode_id)
SELECT c.id, '22222222-2222-2222-2222-222222222222'
FROM challenges c
WHERE c.id LIKE 'c0000002%';

-- ===========================================
-- MINI-GAME CONFIGURATIONS
-- ===========================================

INSERT INTO mini_game_config (mini_game_id, key, value) VALUES
  ('mg111111-1111-1111-1111-111111111111', 'chambers', '6'::jsonb),
  ('mg111111-1111-1111-1111-111111111111', 'animation_duration', '2000'::jsonb),
  ('mg333333-3333-3333-3333-333333333333', 'min_time', '5'::jsonb),
  ('mg333333-3333-3333-3333-333333333333', 'max_time', '15'::jsonb),
  ('mg666666-6666-6666-6666-666666666666', 'time_per_question', '10'::jsonb),
  ('mg666666-6666-6666-6666-666666666666', 'questions_per_round', '5'::jsonb),
  ('mg888888-8888-8888-8888-888888888888', 'tap_duration', '10'::jsonb),
  ('mg888888-8888-8888-8888-888888888888', 'win_threshold', '50'::jsonb);

-- ===========================================
-- SAMPLE AFFILIATE (for testing)
-- ===========================================

-- Note: In production, affiliates would be created through the app
-- This is just for testing the affiliate system

-- INSERT INTO users (id, email, subscription_tier) VALUES
--   ('test-user-1111-1111-111111111111', 'affiliate@test.com', 'premium');

-- INSERT INTO affiliates (user_id, code, commission_rate) VALUES
--   ('test-user-1111-1111-111111111111', 'MOODY-TEST', 20.00);
