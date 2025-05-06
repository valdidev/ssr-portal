const express = require('express');
const { Pool } = require('pg');
const dotenv = require('dotenv');
const app = express();
const port = 3000;

// Cargar variables de entorno desde .env
dotenv.config();

// Configuración de la conexión a PostgreSQL
const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

// Configuración de Express
app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// Ruta principal: Listar tareas
app.get('/', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM tasks ORDER BY id ASC');
        res.render('index', { tasks: result.rows });
    } catch (err) {
        console.error(err);
        res.status(500).send('Error en el servidor');
    }
});

// Ruta para mostrar formulario de nueva tarea
app.get('/add', (req, res) => {
    res.render('add-task');
});

// Ruta para añadir una nueva tarea
app.post('/add', async (req, res) => {
    const { title, description } = req.body;
    try {
        await pool.query('INSERT INTO tasks (title, description) VALUES ($1, $2)', [title, description]);
        res.redirect('/');
    } catch (err) {
        console.error(err);
        res.status(500).send('Error al añadir la tarea');
    }
});

// Ruta para eliminar una tarea
app.post('/delete/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await pool.query('DELETE FROM tasks WHERE id = $1', [id]);
        res.redirect('/');
    } catch (err) {
        console.error(err);
        res.status(500).send('Error al eliminar la tarea');
    }
});

// Iniciar el servidor
app.listen(port, () => {
    console.log(`Servidor corriendo en http://localhost:${port}`);
});