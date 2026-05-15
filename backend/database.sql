
CREATE DATABASE IF NOT EXISTS partiucorrer;
USE partiucorrer;
CREATE TABLE IF NOT EXISTS users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    avatar_url VARCHAR(255) NULL,
    weight DECIMAL(5,2) NULL,
    height DECIMAL(5,2) NULL,
    bmi_updated_at DATETIME NULL,
    reset_token VARCHAR(255) NULL,
    reset_token_expires DATETIME NULL,
    total_distance DECIMAL(10,2) DEFAULT 0,
    total_runs INT DEFAULT 0,
    average_pace DECIMAL(10,2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_total_distance (total_distance)
);
CREATE TABLE IF NOT EXISTS runs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    title VARCHAR(255),
    distance DECIMAL(10,2) NOT NULL,
    duration INT NOT NULL,
    pace DECIMAL(10,2) NOT NULL,
    route_data JSON,
    start_time DATETIME NOT NULL,
    end_time DATETIME NOT NULL,
    is_competition BOOLEAN DEFAULT FALSE,
    competition_id INT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_start_time (user_id, start_time),
    INDEX idx_competition (competition_id)
);
CREATE TABLE IF NOT EXISTS competitions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    distance_target DECIMAL(10,2) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    created_by INT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id),
    INDEX idx_active_dates (is_active, start_date, end_date)
);
CREATE TABLE IF NOT EXISTS competition_participants (
    id INT PRIMARY KEY AUTO_INCREMENT,
    competition_id INT NOT NULL,
    user_id INT NOT NULL,
    current_distance DECIMAL(10,2) DEFAULT 0,
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_participation (competition_id, user_id),
    FOREIGN KEY (competition_id) REFERENCES competitions(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_current_distance (current_distance)
);
CREATE TABLE IF NOT EXISTS groups (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    created_by INT NOT NULL,
    is_private BOOLEAN DEFAULT FALSE,
    invite_code VARCHAR(10) UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id),
    INDEX idx_invite_code (invite_code)
);
CREATE TABLE IF NOT EXISTS group_members (
    id INT PRIMARY KEY AUTO_INCREMENT,
    group_id INT NOT NULL,
    user_id INT NOT NULL,
    role ENUM('member', 'admin') DEFAULT 'member',
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_membership (group_id, user_id),
    FOREIGN KEY (group_id) REFERENCES groups(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS group_messages (
    id INT PRIMARY KEY AUTO_INCREMENT,
    group_id INT NOT NULL,
    user_id INT NOT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (group_id) REFERENCES groups(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id),
    INDEX idx_group_created (group_id, created_at)
);
CREATE TABLE IF NOT EXISTS achievements (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    icon VARCHAR(50),
    required_runs INT NULL,
    required_distance DECIMAL(10,2) NULL,
    INDEX idx_requirements (required_runs, required_distance)
);
CREATE TABLE IF NOT EXISTS user_achievements (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    achievement_id INT NOT NULL,
    earned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_user_achievement (user_id, achievement_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (achievement_id) REFERENCES achievements(id) ON DELETE CASCADE
);
INSERT IGNORE INTO achievements (name, description, icon, required_runs, required_distance) VALUES
('First Step', 'Complete your first run', '👟', 1, NULL),
('5km Runner', 'Run 5km total', '🏃', NULL, 5),
('10km Runner', 'Run 10km total', '🏃‍♂️', NULL, 10),
('Marathoner', 'Run 42.2km total', '🏆', NULL, 42.2),
('Ultra Runner', 'Run 100km total', '⚡', NULL, 100),
('Consistent', 'Complete 10 runs', '📅', 10, NULL),
('Dedicated', 'Complete 50 runs', '🔥', 50, NULL),
('Legend', 'Complete 100 runs', '👑', 100, NULL);
CREATE TABLE IF NOT EXISTS subscription_plans (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    features JSON NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
INSERT IGNORE INTO subscription_plans (id, name, price, features) VALUES
(1, 'Grátis', 0.00, '{"advanced_stats": false, "no_ads": false, "ai_coach": false, "injury_prevention": false, "challenges": false, "export_gpx": false, "audio_coach": false, "unlimited_history": false, "unlimited_groups": false, "unlimited_goals": false, "create_competitions": false, "all_videos": false, "push_notifications": false, "heatmap": false, "advanced_bmi": false, "max_groups": 2, "max_goals": 3, "history_days": 30}'),
(2, 'Premium', 19.90, '{"advanced_stats": true, "no_ads": true, "ai_coach": true, "injury_prevention": true, "challenges": true, "export_gpx": true, "audio_coach": true, "unlimited_history": true, "unlimited_groups": true, "unlimited_goals": true, "create_competitions": true, "all_videos": true, "push_notifications": true, "heatmap": true, "advanced_bmi": true, "max_groups": -1, "max_goals": -1, "history_days": -1}'),
(3, 'Elite', 39.90, '{"advanced_stats": true, "no_ads": true, "ai_coach": true, "injury_prevention": true, "challenges": true, "export_gpx": true, "audio_coach": true, "unlimited_history": true, "unlimited_groups": true, "unlimited_goals": true, "create_competitions": true, "all_videos": true, "push_notifications": true, "heatmap": true, "advanced_bmi": true, "max_groups": -1, "max_goals": -1, "history_days": -1}');
CREATE TABLE IF NOT EXISTS user_subscriptions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    plan_id INT NOT NULL,
    status VARCHAR(50) DEFAULT 'active',
    started_at DATETIME NOT NULL,
    expires_at DATETIME NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (plan_id) REFERENCES subscription_plans(id)
);
CREATE TABLE IF NOT EXISTS push_subscriptions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    subscription_endpoint VARCHAR(500) UNIQUE NOT NULL,
    subscription_keys JSON NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS bmi_history (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    weight DECIMAL(5,2) NOT NULL,
    height DECIMAL(5,2) NOT NULL,
    bmi DECIMAL(5,2) NOT NULL,
    recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS personal_goals (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    goal_type VARCHAR(50) NOT NULL,
    target_value DECIMAL(10,2) NOT NULL,
    current_value DECIMAL(10,2) DEFAULT 0,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    is_completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS ai_training_plans (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    goal_type VARCHAR(50),
    difficulty VARCHAR(50),
    weeks INT NOT NULL,
    start_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS ai_training_workouts (
    id INT PRIMARY KEY AUTO_INCREMENT,
    plan_id INT NOT NULL,
    week INT NOT NULL,
    day INT NOT NULL,
    workout_type VARCHAR(50),
    title VARCHAR(255),
    description TEXT,
    distance_km DECIMAL(10,2),
    target_pace VARCHAR(10),
    intensity VARCHAR(50),
    is_completed BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (plan_id) REFERENCES ai_training_plans(id) ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS injury_alerts (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS challenges (
    id INT PRIMARY KEY AUTO_INCREMENT,
    creator_id INT NOT NULL,
    opponent_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    challenge_type VARCHAR(50) NOT NULL,
    target_value DECIMAL(10,2) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (creator_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (opponent_id) REFERENCES users(id) ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS equipment (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    brand VARCHAR(100),
    category VARCHAR(50) NOT NULL,
    image_url VARCHAR(255),
    price DECIMAL(10,2),
    rating DECIMAL(3,2),
    features JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS workout_videos (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    video_url VARCHAR(255) NOT NULL,
    thumbnail_url VARCHAR(255),
    category VARCHAR(50),
    duration INT,
    order_index INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
INSERT IGNORE INTO users (id, name, email, password_hash, total_distance, total_runs, average_pace) VALUES
(1, 'João Corredor', 'joao@email.com', '$2a$10$fsVp.BqQjzaYn6fe8ST2C.MdYtVwHgAdkQ/zr2qrUPxV/wxu9/aze', 150.5, 25, 5.5),
(2, 'Maria Atleta', 'maria@email.com', '$2a$10$fsVp.BqQjzaYn6fe8ST2C.MdYtVwHgAdkQ/zr2qrUPxV/wxu9/aze', 300.2, 50, 4.8),
(3, 'Carlos Iniciante', 'carlos@email.com', '$2a$10$fsVp.BqQjzaYn6fe8ST2C.MdYtVwHgAdkQ/zr2qrUPxV/wxu9/aze', 15.0, 3, 7.2);
INSERT IGNORE INTO subscription_plans (id, name, price, features) VALUES
(2, 'Premium', 19.90, '{"advanced_stats": true, "no_ads": true, "ai_coach": true, "injury_prevention": true, "challenges": true, "export_gpx": true, "audio_coach": true, "unlimited_history": true, "unlimited_groups": true, "unlimited_goals": true, "create_competitions": true, "all_videos": true, "push_notifications": true, "heatmap": true, "advanced_bmi": true, "max_groups": -1, "max_goals": -1, "history_days": -1}'),
(3, 'Elite', 39.90, '{"advanced_stats": true, "no_ads": true, "ai_coach": true, "injury_prevention": true, "challenges": true, "export_gpx": true, "audio_coach": true, "unlimited_history": true, "unlimited_groups": true, "unlimited_goals": true, "create_competitions": true, "all_videos": true, "push_notifications": true, "heatmap": true, "advanced_bmi": true, "max_groups": -1, "max_goals": -1, "history_days": -1}');
INSERT IGNORE INTO user_subscriptions (user_id, plan_id, status, started_at) VALUES
(1, 2, 'active', DATE_SUB(NOW(), INTERVAL 1 MONTH)),
(2, 2, 'active', DATE_SUB(NOW(), INTERVAL 6 MONTH)),
(3, 1, 'active', NOW());
INSERT IGNORE INTO runs (user_id, title, distance, duration, pace, start_time, end_time) VALUES
(1, 'Corrida Matinal', 5.0, 1800, 6.0, DATE_SUB(NOW(), INTERVAL 2 DAY), DATE_SUB(NOW(), INTERVAL 2 DAY)),
(1, 'Treino Longo', 10.0, 3300, 5.5, DATE_SUB(NOW(), INTERVAL 5 DAY), DATE_SUB(NOW(), INTERVAL 5 DAY)),
(2, 'Meia Maratona', 21.1, 5400, 4.2, DATE_SUB(NOW(), INTERVAL 10 DAY), DATE_SUB(NOW(), INTERVAL 10 DAY)),
(3, 'Primeira Caminhada', 3.0, 2400, 13.3, DATE_SUB(NOW(), INTERVAL 1 DAY), DATE_SUB(NOW(), INTERVAL 1 DAY));
INSERT IGNORE INTO bmi_history (user_id, weight, height, bmi, recorded_at) VALUES
(1, 75.5, 1.75, 24.6, DATE_SUB(NOW(), INTERVAL 1 MONTH)),
(1, 74.0, 1.75, 24.1, NOW()),
(2, 60.0, 1.65, 22.0, NOW());
INSERT IGNORE INTO competitions (id, name, description, distance_target, start_date, end_date, created_by, is_active) VALUES
(1, 'Desafio 100km no Mês', 'Corra 100km até o fim do mês', 100.0, DATE_SUB(NOW(), INTERVAL 5 DAY), DATE_ADD(NOW(), INTERVAL 25 DAY), 1, TRUE);
INSERT IGNORE INTO competition_participants (competition_id, user_id, current_distance) VALUES
(1, 1, 15.0),
(1, 2, 45.0);
INSERT IGNORE INTO groups (id, name, description, created_by, is_private) VALUES
(1, 'Clube da Corrida', 'Grupo para compartilhar resultados diários', 2, FALSE);
INSERT IGNORE INTO group_members (group_id, user_id, role) VALUES
(1, 2, 'admin'),
(1, 1, 'member');
INSERT IGNORE INTO group_messages (group_id, user_id, message) VALUES
(1, 2, 'Bem-vindos ao grupo pessoal!'),
(1, 1, 'Obrigado! Bora correr!');
INSERT IGNORE INTO user_achievements (user_id, achievement_id) VALUES
(1, 1), (1, 2), (1, 3), (2, 1), (2, 2), (2, 3), (2, 6);
INSERT IGNORE INTO personal_goals (user_id, title, goal_type, target_value, current_value, start_date, end_date) VALUES
(1, 'Correr 50km', 'distance', 50.0, 15.0, NOW(), DATE_ADD(NOW(), INTERVAL 30 DAY));
INSERT IGNORE INTO equipment (name, brand, category, price, rating, features) VALUES
('Air Zoom Pegasus', 'Nike', 'shoes', 599.90, 4.8, '{"cushioning": "high", "weight": "medium"}'),
('Forerunner 245', 'Garmin', 'watch', 1599.00, 4.9, '{"gps": true, "heart_rate": true}'),
('Camiseta DryFit', 'Adidas', 'clothing', 89.90, 4.5, '{"material": "polyester", "breathable": true}');
INSERT IGNORE INTO workout_videos (title, description, video_url, category, duration, order_index) VALUES
('Aquecimento Dinâmico', '10 minutos antes de correr', 'https://www.youtube.com/watch?v=1', 'warmup', 10, 1),
('Fortalecimento de Core', 'Para estabilidade na corrida', 'https://www.youtube.com/watch?v=2', 'strength', 15, 2);
INSERT IGNORE INTO injury_alerts (user_id, message) VALUES
(1, 'Atenção: Aumento súbito de volume de treino na última semana.');
INSERT IGNORE INTO challenges (creator_id, opponent_id, title, challenge_type, target_value, status, start_date, end_date) VALUES
(1, 2, 'Quem corre mais rápido 5k', 'pace', 5.0, 'active', NOW(), DATE_ADD(NOW(), INTERVAL 7 DAY));
INSERT IGNORE INTO ai_training_plans (id, user_id, name, description, goal_type, difficulty, weeks, start_date) VALUES
(1, 1, 'Plano de 5K para Iniciantes', 'Treino focado em concluir os primeiros 5km', 'distance', 'beginner', 4, NOW());
INSERT IGNORE INTO ai_training_workouts (plan_id, week, day, workout_type, title, description, distance_km, target_pace, intensity) VALUES
(1, 1, 2, 'easy', 'Trote Leve', 'Corrida leve focada na respiração', 3.0, '7:30', 'Baixa'),
(1, 1, 4, 'interval', 'Treino Intervalado', 'Tiro curto e descanso', 4.0, '6:00', 'Alta');
SHOW TABLES;