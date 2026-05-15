const express = require('express');
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const dotenv = require('dotenv');
const http = require('http');
const socketIo = require('socket.io');
const webpush = require('web-push');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
if (fs.existsSync(path.join(__dirname, '.env'))) {
    dotenv.config({ path: path.join(__dirname, '.env') });
} else if (fs.existsSync(path.join(__dirname, '../.env'))) {
    dotenv.config({ path: path.join(__dirname, '../.env') });
} else {
    dotenv.config();
}
const app = express();
app.use(helmet());
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true
}));
app.use(express.json({ limit: '1mb' })); 
const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, 
    max: 1000, 
    message: { error: 'Muitas requisições deste IP, tente novamente mais tarde.' },
    standardHeaders: true,
    legacyHeaders: false,
});
app.use('/api', globalLimiter);
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, 
    max: 20, 
    message: { error: 'Muitas tentativas. Sua rede foi bloqueada temporariamente por segurança.' },
    standardHeaders: true,
    legacyHeaders: false,
});
app.use('/api/auth/', authLimiter);
app.use((req, res, next) => {
    console.log(`[REQUEST] ${req.method} ${req.url}`);
    next();
});
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'partiucorrer',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});
const testConnection = async () => {
    try {
        const connection = await pool.getConnection();
        console.log('✅ Database connected successfully');
        connection.release();
    } catch (error) {
        console.error('❌ Database connection failed:', error.message);
    }
};
testConnection();
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Access token required' });
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ error: 'Invalid or expired token' });
        req.user = user;
        next();
    });
};
const checkFeature = (feature) => {
    return async (req, res, next) => {
        try {
            const [subscription] = await pool.execute(
                `SELECT s.*, p.features 
                 FROM user_subscriptions s
                 JOIN subscription_plans p ON s.plan_id = p.id
                 WHERE s.user_id = ? AND s.status = 'active'`,
                [req.user.id]
            );
            let features = {};
            if (subscription.length > 0) {
                features = JSON.parse(subscription[0].features);
            } else {
                const [freePlan] = await pool.execute('SELECT features FROM subscription_plans WHERE price = 0 LIMIT 1');
                features = JSON.parse(freePlan[0].features);
            }
            if (features[feature] === false && features[feature] !== undefined) {
                return res.status(403).json({ 
                    error: 'Recurso disponível apenas para assinantes Premium',
                    upgrade_url: '/plans'
                });
            }
            next();
        } catch (error) {
            next();
        }
    };
};
const server = http.createServer(app);
const io = socketIo(server, {
    cors: { origin: "http://localhost:3000", methods: ["GET", "POST"], credentials: true }
});
io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) return next(new Error('Authentication error'));
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) return next(new Error('Authentication error'));
        socket.userId = user.id;
        socket.userName = user.name;
        next();
    });
});
const userSockets = new Map();
io.on('connection', (socket) => {
    console.log(`🟢 User connected: ${socket.userName} (ID: ${socket.userId})`);
    userSockets.set(socket.userId, socket.id);
    socket.on('join_group', (groupId) => {
        socket.join(`group_${groupId}`);
    });
    socket.on('leave_group', (groupId) => {
        socket.leave(`group_${groupId}`);
    });
    socket.on('disconnect', () => {
        console.log(`🔴 User disconnected: ${socket.userId}`);
        userSockets.delete(socket.userId);
    });
});
webpush.setVapidDetails(
    process.env.VAPID_SUBJECT || 'mailto:admin@runtrack.com',
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
);
async function sendPushNotification(userId, title, body, url = '/dashboard') {
    try {
        const [subscriptions] = await pool.execute(
            'SELECT subscription_endpoint, subscription_keys FROM push_subscriptions WHERE user_id = ?', 
            [userId]
        );
        for (const sub of subscriptions) {
            const subscription = { 
                endpoint: sub.subscription_endpoint, 
                keys: JSON.parse(sub.subscription_keys) 
            };
            const payload = JSON.stringify({ title, body, icon: '/logo192.png', badge: '/favicon.ico', url });
            try {
                await webpush.sendNotification(subscription, payload);
            } catch (error) {
                if (error.statusCode === 410) {
                    await pool.execute('DELETE FROM push_subscriptions WHERE subscription_endpoint = ?', [sub.subscription_endpoint]);
                }
            }
        }
    } catch (error) {
        console.error('Error sending push notification:', error);
    }
}
function sendNotification(userId, notification) {
    const socketId = userSockets.get(userId);
    if (socketId) {
        io.to(socketId).emit('notification', { ...notification, timestamp: new Date() });
    }
    sendPushNotification(userId, notification.title, notification.message, '/dashboard');
}
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: process.env.SMTP_PORT || 587,
    secure: false,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
});
async function sendEmail(to, subject, html) {
    try {
        if (!process.env.SMTP_USER) {
            console.log('📧 Email simulado para:', to, '| Assunto:', subject);
            return true;
        }
        await transporter.sendMail({ from: `"RunTrack" <${process.env.SMTP_USER}>`, to, subject, html });
        return true;
    } catch (error) {
        console.error('Error sending email:', error);
        return false;
    }
}
app.post('/api/auth/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;
        if (!name || !email || !password) return res.status(400).json({ error: 'All fields are required' });
        if (password.length < 6) return res.status(400).json({ error: 'Password must be at least 6 characters' });
        const hashedPassword = await bcrypt.hash(password, 10);
        const [result] = await pool.execute('INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)', [name, email, hashedPassword]);
        await pool.execute('INSERT INTO user_subscriptions (user_id, plan_id, status, started_at) VALUES (?, 1, "active", NOW())', [result.insertId]);
        const token = jwt.sign({ id: result.insertId, email, name }, process.env.JWT_SECRET, { expiresIn: '30d' });
        const refreshToken = jwt.sign({ id: result.insertId }, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET, { expiresIn: '90d' });
        await sendEmail(email, 'Bem-vindo ao RunTrack! 🏃', `<h1>Bem-vindo, ${name}!</h1><p>Sua conta foi criada com sucesso.</p>`);
        res.status(201).json({ token, refreshToken, user: { id: result.insertId, name, email, total_distance: 0, total_runs: 0, average_pace: 0, created_at: new Date() } });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') return res.status(400).json({ error: 'Email already exists' });
        res.status(400).json({ error: error.message });
    }
});
app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const [users] = await pool.execute('SELECT * FROM users WHERE email = ?', [email]);
        if (users.length === 0) return res.status(401).json({ error: 'Invalid credentials' });
        const user = users[0];
        const validPassword = await bcrypt.compare(password, user.password_hash);
        if (!validPassword) return res.status(401).json({ error: 'Invalid credentials' });
        const token = jwt.sign({ id: user.id, email: user.email, name: user.name }, process.env.JWT_SECRET, { expiresIn: '30d' });
        const refreshToken = jwt.sign({ id: user.id }, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET, { expiresIn: '90d' });
        res.json({ token, refreshToken, user: { id: user.id, name: user.name, email: user.email, avatar_url: user.avatar_url, total_distance: parseFloat(user.total_distance) || 0, total_runs: parseInt(user.total_runs) || 0, average_pace: parseFloat(user.average_pace) || 0, created_at: user.created_at } });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});
app.post('/api/auth/refresh-token', async (req, res) => {
    try {
        const { refreshToken } = req.body;
        if (!refreshToken) return res.status(400).json({ error: 'Refresh token is required' });
        const secret = process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET;
        jwt.verify(refreshToken, secret, async (err, decoded) => {
            if (err) return res.status(403).json({ error: 'Invalid or expired refresh token' });
            const [users] = await pool.execute('SELECT id, name, email FROM users WHERE id = ?', [decoded.id]);
            if (users.length === 0) return res.status(404).json({ error: 'User not found' });
            const user = users[0];
            const newToken = jwt.sign({ id: user.id, email: user.email, name: user.name }, process.env.JWT_SECRET, { expiresIn: '30d' });
            const newRefreshToken = jwt.sign({ id: user.id }, secret, { expiresIn: '90d' });
            res.json({ token: newToken, refreshToken: newRefreshToken });
        });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});
app.post('/api/auth/logout', authenticateToken, async (req, res) => {
    res.json({ message: 'Logged out successfully' });
});
app.get('/api/auth/me', authenticateToken, async (req, res) => {
    try {
        const [users] = await pool.execute('SELECT id, name, email, avatar_url, total_distance, total_runs, average_pace, created_at FROM users WHERE id = ?', [req.user.id]);
        if (users.length === 0) return res.status(404).json({ error: 'Usuário não encontrado' });
        res.json(users[0]);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});
app.put('/api/auth/profile', authenticateToken, async (req, res) => {
    try {
        const { name, email } = req.body;
        await pool.execute('UPDATE users SET name = ?, email = ? WHERE id = ?', [name || req.user.name, email || req.user.email, req.user.id]);
        const [updatedUser] = await pool.execute('SELECT id, name, email, avatar_url, total_distance, total_runs, average_pace, created_at FROM users WHERE id = ?', [req.user.id]);
        res.json({ user: updatedUser[0] });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});
app.put('/api/auth/change-password', authenticateToken, async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        if (!currentPassword || !newPassword) return res.status(400).json({ error: 'Current and new passwords are required' });
        if (newPassword.length < 6) return res.status(400).json({ error: 'New password must be at least 6 characters' });
        const [user] = await pool.execute('SELECT password_hash FROM users WHERE id = ?', [req.user.id]);
        const validPassword = await bcrypt.compare(currentPassword, user[0].password_hash);
        if (!validPassword) return res.status(401).json({ error: 'Current password is incorrect' });
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await pool.execute('UPDATE users SET password_hash = ? WHERE id = ?', [hashedPassword, req.user.id]);
        res.json({ message: 'Password changed successfully' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});
app.post('/api/auth/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) return res.status(400).json({ error: 'Email is required' });
        const [users] = await pool.execute('SELECT id, name, email FROM users WHERE email = ?', [email]);
        if (users.length === 0) return res.json({ message: 'Se o email estiver cadastrado, você receberá um link de recuperação.' });
        const user = users[0];
        const resetToken = crypto.randomBytes(32).toString('hex');
        await pool.execute('UPDATE users SET reset_token = ?, reset_token_expires = DATE_ADD(NOW(), INTERVAL 1 HOUR) WHERE id = ?', [resetToken, user.id]);
        const resetLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password/${resetToken}`;
        await sendEmail(email, 'Recuperação de Senha - RunTrack', `<h2>Recuperação de Senha</h2><p>Olá ${user.name},</p><p>Clique no link: <a href="${resetLink}">${resetLink}</a></p>`);
        console.log('🔐 LINK:', resetLink);
        res.json({ message: 'Se o email estiver cadastrado, você receberá um link de recuperação.' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});
app.post('/api/auth/reset-password/:token', async (req, res) => {
    try {
        const { token } = req.params;
        const { password } = req.body;
        if (!password || password.length < 6) return res.status(400).json({ error: 'A senha deve ter no mínimo 6 caracteres' });
        const [users] = await pool.execute('SELECT id FROM users WHERE reset_token = ? AND reset_token_expires > NOW()', [token]);
        if (users.length === 0) return res.status(400).json({ error: 'Link inválido ou expirado' });
        const hashedPassword = await bcrypt.hash(password, 10);
        await pool.execute('UPDATE users SET password_hash = ?, reset_token = NULL, reset_token_expires = NULL WHERE id = ?', [hashedPassword, users[0].id]);
        res.json({ message: 'Senha alterada com sucesso!' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});
app.put('/api/users/profile', authenticateToken, async (req, res) => {
    try {
        const { name, email, currentPassword, newPassword } = req.body;
        const userId = req.user.id;
        if (email) {
            const [existing] = await pool.execute('SELECT id FROM users WHERE email = ? AND id != ?', [email, userId]);
            if (existing.length > 0) return res.status(400).json({ error: 'Email already in use' });
        }
        let updateQuery = 'UPDATE users SET name = ?, email = ? WHERE id = ?';
        let params = [name, email, userId];
        if (newPassword) {
            const [user] = await pool.execute('SELECT password_hash FROM users WHERE id = ?', [userId]);
            const validPassword = await bcrypt.compare(currentPassword, user[0].password_hash);
            if (!validPassword) return res.status(401).json({ error: 'Current password is incorrect' });
            const hashedPassword = await bcrypt.hash(newPassword, 10);
            updateQuery = 'UPDATE users SET name = ?, email = ?, password_hash = ? WHERE id = ?';
            params = [name, email, hashedPassword, userId];
        }
        await pool.execute(updateQuery, params);
        const [updatedUser] = await pool.execute('SELECT id, name, email, avatar_url, total_distance, total_runs, average_pace, created_at FROM users WHERE id = ?', [userId]);
        res.json({ user: updatedUser[0] });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = './uploads/avatars';
        if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        cb(null, `avatar-${req.user.id}-${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(file.originalname)}`);
    }
});
const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (mimetype && extname) cb(null, true);
    else cb(new Error('Apenas imagens são permitidas'));
};
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 }, fileFilter });
app.post('/api/users/avatar', authenticateToken, upload.single('avatar'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ error: 'Nenhum arquivo enviado' });
        const avatarUrl = `/uploads/avatars/${req.file.filename}`;
        const [oldUser] = await pool.execute('SELECT avatar_url FROM users WHERE id = ?', [req.user.id]);
        if (oldUser[0]?.avatar_url) {
            const oldPath = path.join(__dirname, oldUser[0].avatar_url);
            if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
        }
        await pool.execute('UPDATE users SET avatar_url = ? WHERE id = ?', [avatarUrl, req.user.id]);
        res.json({ avatarUrl, message: 'Avatar atualizado!' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});
app.delete('/api/users/avatar', authenticateToken, async (req, res) => {
    try {
        const [user] = await pool.execute('SELECT avatar_url FROM users WHERE id = ?', [req.user.id]);
        if (user[0]?.avatar_url) {
            const oldPath = path.join(__dirname, user[0].avatar_url);
            if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
        }
        await pool.execute('UPDATE users SET avatar_url = NULL WHERE id = ?', [req.user.id]);
        res.json({ message: 'Avatar removido!' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});
app.get('/api/users/search', authenticateToken, async (req, res) => {
    try {
        const { q } = req.query;
        if (!q || q.length < 2) return res.json([]);
        const [users] = await pool.execute('SELECT id, name, email, avatar_url, total_distance, total_runs FROM users WHERE id != ? AND (name LIKE ? OR email LIKE ?) LIMIT 10', [req.user.id, `%${q}%`, `%${q}%`]);
        res.json(users);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});
app.put('/api/users/body-measurements', authenticateToken, async (req, res) => {
    try {
        const { weight, height } = req.body;
        if (!weight || !height) return res.status(400).json({ error: 'Peso e altura são obrigatórios' });
        const bmi = parseFloat((weight / (height * height)).toFixed(1));
        let classification;
        if (bmi < 18.5) classification = 'Abaixo do peso';
        else if (bmi < 25) classification = 'Peso normal';
        else if (bmi < 30) classification = 'Sobrepeso';
        else if (bmi < 35) classification = 'Obesidade grau I';
        else if (bmi < 40) classification = 'Obesidade grau II';
        else classification = 'Obesidade grau III';
        await pool.execute('UPDATE users SET weight = ?, height = ?, bmi_updated_at = NOW() WHERE id = ?', [weight, height, req.user.id]);
        await pool.execute('INSERT INTO bmi_history (user_id, weight, height, bmi) VALUES (?, ?, ?, ?)', [req.user.id, weight, height, bmi]);
        let recommendations = [];
        if (bmi < 18.5) recommendations = ['Foco em fortalecimento muscular', 'Aumentar ingestão calórica saudável', 'Evitar overtraining'];
        else if (bmi < 25) recommendations = ['Manter treinos balanceados', 'Continuar com alimentação equilibrada', 'Excelente faixa para performance'];
        else if (bmi < 30) recommendations = ['Priorizar tênis com bom amortecimento', 'Aumentar intensidade gradualmente', 'Combinar corrida com musculação'];
        else recommendations = ['Começar com caminhadas', 'Consultar médico antes de treinos intensos', 'Foco em proteção articular'];
        res.json({ weight: parseFloat(weight), height: parseFloat(height), bmi, classification, recommendations, message: 'Medidas atualizadas!' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});
app.get('/api/users/bmi-history', authenticateToken, async (req, res) => {
    try {
        const [user] = await pool.execute('SELECT weight, height, bmi_updated_at FROM users WHERE id = ?', [req.user.id]);
        let currentBMI = null, classification = null;
        if (user[0]?.weight && user[0]?.height) {
            currentBMI = parseFloat((user[0].weight / (user[0].height * user[0].height)).toFixed(1));
            if (currentBMI < 18.5) classification = 'Abaixo do peso';
            else if (currentBMI < 25) classification = 'Peso normal';
            else if (currentBMI < 30) classification = 'Sobrepeso';
            else if (currentBMI < 35) classification = 'Obesidade grau I';
            else if (currentBMI < 40) classification = 'Obesidade grau II';
            else classification = 'Obesidade grau III';
        }
        const [history] = await pool.execute('SELECT weight, height, bmi, recorded_at FROM bmi_history WHERE user_id = ? ORDER BY recorded_at DESC LIMIT 12', [req.user.id]);
        let calorieStats = null;
        if (user[0]?.weight) {
            const [runs] = await pool.execute('SELECT SUM(distance) as total_distance, SUM(duration) as total_duration, COUNT(*) as total_runs FROM runs WHERE user_id = ? AND created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)', [req.user.id]);
            if (runs[0]?.total_distance > 0) {
                const avgPace = runs[0].total_duration / 60 / runs[0].total_distance;
                const MET = avgPace < 5 ? 12 : avgPace < 6 ? 10 : 8;
                const totalCalories = Math.round(MET * user[0].weight * (runs[0].total_duration / 3600));
                calorieStats = { total_distance: parseFloat(runs[0].total_distance).toFixed(1), total_calories: totalCalories, avg_calories_per_run: Math.round(totalCalories / runs[0].total_runs), weight_kg: parseFloat(user[0].weight) };
            }
        }
        res.json({ weight: user[0]?.weight ? parseFloat(user[0].weight) : null, height: user[0]?.height ? parseFloat(user[0].height) : null, bmi: currentBMI, classification, bmi_updated_at: user[0]?.bmi_updated_at, history, calorie_stats: calorieStats });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});
app.get('/api/users/bmi-recommendations', authenticateToken, async (req, res) => {
    try {
        const [user] = await pool.execute('SELECT weight, height, total_distance FROM users WHERE id = ?', [req.user.id]);
        if (!user[0]?.weight || !user[0]?.height) return res.json({ has_data: false, message: 'Registre seu peso e altura para receber recomendações' });
        const bmi = user[0].weight / (user[0].height * user[0].height);
        let shoeRecommendation, trainingRecommendations = [], injuryRisk;
        if (bmi > 28) shoeRecommendation = 'Tênis com máximo amortecimento (Hoka Clifton, ASICS Kayano)';
        else if (bmi > 25) shoeRecommendation = 'Tênis com bom amortecimento (Brooks Ghost, Nike Pegasus)';
        else shoeRecommendation = 'Tênis equilibrado (Mizuno Wave Rider)';
        if (bmi < 18.5) trainingRecommendations = ['Reduza volume de corrida e aumente treinos de força', 'Foque em ganho de massa muscular'];
        else if (bmi < 25) trainingRecommendations = ['Mantenha treinos variados', 'Seu peso é ideal para performance'];
        else if (bmi < 30) trainingRecommendations = ['Priorize superfícies macias', 'Alterne corrida com natação ou bike'];
        else trainingRecommendations = ['Comece com caminhada rápida', 'Use monitor cardíaco'];
        const weeklyKm = user[0].total_distance / 4;
        if (bmi > 30 && weeklyKm > 20) injuryRisk = 'Alto';
        else if (bmi > 25 && weeklyKm > 30) injuryRisk = 'Moderado';
        else injuryRisk = 'Baixo';
        res.json({ has_data: true, bmi: parseFloat(bmi.toFixed(1)), shoe_recommendation: shoeRecommendation, training_recommendations: trainingRecommendations, injury_risk: injuryRisk, weight: parseFloat(user[0].weight), height: parseFloat(user[0].height) });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});
app.post('/api/runs', authenticateToken, async (req, res) => {
    try {
        const { distance, duration, pace, route_data, start_time, end_time, is_competition, competition_id, title } = req.body;
        const [result] = await pool.execute('INSERT INTO runs (user_id, title, distance, duration, pace, route_data, start_time, end_time, is_competition, competition_id, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())', [req.user.id, title || `Run ${distance}km`, distance, duration, pace, route_data ? JSON.stringify(route_data) : null, start_time || new Date(), end_time, is_competition || false, competition_id || null]);
        await pool.execute('UPDATE users SET total_distance = total_distance + ?, total_runs = total_runs + 1 WHERE id = ?', [distance, req.user.id]);
        const [userStats] = await pool.execute('SELECT total_distance, total_runs FROM users WHERE id = ?', [req.user.id]);
        const avgPace = userStats[0].total_runs > 0 ? userStats[0].total_distance / userStats[0].total_runs : 0;
        await pool.execute('UPDATE users SET average_pace = ? WHERE id = ?', [avgPace, req.user.id]);
        if (competition_id) await pool.execute('UPDATE competition_participants SET current_distance = current_distance + ? WHERE competition_id = ? AND user_id = ?', [distance, competition_id, req.user.id]);
        await checkAchievements(req.user.id);
        res.json({ id: result.insertId, message: 'Run saved!' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});
app.get('/api/runs/history', authenticateToken, async (req, res) => {
    try {
        const [subscription] = await pool.execute(
            `SELECT p.features FROM user_subscriptions s
             JOIN subscription_plans p ON s.plan_id = p.id
             WHERE s.user_id = ? AND s.status = 'active'
             ORDER BY s.id DESC LIMIT 1`,
            [req.user.id]
        );
        let historyDays = 15; 
        if (subscription.length > 0) {
            const features = JSON.parse(subscription[0].features);
            const planId = subscription[0].plan_id;
            if (planId === 3 || features.history_days === -1 || features.unlimited_history) {
                historyDays = null; 
            } else if (planId === 2) {
                historyDays = 90; 
            } else if (features.history_days) {
                historyDays = features.history_days;
            }
        }
        const dateFilter = historyDays
            ? `AND created_at >= DATE_SUB(NOW(), INTERVAL ${historyDays} DAY)`
            : '';
        const [runs] = await pool.execute(
            `SELECT id, title, distance, duration, pace, created_at as run_date, route_data IS NOT NULL as has_route
             FROM runs WHERE user_id = ? ${dateFilter}
             ORDER BY created_at DESC LIMIT 100`,
            [req.user.id]
        );
        res.json(runs.map(run => ({ ...run, distance: parseFloat(run.distance) || 0, duration: parseInt(run.duration) || 0, pace: parseFloat(run.pace) || 0, start_time: run.run_date })));
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});
app.get('/api/runs/stats', authenticateToken, async (req, res) => {
    try {
        const [stats] = await pool.execute('SELECT COALESCE(SUM(distance), 0) as total_distance, COUNT(*) as total_runs, COALESCE(AVG(pace), 0) as average_pace, COALESCE(SUM(duration), 0) as total_duration FROM runs WHERE user_id = ?', [req.user.id]);
        res.json({ total_distance: parseFloat(stats[0].total_distance) || 0, total_runs: parseInt(stats[0].total_runs) || 0, average_pace: parseFloat(stats[0].average_pace) || 0, total_duration: parseInt(stats[0].total_duration) || 0 });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});
app.get('/api/runs/:id', authenticateToken, async (req, res) => {
    try {
        const [runs] = await pool.execute('SELECT * FROM runs WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
        if (runs.length === 0) return res.status(404).json({ error: 'Run not found' });
        const run = runs[0];
        run.distance = parseFloat(run.distance) || 0;
        run.duration = parseInt(run.duration) || 0;
        run.pace = parseFloat(run.pace) || 0;
        if (run.route_data) try { run.route_data = JSON.parse(run.route_data); } catch(e) { run.route_data = null; }
        res.json(run);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});
app.delete('/api/runs/:id', authenticateToken, async (req, res) => {
    try {
        const [run] = await pool.execute('SELECT distance, competition_id FROM runs WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
        if (run.length === 0) return res.status(404).json({ error: 'Run not found' });
        await pool.execute('DELETE FROM runs WHERE id = ?', [req.params.id]);
        await pool.execute('UPDATE users SET total_distance = GREATEST(total_distance - ?, 0), total_runs = GREATEST(total_runs - 1, 0) WHERE id = ?', [run[0].distance, req.user.id]);
        if (run[0].competition_id) await pool.execute('UPDATE competition_participants SET current_distance = GREATEST(current_distance - ?, 0) WHERE competition_id = ? AND user_id = ?', [run[0].distance, run[0].competition_id, req.user.id]);
        res.json({ message: 'Run deleted' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});
app.get('/api/runs/:id/export-gpx', authenticateToken, async (req, res) => {
    try {
        const [runs] = await pool.execute('SELECT * FROM runs WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
        if (runs.length === 0) return res.status(404).json({ error: 'Run not found' });
        const run = runs[0];
        let routeData = null;
        if (run.route_data) try { routeData = JSON.parse(run.route_data); } catch(e) {}
        const formatDate = (d) => d ? new Date(d).toISOString() : new Date().toISOString();
        const esc = (s) => s ? s.replace(/[<>&'"]/g, c => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;' }[c])) : '';
        let gpx = `<?xml version="1.0" encoding="UTF-8"?><gpx version="1.1" creator="RunTrack" xmlns="http://www.topografix.com/GPX/1/1"><metadata><name>${esc(run.title || 'Corrida')}</name><time>${formatDate(run.start_time)}</time></metadata><trk><name>${esc(run.title || 'Corrida')}</name><type>Running</type><trkseg>`;
        if (routeData?.coordinates?.length > 0) for (const c of routeData.coordinates) gpx += `\n<trkpt lat="${c[0]}" lon="${c[1]}"><ele>${c[2] || 0}</ele></trkpt>`;
        gpx += '\n</trkseg></trk></gpx>';
        res.setHeader('Content-Type', 'application/gpx+xml');
        res.setHeader('Content-Disposition', `attachment; filename="run_${run.id}.gpx"`);
        res.send(gpx);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});
app.post('/api/competitions', authenticateToken, async (req, res) => {
    try {
        const [subscription] = await pool.execute(
            `SELECT p.features FROM user_subscriptions s
             JOIN subscription_plans p ON s.plan_id = p.id
             WHERE s.user_id = ? AND s.status = 'active'
             ORDER BY s.id DESC LIMIT 1`,
            [req.user.id]
        );
        if (subscription.length > 0) {
            const planId = subscription[0].plan_id;
            const features = JSON.parse(subscription[0].features);
            if (planId !== 2 && planId !== 3 && !features.create_competitions) {
                return res.status(403).json({ error: 'Criar competições está disponível a partir do plano Premium', upgrade_url: '/plans' });
            }
        } else {
            return res.status(403).json({ error: 'Criar competições está disponível a partir do plano Premium', upgrade_url: '/plans' });
        }
        const { name, description, distance_target, start_date, end_date } = req.body;
        const [result] = await pool.execute('INSERT INTO competitions (name, description, distance_target, start_date, end_date, created_by) VALUES (?, ?, ?, ?, ?, ?)', [name, description, distance_target, start_date, end_date, req.user.id]);
        res.json({ id: result.insertId, message: 'Competition created!' });
    } catch (error) { res.status(400).json({ error: error.message }); }
});
app.post('/api/competitions/:id/join', authenticateToken, async (req, res) => {
    try {
        const [existing] = await pool.execute('SELECT id FROM competition_participants WHERE competition_id = ? AND user_id = ?', [req.params.id, req.user.id]);
        if (existing.length > 0) return res.status(400).json({ error: 'Already joined' });
        await pool.execute('INSERT INTO competition_participants (competition_id, user_id) VALUES (?, ?)', [req.params.id, req.user.id]);
        res.json({ message: 'Joined!' });
    } catch (error) { res.status(400).json({ error: error.message }); }
});
app.post('/api/competitions/:id/leave', authenticateToken, async (req, res) => {
    try {
        await pool.execute('DELETE FROM competition_participants WHERE competition_id = ? AND user_id = ?', [req.params.id, req.user.id]);
        res.json({ message: 'Left competition' });
    } catch (error) { res.status(400).json({ error: error.message }); }
});
app.get('/api/competitions', authenticateToken, async (req, res) => {
    try {
        const [competitions] = await pool.execute('SELECT c.*, (SELECT COUNT(*) FROM competition_participants WHERE competition_id = c.id) as participants_count FROM competitions c WHERE c.is_active = TRUE AND c.end_date >= CURDATE() ORDER BY c.start_date ASC');
        for (let comp of competitions) {
            const [up] = await pool.execute('SELECT current_distance FROM competition_participants WHERE competition_id = ? AND user_id = ?', [comp.id, req.user.id]);
            comp.user_joined = up.length > 0;
            comp.current_distance = up.length > 0 ? parseFloat(up[0].current_distance) : 0;
            comp.distance_target = parseFloat(comp.distance_target) || 0;
            comp.participants_count = parseInt(comp.participants_count) || 0;
        }
        res.json(competitions);
    } catch (error) { res.status(400).json({ error: error.message }); }
});
app.get('/api/competitions/my', authenticateToken, async (req, res) => {
    try {
        const [competitions] = await pool.execute('SELECT c.*, cp.current_distance, cp.joined_at, (SELECT COUNT(*) FROM competition_participants WHERE competition_id = c.id) as participants_count FROM competitions c JOIN competition_participants cp ON c.id = cp.competition_id WHERE cp.user_id = ? AND c.end_date >= CURDATE() ORDER BY c.end_date ASC', [req.user.id]);
        for (let comp of competitions) {
            comp.current_distance = parseFloat(comp.current_distance) || 0;
            comp.distance_target = parseFloat(comp.distance_target) || 0;
            comp.participants_count = parseInt(comp.participants_count) || 0;
        }
        res.json(competitions);
    } catch (error) { res.status(400).json({ error: error.message }); }
});
app.post('/api/groups', authenticateToken, async (req, res) => {
    try {
        const [subscription] = await pool.execute(
            `SELECT p.features FROM user_subscriptions s
             JOIN subscription_plans p ON s.plan_id = p.id
             WHERE s.user_id = ? AND s.status = 'active'
             ORDER BY s.id DESC LIMIT 1`,
            [req.user.id]
        );
        let maxGroups = 2; 
        if (subscription.length > 0) {
            const planId = subscription[0].plan_id;
            if (planId === 3) {
                maxGroups = -1; 
            } else if (planId === 2) {
                maxGroups = 5; 
            } else {
                const features = JSON.parse(subscription[0].features);
                maxGroups = features.max_groups !== undefined ? features.max_groups : 2;
            }
        }
        if (maxGroups !== -1) {
            const [existingGroups] = await pool.execute(
                'SELECT COUNT(*) as count FROM group_members WHERE user_id = ?',
                [req.user.id]
            );
            if (existingGroups[0].count >= maxGroups) {
                return res.status(403).json({
                    error: `Seu plano permite participar de até ${maxGroups} grupos. Faça upgrade para grupos ilimitados.`,
                    upgrade_url: '/plans'
                });
            }
        }
        const { name, description, is_private } = req.body;
        const inviteCode = is_private ? Math.random().toString(36).substring(2, 8).toUpperCase() : null;
        const [result] = await pool.execute('INSERT INTO groups (name, description, created_by, is_private, invite_code) VALUES (?, ?, ?, ?, ?)', [name, description, req.user.id, is_private || false, inviteCode]);
        await pool.execute('INSERT INTO group_members (group_id, user_id, role) VALUES (?, ?, ?)', [result.insertId, req.user.id, 'admin']);
        res.json({ id: result.insertId, inviteCode, message: 'Group created!' });
    } catch (error) { res.status(400).json({ error: error.message }); }
});
app.post('/api/groups/:code/join', authenticateToken, async (req, res) => {
    try {
        const [groups] = await pool.execute('SELECT id FROM groups WHERE invite_code = ? AND is_private = TRUE', [req.params.code]);
        if (groups.length === 0) return res.status(404).json({ error: 'Invalid invite code' });
        const [existing] = await pool.execute('SELECT id FROM group_members WHERE group_id = ? AND user_id = ?', [groups[0].id, req.user.id]);
        if (existing.length > 0) return res.status(400).json({ error: 'Already a member' });
        await pool.execute('INSERT INTO group_members (group_id, user_id) VALUES (?, ?)', [groups[0].id, req.user.id]);
        res.json({ message: 'Joined group!' });
    } catch (error) { res.status(400).json({ error: error.message }); }
});
app.post('/api/groups/:id/leave', authenticateToken, async (req, res) => {
    try {
        await pool.execute('DELETE FROM group_members WHERE group_id = ? AND user_id = ?', [req.params.id, req.user.id]);
        res.json({ message: 'Left group' });
    } catch (error) { res.status(400).json({ error: error.message }); }
});
app.get('/api/groups', authenticateToken, async (req, res) => {
    try {
        const [groups] = await pool.execute('SELECT g.*, (SELECT COUNT(*) FROM group_members WHERE group_id = g.id) as members_count, COALESCE((SELECT SUM(r.distance) FROM runs r JOIN group_members gm ON r.user_id = gm.user_id WHERE gm.group_id = g.id AND r.created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)), 0) as week_distance FROM groups g JOIN group_members gm ON g.id = gm.group_id WHERE gm.user_id = ? GROUP BY g.id ORDER BY g.created_at DESC', [req.user.id]);
        res.json(groups.map(g => ({ ...g, members_count: parseInt(g.members_count) || 0, week_distance: parseFloat(g.week_distance) || 0 })));
    } catch (error) { res.status(400).json({ error: error.message }); }
});
app.get('/api/groups/:id/members', authenticateToken, async (req, res) => {
    try {
        const [members] = await pool.execute('SELECT u.id, u.name, u.avatar_url, COALESCE(u.total_distance, 0) as total_distance, COALESCE(u.total_runs, 0) as total_runs, gm.role, gm.joined_at FROM users u JOIN group_members gm ON u.id = gm.user_id WHERE gm.group_id = ? ORDER BY u.total_distance DESC', [req.params.id]);
        res.json(members.map(m => ({ ...m, total_distance: parseFloat(m.total_distance) || 0, total_runs: parseInt(m.total_runs) || 0 })));
    } catch (error) { res.status(400).json({ error: error.message }); }
});
app.post('/api/groups/:id/messages', authenticateToken, async (req, res) => {
    try {
        const { message } = req.body;
        if (!message?.trim()) return res.status(400).json({ error: 'Message cannot be empty' });
        const [member] = await pool.execute('SELECT id FROM group_members WHERE group_id = ? AND user_id = ?', [req.params.id, req.user.id]);
        if (member.length === 0) return res.status(403).json({ error: 'Not a member' });
        const [result] = await pool.execute('INSERT INTO group_messages (group_id, user_id, message) VALUES (?, ?, ?)', [req.params.id, req.user.id, message]);
        const [user] = await pool.execute('SELECT name FROM users WHERE id = ?', [req.user.id]);
        const newMessage = { id: result.insertId, user_id: req.user.id, user_name: user[0].name, message, created_at: new Date() };
        io.to(`group_${req.params.id}`).emit('new_message', newMessage);
        res.json(newMessage);
    } catch (error) { res.status(400).json({ error: error.message }); }
});
app.get('/api/groups/:id/messages', authenticateToken, async (req, res) => {
    try {
        const [member] = await pool.execute('SELECT id FROM group_members WHERE group_id = ? AND user_id = ?', [req.params.id, req.user.id]);
        if (member.length === 0) return res.status(403).json({ error: 'Not a member' });
        const [messages] = await pool.execute('SELECT gm.*, u.name as user_name FROM group_messages gm JOIN users u ON gm.user_id = u.id WHERE gm.group_id = ? ORDER BY gm.created_at DESC LIMIT 50', [req.params.id]);
        res.json(messages.reverse());
    } catch (error) { res.status(400).json({ error: error.message }); }
});
app.get('/api/dashboard/stats', authenticateToken, async (req, res) => {
    try {
        const [stats] = await pool.execute('SELECT COALESCE(total_distance, 0) as total_distance, COALESCE(total_runs, 0) as total_runs, COALESCE(average_pace, 0) as average_pace FROM users WHERE id = ?', [req.user.id]);
        const [recentRuns] = await pool.execute('SELECT id, title, distance, duration, pace, created_at, route_data IS NOT NULL as has_route FROM runs WHERE user_id = ? ORDER BY created_at DESC LIMIT 5', [req.user.id]);
        const [weeklyStats] = await pool.execute('SELECT DAYNAME(created_at) as day, COALESCE(SUM(distance), 0) as total_distance, COUNT(*) as runs_count FROM runs WHERE user_id = ? AND created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY) GROUP BY DAYNAME(created_at) ORDER BY FIELD(DAYNAME(created_at), "Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday")', [req.user.id]);
        const [achievements] = await pool.execute('SELECT a.*, ua.earned_at FROM achievements a LEFT JOIN user_achievements ua ON a.id = ua.achievement_id AND ua.user_id = ? ORDER BY ua.earned_at DESC, a.id ASC LIMIT 6', [req.user.id]);
        res.json({ stats: { total_distance: parseFloat(stats[0]?.total_distance) || 0, total_runs: parseInt(stats[0]?.total_runs) || 0, average_pace: parseFloat(stats[0]?.average_pace) || 0 }, recentRuns: recentRuns.map(r => ({ id: r.id, distance: parseFloat(r.distance) || 0, duration: parseInt(r.duration) || 0, pace: parseFloat(r.pace) || 0, start_time: r.created_at, title: r.title, has_route: r.has_route })), weeklyStats: weeklyStats.map(d => ({ day: d.day, total_distance: parseFloat(d.total_distance) || 0, runs_count: parseInt(d.runs_count) || 0 })), achievements: achievements || [] });
    } catch (error) { res.status(400).json({ error: error.message }); }
});
app.get('/api/performance/analysis', authenticateToken, async (req, res) => {
    res.json({ averagePace: '0:00', paceTrend: 'up', paceChange: 0, totalDistance: '0', distanceIncrease: 0, consistencyScore: 0, activeDays: 0, recordsBroken: 0, paceHistory: [], recommendations: ['Continue correndo!'] });
});
app.get('/api/performance/heatmap', authenticateToken, async (req, res) => {
    res.json({ hourly: [], weekly: [], monthly: [], matrix: [] });
});
app.get('/api/streaks', authenticateToken, async (req, res) => {
    const [r] = await pool.execute('SELECT COUNT(DISTINCT DATE(created_at)) as d FROM runs WHERE user_id = ?', [req.user.id]);
    res.json({ currentStreak: 0, longestStreak: 0, totalActiveDays: parseInt(r[0]?.d) || 0 });
});
app.get('/api/achievements/user', authenticateToken, async (req, res) => {
    const [a] = await pool.execute('SELECT a.*, CASE WHEN ua.id IS NOT NULL THEN true ELSE false END as earned FROM achievements a LEFT JOIN user_achievements ua ON a.id = ua.achievement_id AND ua.user_id = ? ORDER BY earned DESC', [req.user.id]);
    res.json(a);
});
app.post('/api/goals', authenticateToken, async (req, res) => {
    try {
        const [subscription] = await pool.execute(
            `SELECT p.features FROM user_subscriptions s
             JOIN subscription_plans p ON s.plan_id = p.id
             WHERE s.user_id = ? AND s.status = 'active'
             ORDER BY s.id DESC LIMIT 1`,
            [req.user.id]
        );
        let maxGoals = 2; 
        if (subscription.length > 0) {
            const planId = subscription[0].plan_id;
            if (planId === 3) {
                maxGoals = -1; 
            } else if (planId === 2) {
                maxGoals = 5; 
            } else {
                const features = JSON.parse(subscription[0].features);
                maxGoals = features.max_goals !== undefined ? features.max_goals : 2;
            }
        }
        if (maxGoals !== -1) {
            const [activeGoals] = await pool.execute(
                'SELECT COUNT(*) as count FROM personal_goals WHERE user_id = ? AND is_completed = 0',
                [req.user.id]
            );
            if (activeGoals[0].count >= maxGoals) {
                return res.status(403).json({
                    error: `Seu plano permite até ${maxGoals} metas ativas. Faça upgrade para metas ilimitadas.`,
                    upgrade_url: '/plans'
                });
            }
        }
        const { title, description, goal_type, target_value, start_date, end_date } = req.body;
        const [r] = await pool.execute('INSERT INTO personal_goals (user_id, title, description, goal_type, target_value, start_date, end_date) VALUES (?, ?, ?, ?, ?, ?, ?)', [req.user.id, title, description, goal_type, target_value, start_date, end_date]);
        res.json({ id: r.insertId, message: 'Meta criada!' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});
app.get('/api/goals', authenticateToken, async (req, res) => {
    const [g] = await pool.execute('SELECT *, CASE WHEN is_completed = 1 THEN "completed" WHEN end_date < CURDATE() THEN "expired" ELSE "active" END as status, ROUND((current_value/target_value)*100, 1) as progress_percentage FROM personal_goals WHERE user_id = ? ORDER BY end_date ASC', [req.user.id]);
    res.json(g);
});
app.delete('/api/goals/:id', authenticateToken, async (req, res) => {
    await pool.execute('DELETE FROM personal_goals WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
    res.json({ message: 'Meta removida!' });
});
app.get('/api/goals/stats', authenticateToken, async (req, res) => {
    const [s] = await pool.execute('SELECT COUNT(*) as total_goals, SUM(CASE WHEN is_completed=1 THEN 1 ELSE 0 END) as completed_goals, SUM(CASE WHEN is_completed=0 AND end_date>=CURDATE() THEN 1 ELSE 0 END) as active_goals FROM personal_goals WHERE user_id = ?', [req.user.id]);
    res.json(s[0]);
});
app.post('/api/ai-training/generate', authenticateToken, async (req, res) => {
    const { goal_type, difficulty, weeks, start_date } = req.body;
    const plan = { user_id: req.user.id, name: `${difficulty} - ${goal_type}`, description: 'Plano personalizado', goal_type, difficulty, weeks, start_date: start_date || new Date(), workouts: [] };
    for (let w = 1; w <= weeks; w++) for (let d of [2,3,5,6,7]) plan.workouts.push({ week: w, day: d, workout_type: 'easy', title: 'Corrida Leve', description: 'Treino leve', distance_km: 5, target_pace: '6:00', intensity: 'Moderada' });
    res.json({ plan, message: 'Plano gerado!' });
});
app.post('/api/ai-training/save', authenticateToken, async (req, res) => {
    const { plan } = req.body;
    const [r] = await pool.execute('INSERT INTO ai_training_plans (user_id, name, description, goal_type, difficulty, weeks, start_date) VALUES (?,?,?,?,?,?,?)', [req.user.id, plan.name, plan.description, plan.goal_type, plan.difficulty, plan.weeks, plan.start_date]);
    for (const w of plan.workouts) await pool.execute('INSERT INTO ai_training_workouts (plan_id, week, day, workout_type, title, description, distance_km, target_pace, intensity) VALUES (?,?,?,?,?,?,?,?,?)', [r.insertId, w.week, w.day, w.workout_type, w.title, w.description, w.distance_km, w.target_pace, w.intensity]);
    res.json({ id: r.insertId, message: 'Plano salvo!' });
});
app.get('/api/ai-training/plans', authenticateToken, async (req, res) => {
    const [p] = await pool.execute('SELECT * FROM ai_training_plans WHERE user_id = ? ORDER BY created_at DESC', [req.user.id]);
    res.json(p);
});
app.get('/api/ai-training/plans/:id', authenticateToken, async (req, res) => {
    const [p] = await pool.execute('SELECT * FROM ai_training_plans WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
    if (p.length === 0) return res.status(404).json({ error: 'Not found' });
    const [w] = await pool.execute('SELECT * FROM ai_training_workouts WHERE plan_id = ? ORDER BY week, day', [req.params.id]);
    res.json({ plan: p[0], workouts: w });
});
app.get('/api/ranking/global', authenticateToken, async (req, res) => {
    const [d] = await pool.execute('SELECT u.id, u.name, COALESCE(SUM(r.distance),0) as total_distance, COUNT(r.id) as total_runs FROM users u LEFT JOIN runs r ON u.id=r.user_id GROUP BY u.id ORDER BY total_distance DESC LIMIT 50');
    res.json({ distance_ranking: d.map((u,i) => ({...u, rank: i+1, total_distance: parseFloat(u.total_distance), total_runs: parseInt(u.total_runs)})), runs_ranking: [], pace_ranking: [], user_stats: { total_distance: 0, total_runs: 0, user_rank: 0, total_athletes: 0 } });
});
app.get('/api/ranking/stats', authenticateToken, async (req, res) => {
    const [s] = await pool.execute('SELECT COUNT(DISTINCT user_id) as r, COALESCE(SUM(distance),0) as d, COUNT(*) as c FROM runs');
    res.json({ total_runners: parseInt(s[0]?.r)||0, total_global_distance: parseFloat(s[0]?.d).toFixed(1), total_runs_global: parseInt(s[0]?.c)||0 });
});
app.get('/api/injury/analyze', authenticateToken, async (req, res) => {
    res.json({ risk_level: 'low', risk_score: 20, weekly_volume: 0, weekly_increase: 0, fatigue_index: 0, recommendations: ['Continue com o bom trabalho!'], last_weeks: [] });
});
app.get('/api/injury/alerts', authenticateToken, async (req, res) => {
    const [a] = await pool.execute('SELECT * FROM injury_alerts WHERE user_id = ? AND is_read = 0', [req.user.id]);
    res.json(a);
});
app.put('/api/injury/alerts/:id/read', authenticateToken, async (req, res) => {
    await pool.execute('UPDATE injury_alerts SET is_read = 1 WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
    res.json({ message: 'OK' });
});
app.post('/api/challenges', authenticateToken, async (req, res) => {
    const { opponent_id, title, description, challenge_type, target_value, start_date, end_date } = req.body;
    const [r] = await pool.execute('INSERT INTO challenges (creator_id, opponent_id, title, description, challenge_type, target_value, start_date, end_date, status) VALUES (?,?,?,?,?,?,?,?,"pending")', [req.user.id, opponent_id, title, description, challenge_type, target_value, start_date, end_date]);
    res.json({ id: r.insertId, message: 'Desafio criado!' });
});
app.get('/api/challenges', authenticateToken, async (req, res) => {
    const [c] = await pool.execute('SELECT c.*, u1.name as creator_name, u2.name as opponent_name, CASE WHEN c.creator_id=? THEN true ELSE false END as is_creator FROM challenges c JOIN users u1 ON c.creator_id=u1.id JOIN users u2 ON c.opponent_id=u2.id WHERE c.creator_id=? OR c.opponent_id=? ORDER BY c.created_at DESC', [req.user.id, req.user.id, req.user.id]);
    res.json(c);
});
app.put('/api/challenges/:id/accept', authenticateToken, async (req, res) => {
    await pool.execute('UPDATE challenges SET status="active" WHERE id=? AND opponent_id=?', [req.params.id, req.user.id]);
    res.json({ message: 'Aceito!' });
});
app.put('/api/challenges/:id/decline', authenticateToken, async (req, res) => {
    await pool.execute('UPDATE challenges SET status="cancelled" WHERE id=? AND opponent_id=?', [req.params.id, req.user.id]);
    res.json({ message: 'Recusado' });
});
app.get('/api/equipment/recommendations', authenticateToken, async (req, res) => {
    const [recs] = await pool.execute('SELECT * FROM equipment ORDER BY rating DESC LIMIT 8');
    const [shoes] = await pool.execute('SELECT * FROM equipment WHERE category="shoes" LIMIT 4');
    const [clothing] = await pool.execute('SELECT * FROM equipment WHERE category="clothing" LIMIT 3');
    const [watches] = await pool.execute('SELECT * FROM equipment WHERE category="watch" LIMIT 2');
    const [accessories] = await pool.execute('SELECT * FROM equipment WHERE category="accessories" LIMIT 3');
    res.json({ runner_profile: 'beginner', stats: { totalDistance: 0, totalRuns: 0 }, recommendations: recs.map(r => ({...r, features: r.features ? JSON.parse(r.features) : []})), categories: { shoes, clothing, watches, accessories } });
});
app.get('/api/workout-videos', authenticateToken, async (req, res) => {
    try {
        const { category } = req.query;
        const [subscription] = await pool.execute(
            `SELECT p.features FROM user_subscriptions s
             JOIN subscription_plans p ON s.plan_id = p.id
             WHERE s.user_id = ? AND s.status = 'active'
             ORDER BY s.id DESC LIMIT 1`,
            [req.user.id]
        );
        let hasAllVideos = false;
        if (subscription.length > 0) {
            const planId = subscription[0].plan_id;
            const features = JSON.parse(subscription[0].features);
            hasAllVideos = (planId === 3) ? true : features.all_videos === true;
        }
        let sql = 'SELECT * FROM workout_videos WHERE is_active = 1';
        const params = [];
        if (category && category !== 'all') { sql += ' AND category = ?'; params.push(category); }
        sql += ' ORDER BY order_index ASC';
        if (!hasAllVideos) { sql += ' LIMIT 3'; } 
        const [v] = await pool.execute(sql, params);
        res.json(v.map(video => ({ ...video, locked: false })));
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});
app.get('/api/subscriptions/current', authenticateToken, async (req, res) => {
    const [s] = await pool.execute('SELECT s.*, p.name, p.price, p.features FROM user_subscriptions s JOIN subscription_plans p ON s.plan_id=p.id WHERE s.user_id=? AND s.status="active" ORDER BY s.id DESC LIMIT 1', [req.user.id]);
    if (s.length === 0) {
        const [f] = await pool.execute('SELECT * FROM subscription_plans WHERE price=0 LIMIT 1');
        if (!f.length) return res.status(500).json({ error: 'Free plan not found' });
        await pool.execute(
            'INSERT IGNORE INTO user_subscriptions (user_id, plan_id, status, started_at) VALUES (?, ?, "active", NOW())',
            [req.user.id, f[0].id]
        );
        return res.json({ plan_id: f[0].id, name: f[0].name, price: 0, features: JSON.parse(f[0].features), status: 'active', is_free: true });
    }
    s[0].features = JSON.parse(s[0].features);
    s[0].is_free = s[0].plan_id === 1;
    res.json(s[0]);
});
app.get('/api/subscriptions/plans', authenticateToken, async (req, res) => {
    const [p] = await pool.execute('SELECT * FROM subscription_plans ORDER BY price ASC');
    res.json(p.map(x => ({...x, features: JSON.parse(x.features)})));
});
app.post('/api/subscriptions/activate', authenticateToken, async (req, res) => {
    try {
        const { plan_id } = req.body;
        if (!plan_id) return res.status(400).json({ error: 'plan_id is required' });
        const [plan] = await pool.execute('SELECT * FROM subscription_plans WHERE id = ?', [plan_id]);
        if (!plan.length) return res.status(404).json({ error: 'Plan not found' });
        await pool.execute('UPDATE user_subscriptions SET status = "cancelled" WHERE user_id = ? AND status = "active"', [req.user.id]);
        await pool.execute(
            'INSERT INTO user_subscriptions (user_id, plan_id, status, started_at) VALUES (?, ?, "active", NOW())',
            [req.user.id, plan_id]
        );
        res.json({ message: `Plano ${plan[0].name} ativado com sucesso!`, plan: plan[0] });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});
app.post('/api/subscriptions/create-preference', authenticateToken, async (req, res) => {
    res.json({ preferenceId: `pref_${Date.now()}`, init_point: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/checkout/${req.body.plan_id}` });
});
app.post('/api/subscriptions/cancel', authenticateToken, async (req, res) => {
    await pool.execute('UPDATE user_subscriptions SET status="cancelled" WHERE user_id=? AND status="active"', [req.user.id]);
    res.json({ message: 'Cancelada' });
});
app.post('/api/notifications/subscribe', authenticateToken, async (req, res) => {
    const { subscription } = req.body;
    await pool.execute('INSERT INTO push_subscriptions (user_id, subscription_endpoint, subscription_keys) VALUES (?,?,?) ON DUPLICATE KEY UPDATE subscription_endpoint=?, subscription_keys=?', [req.user.id, subscription.endpoint, JSON.stringify(subscription.keys), subscription.endpoint, JSON.stringify(subscription.keys)]);
    res.json({ message: 'OK' });
});
app.post('/api/notifications/unsubscribe', authenticateToken, async (req, res) => {
    await pool.execute('DELETE FROM push_subscriptions WHERE user_id=? AND subscription_endpoint=?', [req.user.id, req.body.endpoint]);
    res.json({ message: 'OK' });
});
async function checkAchievements(userId) {
    try {
        const [stats] = await pool.execute('SELECT COALESCE(total_distance,0) as d, COALESCE(total_runs,0) as r FROM users WHERE id=?', [userId]);
        const [achievements] = await pool.execute('SELECT * FROM achievements');
        for (const a of achievements) {
            const [earned] = await pool.execute('SELECT id FROM user_achievements WHERE user_id=? AND achievement_id=?', [userId, a.id]);
            if (earned.length > 0) continue;
            let earned_it = false;
            if (a.required_runs && stats[0].r >= a.required_runs) earned_it = true;
            if (a.required_distance && stats[0].d >= a.required_distance) earned_it = true;
            if (earned_it) {
                await pool.execute('INSERT INTO user_achievements (user_id, achievement_id) VALUES (?,?)', [userId, a.id]);
                sendNotification(userId, { type: 'achievement', title: '🏆 Nova Conquista!', message: `Você desbloqueou: ${a.name}`, icon: a.icon || '🏅' });
            }
        }
    } catch (error) { console.error('Error checking achievements:', error); }
}
const PORT = process.env.PORT || 5000;
if (require.main === module) {
    server.listen(PORT, () => {
        console.log(`\n🚀 Server running on http://localhost:${PORT}`);
        console.log(`📍 API: http://localhost:${PORT}/api`);
        console.log(`🔌 Socket.io ready`);
        console.log(`📱 Push notifications ready\n`);
    });
}
module.exports = { app, server, pool };