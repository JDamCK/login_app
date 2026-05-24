require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const pool = require('./db');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

function generateToken(userId) {
    return 'token-' + userId + '-' + Date.now();
}

function authMiddleware(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ success: false, message: 'Token requerido' });
    }
    const token = authHeader.split(' ')[1];
    const parts = token.split('-');
    if (parts.length < 2 || parts[0] !== 'token') {
        return res.status(401).json({ success: false, message: 'Token inválido' });
    }
    req.userId = parseInt(parts[1]);
    next();
}

app.post('/api/auth/register', async (req, res) => {
    const { username, email, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ success: false, message: 'Usuario y contraseña requeridos' });
    }
    try {
        const existing = await pool.query('SELECT id FROM users WHERE username = $1', [username]);
        if (existing.rows.length > 0) {
            return res.status(400).json({ success: false, message: 'El usuario ya existe' });
        }
        const hash = await bcrypt.hash(password, 10);
        const result = await pool.query(
            'INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING id, username, created_at',
            [username, email || null, hash]
        );
        res.json({ success: true, message: 'Cuenta creada con éxito', user: result.rows[0] });
    } catch (err) {
        console.error('Error en register:', err);
        res.status(500).json({ success: false, message: 'Error interno del servidor' });
    }
});

app.post('/api/auth/login', async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ success: false, message: 'Credenciales requeridas' });
    }
    try {
        const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
        if (result.rows.length === 0) {
            return res.status(401).json({ success: false, message: 'Usuario no encontrado' });
        }
        const user = result.rows[0];
        const match = await bcrypt.compare(password, user.password);
        if (!match) {
            return res.status(401).json({ success: false, message: 'Contraseña incorrecta' });
        }
        const token = generateToken(user.id);
        res.json({
            success: true,
            message: 'Inicio de sesión exitoso',
            token,
            user: { id: user.id, username: user.username, email: user.email }
        });
    } catch (err) {
        console.error('Error en login:', err);
        res.status(500).json({ success: false, message: 'Error interno del servidor' });
    }
});

app.get('/api/auth/me', authMiddleware, async (req, res) => {
    try {
        const result = await pool.query('SELECT id, username, email, created_at FROM users WHERE id = $1', [req.userId]);
        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
        }
        res.json({ success: true, user: result.rows[0] });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Error interno del servidor' });
    }
});

app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
