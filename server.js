const express = require('express');
const dotenv = require('dotenv');
const taskRoutes = require('./routes/taskRoutes');
const userRoutes = require('./routes/userRoutes');
const app = express();
const port = 3000;

// Cargar variables de entorno desde .env
dotenv.config();

// Configuración de Express
app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// Cargar rutas
app.use('/', taskRoutes);
app.use('/', userRoutes);

// Iniciar el servidor
app.listen(port, () => {
    console.log(`Servidor corriendo en http://localhost:${port}`);
});