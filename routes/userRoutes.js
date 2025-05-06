const express = require('express');
const router = express.Router();
const pool = require('../config/db');

// Ruta para listar usuarios
router.get('/users', async (req, res) => {
    try {
        const [tasks] = await pool.query(`
      SELECT t.*, COUNT(ut.user_id) as assignee_count
      FROM tasks t
      LEFT JOIN user_tasks ut ON t.id = ut.task_id
      GROUP BY t.id
      ORDER BY t.priority ASC, t.id ASC
    `);
        const [users] = await pool.query('SELECT * FROM users ORDER BY name ASC');
        res.render('index', { tasks, users, activeTab: 'users' });
    } catch (err) {
        console.error('Error en la consulta:', err);
        res.status(500).send('Error en el servidor');
    }
});

// Ruta para mostrar formulario de nuevo usuario
router.get('/add-user', (req, res) => {
    res.render('add-user');
});

// Ruta para añadir un nuevo usuario
router.post('/add-user', async (req, res) => {
    const { name, email } = req.body;
    try {
        await pool.query('INSERT INTO users (name, email) VALUES (?, ?)', [name, email]);
        res.redirect('/users');
    } catch (err) {
        console.error('Error al añadir usuario:', err);
        res.status(500).send('Error al añadir el usuario');
    }
});

// Ruta para mostrar formulario de edición de usuario
router.get('/edit-user/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const [users] = await pool.query('SELECT * FROM users WHERE id = ?', [id]);
        if (users.length === 0) {
            return res.status(404).send('Usuario no encontrado');
        }
        res.render('edit-user', { user: users[0] });
    } catch (err) {
        console.error('Error al obtener usuario:', err);
        res.status(500).send('Error en el servidor');
    }
});

// Ruta para actualizar un usuario
router.post('/edit-user/:id', async (req, res) => {
    const { id } = req.params;
    const { name, email } = req.body;
    try {
        await pool.query('UPDATE users SET name = ?, email = ? WHERE id = ?', [name, email, id]);
        res.redirect('/users');
    } catch (err) {
        console.error('Error al actualizar usuario:', err);
        res.status(500).send('Error al actualizar el usuario');
    }
});

// Ruta para eliminar un usuario
router.post('/delete-user/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await pool.query('DELETE FROM users WHERE id = ?', [id]);
        res.redirect('/users');
    } catch (err) {
        console.error('Error al eliminar usuario:', err);
        res.status(500).send('Error al eliminar el usuario');
    }
});

module.exports = router;