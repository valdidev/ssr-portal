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

// Ruta principal: Listar tareas
app.get('/', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM tasks ORDER BY id ASC');
        res.render('index', { tasks: rows });
    } catch (err) {
        console.error('Error en la consulta:', err);
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
        await pool.query('INSERT INTO tasks (title, description) VALUES (?, ?)', [title, description]);
        res.redirect('/');
    } catch (err) {
        console.error('Error al añadir:', err);
        res.status(500).send('Error al añadir la tarea');
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

// Iniciar el servidor
app.listen(port, () => {
    console.log(`Servidor corriendo en http://localhost:${port}`);
});