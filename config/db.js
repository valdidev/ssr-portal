const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

// Cargar variables de entorno
dotenv.config();

// Configuración de la conexión a MySQL
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Probar la conexión al iniciar
(async () => {
  try {
    const connection = await pool.getConnection();
    console.log('Conexión a MySQL exitosa');
    connection.release();
  } catch (err) {
    console.error('Error al conectar a MySQL:', err.message);
    console.error('Detalles de la configuración:', {
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      database: process.env.DB_NAME,
      port: process.env.DB_PORT
    });
  }
})();

module.exports = pool;