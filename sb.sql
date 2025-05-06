-- Crear la base de datos
CREATE DATABASE task_db;

-- Conectar a la base de datos
\c task_db;

-- Crear la tabla de tareas
CREATE TABLE tasks (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);