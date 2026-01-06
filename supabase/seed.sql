-- Moody Drinking Game - Seed Data
-- This file contains sample content for development and testing
-- Uses CTEs with gen_random_uuid() for valid UUID generation

-- ===========================================
-- GAME MODES
-- ===========================================

WITH inserted_modes AS (
  INSERT INTO modes (id, name, description, is_premium, sort_order) VALUES
    (gen_random_uuid(), 'friends', 'Classic party mode for friends', false, 1),
    (gen_random_uuid(), 'caliente', 'Spicy mode for adventurous players', true, 2),
    (gen_random_uuid(), 'couples', 'Romantic challenges for couples', true, 3),
    (gen_random_uuid(), 'extreme', 'Hardcore challenges for brave souls', true, 4)
  RETURNING id, name
)
SELECT * FROM inserted_modes;

-- ===========================================
-- TAGS
-- ===========================================

INSERT INTO tags (id, name, category) VALUES
  (gen_random_uuid(), 'funny', 'theme'),
  (gen_random_uuid(), 'embarrassing', 'theme'),
  (gen_random_uuid(), 'physical', 'theme'),
  (gen_random_uuid(), 'creative', 'theme'),
  (gen_random_uuid(), 'social', 'theme'),
  (gen_random_uuid(), 'mild', 'intensity'),
  (gen_random_uuid(), 'medium', 'intensity'),
  (gen_random_uuid(), 'hot', 'intensity');

-- ===========================================
-- MINI-GAMES
-- ===========================================

WITH inserted_mini_games AS (
  INSERT INTO mini_games (id, type, component_name, is_premium, difficulty, min_players) VALUES
    (gen_random_uuid(), 'roulette', 'RouletteCard', false, 1, 2),
    (gen_random_uuid(), 'wheelshot', 'WheelShotCard', false, 1, 2),
    (gen_random_uuid(), 'explosion', 'ExplosionCard', false, 2, 2),
    (gen_random_uuid(), 'oracle', 'OracleCard', false, 1, 2),
    (gen_random_uuid(), 'guessword', 'GuessWordCard', true, 2, 3),
    (gen_random_uuid(), 'flashquiz', 'FlashQuizCard', true, 2, 2),
    (gen_random_uuid(), 'hotseat', 'HotSeatCard', false, 1, 3),
    (gen_random_uuid(), 'tapbattle', 'TapBattleCard', true, 2, 2)
  RETURNING id, type
),
mini_game_trans AS (
  INSERT INTO mini_game_translations (mini_game_id, locale, name, instructions)
  SELECT mg.id, t.locale, t.name, t.instructions
  FROM inserted_mini_games mg
  JOIN (VALUES
    ('roulette', 'en', 'Russian Roulette', 'Take turns pulling the trigger. The unlucky one drinks!'),
    ('roulette', 'fr', 'Roulette Russe', 'Tirez à tour de rôle. Le malchanceux boit!'),
    ('wheelshot', 'en', 'Wheel of Shots', 'Spin the wheel to determine your fate!'),
    ('wheelshot', 'fr', 'Roue des Shots', 'Faites tourner la roue pour connaître votre sort!'),
    ('explosion', 'en', 'Bomb Timer', 'Pass the bomb before it explodes!'),
    ('explosion', 'fr', 'Bombe à Retardement', 'Passez la bombe avant qu''elle explose!'),
    ('oracle', 'en', 'The Oracle', 'The oracle reveals who must drink...'),
    ('oracle', 'fr', 'L''Oracle', 'L''oracle révèle qui doit boire...'),
    ('guessword', 'en', 'Guess the Word', 'Make your team guess the word without saying it!'),
    ('guessword', 'fr', 'Devine le Mot', 'Faites deviner le mot à votre équipe sans le dire!'),
    ('flashquiz', 'en', 'Flash Quiz', 'Answer quickly or drink!'),
    ('flashquiz', 'fr', 'Quiz Éclair', 'Répondez vite ou buvez!'),
    ('hotseat', 'en', 'Hot Seat', 'Answer personal questions or take a drink!'),
    ('hotseat', 'fr', 'Sellette', 'Répondez aux questions personnelles ou buvez!'),
    ('tapbattle', 'en', 'Tap Battle', 'Tap faster than your opponent!'),
    ('tapbattle', 'fr', 'Bataille de Taps', 'Tapez plus vite que votre adversaire!')
  ) AS t(type, locale, name, instructions) ON mg.type = t.type
  RETURNING mini_game_id
),
mini_game_configs AS (
  INSERT INTO mini_game_config (mini_game_id, key, value)
  SELECT mg.id, c.key, c.value
  FROM inserted_mini_games mg
  JOIN (VALUES
    ('roulette', 'chambers', '6'),
    ('roulette', 'animation_duration', '2000'),
    ('explosion', 'min_time', '5'),
    ('explosion', 'max_time', '15'),
    ('flashquiz', 'time_per_question', '10'),
    ('flashquiz', 'questions_per_round', '5'),
    ('tapbattle', 'tap_duration', '10'),
    ('tapbattle', 'win_threshold', '50')
  ) AS c(type, key, value) ON mg.type = c.type
  RETURNING mini_game_id
)
SELECT COUNT(*) FROM mini_game_configs;

-- ===========================================
-- CHALLENGES - FRIENDS MODE
-- ===========================================

WITH friends_mode AS (
  SELECT id FROM modes WHERE name = 'friends'
),
inserted_friends_challenges AS (
  INSERT INTO challenges (id, type, level, min_players, is_premium) VALUES
    (gen_random_uuid(), 'challenge', 2, 2, false),
    (gen_random_uuid(), 'challenge', 2, 2, false),
    (gen_random_uuid(), 'challenge', 3, 2, false),
    (gen_random_uuid(), 'question', 2, 2, false),
    (gen_random_uuid(), 'question', 3, 2, false),
    (gen_random_uuid(), 'challenge', 5, 2, false),
    (gen_random_uuid(), 'challenge', 5, 3, false),
    (gen_random_uuid(), 'challenge', 6, 2, false),
    (gen_random_uuid(), 'question', 5, 2, false),
    (gen_random_uuid(), 'question', 6, 2, false),
    (gen_random_uuid(), 'challenge', 7, 2, false),
    (gen_random_uuid(), 'challenge', 8, 2, false),
    (gen_random_uuid(), 'challenge', 8, 3, false),
    (gen_random_uuid(), 'question', 7, 2, false),
    (gen_random_uuid(), 'question', 8, 2, false)
  RETURNING id, type, level, ROW_NUMBER() OVER () as rn
),
friends_translations AS (
  INSERT INTO challenge_translations (challenge_id, locale, text)
  SELECT c.id, t.locale, t.text
  FROM inserted_friends_challenges c
  JOIN (VALUES
    (1, 'en', '{player1} must do their best celebrity impression'),
    (1, 'fr', '{player1} doit faire sa meilleure imitation de célébrité'),
    (2, 'en', '{player1} and {player2} must have a staring contest. Loser drinks!'),
    (2, 'fr', '{player1} et {player2} doivent faire un concours de regard. Le perdant boit!'),
    (3, 'en', 'Everyone point to who they think is the worst dancer. That person drinks!'),
    (3, 'fr', 'Tout le monde pointe celui qui danse le moins bien. Cette personne boit!'),
    (4, 'en', '{player1}, what''s the most embarrassing song on your playlist?'),
    (4, 'fr', '{player1}, quelle est la chanson la plus gênante de ta playlist?'),
    (5, 'en', '{player1}, if you could swap lives with anyone here for a day, who would it be?'),
    (5, 'fr', '{player1}, si tu pouvais échanger ta vie avec quelqu''un ici pour une journée, qui serait-ce?'),
    (6, 'en', '{player1} must speak in an accent for the next 3 rounds'),
    (6, 'fr', '{player1} doit parler avec un accent pendant les 3 prochains tours'),
    (7, 'en', 'The group must create a 30-second TikTok dance. Worst performer drinks!'),
    (7, 'fr', 'Le groupe doit créer une danse TikTok de 30 secondes. Le pire danseur boit!'),
    (8, 'en', '{player1} must let {player2} post anything on their social media'),
    (8, 'fr', '{player1} doit laisser {player2} poster ce qu''il veut sur ses réseaux'),
    (9, 'en', '{player1}, what''s a secret you''ve never told anyone here?'),
    (9, 'fr', '{player1}, quel secret n''as-tu jamais dit à personne ici?'),
    (10, 'en', '{player1}, who here would you trust least with your phone unlocked?'),
    (10, 'fr', '{player1}, à qui ici ferais-tu le moins confiance avec ton téléphone déverrouillé?'),
    (11, 'en', '{player1} must call their ex and say "I miss you" on speaker'),
    (11, 'fr', '{player1} doit appeler son ex et dire "Tu me manques" sur haut-parleur'),
    (12, 'en', '{player1} must let the group send one text from their phone'),
    (12, 'fr', '{player1} doit laisser le groupe envoyer un message depuis son téléphone'),
    (13, 'en', 'Everyone shares their screen time. Highest drinks double!'),
    (13, 'fr', 'Tout le monde montre son temps d''écran. Le plus élevé boit double!'),
    (14, 'en', '{player1}, what''s the worst thing you''ve done that no one here knows about?'),
    (14, 'fr', '{player1}, quelle est la pire chose que tu as faite que personne ici ne sait?'),
    (15, 'en', '{player1}, if you had to date someone here, who would it be and why?'),
    (15, 'fr', '{player1}, si tu devais sortir avec quelqu''un ici, qui serait-ce et pourquoi?')
  ) AS t(rn, locale, text) ON c.rn = t.rn
  RETURNING challenge_id
),
friends_mode_links AS (
  INSERT INTO challenge_modes (challenge_id, mode_id)
  SELECT c.id, fm.id
  FROM inserted_friends_challenges c
  CROSS JOIN friends_mode fm
  RETURNING challenge_id
)
SELECT COUNT(*) FROM friends_mode_links;

-- ===========================================
-- CHALLENGES - CALIENTE MODE (Spicy)
-- ===========================================

WITH caliente_mode AS (
  SELECT id FROM modes WHERE name = 'caliente'
),
inserted_caliente_challenges AS (
  INSERT INTO challenges (id, type, level, min_players, is_premium) VALUES
    (gen_random_uuid(), 'challenge', 4, 2, true),
    (gen_random_uuid(), 'challenge', 5, 2, true),
    (gen_random_uuid(), 'challenge', 6, 2, true),
    (gen_random_uuid(), 'challenge', 7, 2, true),
    (gen_random_uuid(), 'challenge', 8, 2, true),
    (gen_random_uuid(), 'question', 5, 2, true),
    (gen_random_uuid(), 'question', 6, 2, true),
    (gen_random_uuid(), 'question', 7, 2, true),
    (gen_random_uuid(), 'question', 8, 2, true),
    (gen_random_uuid(), 'question', 9, 2, true)
  RETURNING id, type, level, ROW_NUMBER() OVER () as rn
),
caliente_translations AS (
  INSERT INTO challenge_translations (challenge_id, locale, text)
  SELECT c.id, t.locale, t.text
  FROM inserted_caliente_challenges c
  JOIN (VALUES
    (1, 'en', '{player1} must give {player2} a sensual shoulder massage for 30 seconds'),
    (1, 'fr', '{player1} doit faire un massage sensuel des épaules à {player2} pendant 30 secondes'),
    (2, 'en', '{player1} must whisper something seductive in {player2}''s ear'),
    (2, 'fr', '{player1} doit chuchoter quelque chose de séduisant à l''oreille de {player2}'),
    (3, 'en', '{player1} and {player2} must maintain eye contact while complimenting each other'),
    (3, 'fr', '{player1} et {player2} doivent se regarder dans les yeux en se faisant des compliments'),
    (4, 'en', '{player1} must do their sexiest dance move'),
    (4, 'fr', '{player1} doit faire son pas de danse le plus sexy'),
    (5, 'en', '{player1} must remove one item of clothing (accessories count!)'),
    (5, 'fr', '{player1} doit enlever un vêtement (les accessoires comptent!)'),
    (6, 'en', '{player1}, what''s your biggest turn-on?'),
    (6, 'fr', '{player1}, qu''est-ce qui t''excite le plus?'),
    (7, 'en', '{player1}, describe your ideal romantic evening'),
    (7, 'fr', '{player1}, décris ta soirée romantique idéale'),
    (8, 'en', '{player1}, what''s the craziest place you''ve ever kissed someone?'),
    (8, 'fr', '{player1}, quel est l''endroit le plus fou où tu as embrassé quelqu''un?'),
    (9, 'en', '{player1}, who here would you most like to see in swimwear?'),
    (9, 'fr', '{player1}, qui ici aimerais-tu le plus voir en maillot de bain?'),
    (10, 'en', '{player1}, what''s your most secret fantasy?'),
    (10, 'fr', '{player1}, quel est ton fantasme le plus secret?')
  ) AS t(rn, locale, text) ON c.rn = t.rn
  RETURNING challenge_id
),
caliente_mode_links AS (
  INSERT INTO challenge_modes (challenge_id, mode_id)
  SELECT c.id, cm.id
  FROM inserted_caliente_challenges c
  CROSS JOIN caliente_mode cm
  RETURNING challenge_id
)
SELECT COUNT(*) FROM caliente_mode_links;

-- ===========================================
-- SAMPLE AFFILIATE (for testing)
-- ===========================================

-- Note: In production, affiliates would be created through the app
-- This is just for testing the affiliate system

-- INSERT INTO users (id, email, subscription_tier) VALUES
--   (gen_random_uuid(), 'affiliate@test.com', 'premium');

-- INSERT INTO affiliates (user_id, code, commission_rate) VALUES
--   ((SELECT id FROM users WHERE email = 'affiliate@test.com'), 'MOODY-TEST', 20.00);
