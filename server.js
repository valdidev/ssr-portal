const express = require('express');
const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
const app = express();
const port = 3000;

// Cargar variables de entorno desde .env
dotenv.config();

// Configuración de la conexión a MySQL
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

// Probar la conexión al iniciar
(async () => {
    try {
        const connection = await pool.getConnection();
        console.log('Conexión a MySQL exitosa');
        connection.release();
    } catch (err) {
        console.error('Error al conectar a MySQL:', err);
    }
})();

// Configuración de Express
app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// Ruta principal: Listar tareas y usuarios
app.get('/', async (req, res) => {
    try {
        const [tasks] = await pool.query(`
      SELECT t.*, COUNT(ut.user_id) as assignee_count
      FROM tasks t
      LEFT JOIN user_tasks ut ON t.id = ut.task_id
      GROUP BY t.id
      ORDER BY t.priority ASC, t.id ASC
    `);
        const [users] = await pool.query('SELECT * FROM users ORDER BY name ASC');
        res.render('index', { tasks, users, activeTab: 'tasks' });
    } catch (err) {
        console.error('Error en la consulta:', err);
        res.status(500).send('Error en el servidor');
    }
});

// Ruta para listar usuarios
app.get('/users', async (req, res) => {
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

// Ruta para mostrar formulario de nueva tarea
app.get('/add', async (req, res) => {
    try {
        const [users] = await pool.query('SELECT * FROM users ORDER BY name ASC');
        res.render('add-task', { users });
    } catch (err) {
        console.error('Error al obtener usuarios:', err);
        res.status(500).send('Error en el servidor');
    }
});

// Ruta para añadir una nueva tarea
app.post('/add', async (req, res) => {
    const { title, description, priority, users } = req.body;
    const userIds = Array.isArray(users) ? users : users ? [users] : [];
    try {
        const [result] = await pool.query('INSERT INTO tasks (title, description, priority) VALUES (?, ?, ?)', [title, description, parseInt(priority)]);
        const taskId = result.insertId;
        for (const userId of userIds) {
            await pool.query('INSERT INTO user_tasks (user_id, task_id) VALUES (?, ?)', [parseInt(userId), taskId]);
        }
        res.redirect('/');
    } catch (err) {
        console.error('Error al añadir:', err);
        res.status(500).send('Error al añadir la tarea');
    }
});

// Ruta para mostrar formulario de edición de tarea
app.get('/edit/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const [tasks] = await pool.query('SELECT * FROM tasks WHERE id = ?', [id]);
        if (tasks.length === 0) {
            return res.status(404).send('Tarea no encontrada');
        }
        const [users] = await pool.query('SELECT * FROM users ORDER BY name ASC');
        const [assignedUsers] = await pool.query('SELECT user_id FROM user_tasks WHERE task_id = ?', [id]);
        const assignedUserIds = assignedUsers.map(u => u.user_id);
        res.render('edit-task', { task: tasks[0], users, assignedUserIds });
    } catch (err) {
        console.error('Error al obtener la tarea:', err);
        res.status(500).send('Error en el servidor');
    }
});

// Ruta para actualizar una tarea
app.post('/edit/:id', async (req, res) => {
    const { id } = req.params;
    const { title, description, priority, users } = req.body;
    const userIds = Array.isArray(users) ? users : users ? [users] : [];
    try {
        await pool.query('UPDATE tasks SET title = ?, description = ?, priority = ? WHERE id = ?', [title, description, parseInt(priority), id]);
        await pool.query('DELETE FROM user_tasks WHERE task_id = ?', [id]);
        for (const userId of userIds) {
            await pool.query('INSERT INTO user_tasks (user_id, task_id) VALUES (?, ?)', [parseInt(userId), id]);
        }
        res.redirect('/');
    } catch (err) {
        console.error('Error al actualizar:', err);
        res.status(500).send('Error al actualizar la tarea');
    }
});

// Ruta para eliminar una tarea
app.post('/delete/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await pool.query('DELETE FROM tasks WHERE id = ?', [id]);
        res.redirect('/');
    } catch (err) {
        console.error('Error al eliminar:', err);
        res.status(500).send('Error al eliminar la tarea');
    }
});

// Ruta para mostrar formulario de nuevo usuario
app.get('/add-user', (req, res) => {
    res.render('add-user');
});

// Ruta para añadir un nuevo usuario
app.post('/add-user', async (req, res) => {
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
app.get('/edit-user/:id', async (req, res) => {
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
app.post('/edit-user/:id', async (req, res) => {
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
app.post('/delete-user/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await pool.query('DELETE FROM users WHERE id = ?', [id]);
        res.redirect('/users');
    } catch (err) {
        console.error('Error al eliminar usuario:', err);
        res.status(500).send('Error al eliminar el usuario');
    }
});

// Iniciar el servidor
app.listen(port, () => {
    console.log(`Servidor corriendo en http://localhost:${port}`);
});