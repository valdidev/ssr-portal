# Gestión de Tareas y Usuarios

Una aplicación web de renderizado en servidor (SSR) para gestionar tareas y usuarios, construida con **Node.js**, **Express**, **MySQL**, y **EJS**. Permite crear, editar, eliminar y asignar tareas a usuarios, con una interfaz responsiva que incluye cambio de temas (claro/oscuro) y pestañas para "Lista de Tareas" y "Gestión de Usuarios".

## Características
- **Gestión de tareas**: Añade, edita, elimina tareas con título, descripción, prioridad y asignación de usuarios.
- **Gestión de usuarios**: Crea, edita y elimina usuarios con nombre y correo electrónico.
- **Asignaciones**: Asocia múltiples usuarios a una tarea mediante una relación muchos-a-muchos.
- **Interfaz intuitiva**:
  - Pestañas para alternar entre "Lista de Tareas" y "Gestión de Usuarios".
  - Tarjetas de tareas que muestran prioridad y número de personas asignadas.
  - Botón de cambio de tema (claro/oscuro) fijo en la esquina superior derecha.
  - Título centrado y modal de confirmación para eliminaciones.
- **Persistencia**: Almacena datos en una base de datos MySQL (`task_db`).
- **Modularidad**: Código organizado en rutas separadas (`taskRoutes.js`, `userRoutes.js`) y configuración de base de datos (`db.js`).

## Tecnologías
- **Backend**: Node.js, Express
- **Base de datos**: MySQL
- **Frontend**: EJS, CSS (temas claro/oscuro)
- **Dependencias**: `express`, `mysql2`, `dotenv`
- **Entorno**: XAMPP (para desarrollo local)

## Estructura del proyecto
```
ssr-portal/
├── config/
│   └── db.js                # Configuración de la conexión a MySQL
├── routes/
│   ├── taskRoutes.js        # Rutas para tareas (/, /add, /edit, /delete)
│   └── userRoutes.js        # Rutas para usuarios (/users, /add-user, /edit-user, /delete-user)
├── views/
│   ├── index.ejs            # Página principal con pestañas de tareas y usuarios
│   ├── add-task.ejs         # Formulario para añadir tareas
│   ├── edit-task.ejs        # Formulario para editar tareas
│   ├── add-user.ejs         # Formulario para añadir usuarios
│   └── edit-user.ejs        # Formulario para editar usuarios
├── public/
│   └── styles.css           # Estilos para temas claro y oscuro
├── .env                     # Variables de entorno (credenciales de DB)
├── db.sql                   # Esquema de la base de datos
├── package.json             # Dependencias y scripts
├── README.md                # Documentación del proyecto
└── server.js                # Punto de entrada de la aplicación
```

## Requisitos previos
- **Node.js** (v16 o superior)
- **XAMPP** (con MySQL activado)
- **MySQL** (puerto por defecto: 3306)
- **Navegador web** (Chrome, Firefox, etc.)

## Instalación
1. **Clona o extrae el proyecto**:
   ```bash
   cd C:\xampp3\htdocs
   git clone <repositorio> ssr-portal
   ```
   O copia los archivos a `C:\xampp3\htdocs\ssr-portal`.

2. **Instala las dependencias**:
   ```bash
   cd C:\xampp3\htdocs\ssr-portal
   npm install
   ```

3. **Configura la base de datos**:
   - Inicia XAMPP y activa el módulo **MySQL**.
   - Abre `http://localhost/phpmyadmin` y crea la base de datos:
     ```sql
     CREATE DATABASE task_db;
     ```
   - Ejecuta el contenido de `db.sql` para crear las tablas:
     ```sql
     USE task_db;
     CREATE TABLE tasks (
       id INT AUTO_INCREMENT PRIMARY KEY,
       title VARCHAR(255) NOT NULL,
       description TEXT,
       priority INT NOT NULL
     );
     CREATE TABLE users (
       id INT AUTO_INCREMENT PRIMARY KEY,
       name VARCHAR(255) NOT NULL,
       email VARCHAR(255) NOT NULL
     );
     CREATE TABLE user_tasks (
       user_id INT,
       task_id INT,
       FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
       FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
       PRIMARY KEY (user_id, task_id)
     );
     ```

4. **Configura las variables de entorno**:
   - Crea o edita `.env` en la raíz del proyecto:
     ```env
     DB_HOST=localhost
     DB_USER=root
     DB_PASSWORD=
     DB_NAME=task_db
     DB_PORT=3306
     ```
   - Si usas una contraseña para `root` o un puerto diferente, actualiza `DB_PASSWORD` o `DB_PORT`.

5. **Inicia el servidor**:
   ```bash
   node server.js
   ```
   Deberías ver:
   ```
   Conexión a MySQL exitosa
   Servidor corriendo en http://localhost:3000
   ```

6. **Accede a la aplicación**:
   - Abre `http://localhost:3000` en tu navegador.

## Uso
- **Lista de Tareas**:
  - Visualiza tareas ordenadas por prioridad.
  - Cada tarjeta muestra el título, descripción, prioridad, y número de personas asignadas.
  - Añade tareas en `/add`, edítalas en `/edit/:id`, o elimínalas con el modal de confirmación.
- **Gestión de Usuarios**:
  - Ve a `/users` para listar usuarios.
  - Añade usuarios en `/add-user`, edítalos en `/edit-user/:id`, o elimínalos.
- **Interfaz**:
  - Usa el botón en la esquina superior derecha para cambiar entre temas claro y oscuro.
  - Alterna entre pestañas "Lista de Tareas" y "Gestión de Usuarios".
  - Los formularios admiten envío con la tecla Enter.

## Solución de problemas
- **Error: connect ETIMEDOUT**:
  - **Causa**: MySQL no está corriendo o la configuración en `.env` es incorrecta.
  - **Solución**:
    1. Inicia MySQL en el panel de control de XAMPP.
    2. Verifica `.env`:
       ```env
       DB_HOST=localhost
       DB_USER=root
       DB_PASSWORD=
       DB_NAME=task_db
       DB_PORT=3306
       ```
    3. Confirma que `task_db` existe en phpMyAdmin (`http://localhost/phpmyadmin`).
    4. Prueba la conexión manualmente:
       ```bash
       mysql -u root -p
       ```
    5. Revisa el puerto 3306:
       ```bash
       netstat -aon | findstr :3306
       ```
       Si está ocupado, ajusta `DB_PORT` en `.env`.
- **Página no carga o muestra "Error en el servidor"**:
  - Revisa los logs en la consola (`node server.js`) para errores de conexión o consultas.
  - Confirma que las tablas `tasks`, `users`, y `user_tasks` están creadas.
- **Estilos no se aplican**:
  - Limpia la caché del navegador (Ctrl+Shift+R).
  - Verifica que `public/styles.css` se carga (F12, pestaña Network).
- **Funcionalidad rota**:
  - Asegúrate de que todos los archivos (`server.js`, `config/db.js`, `routes/*.js`, `views/*.ejs`) están en su lugar.
  - Reinstala dependencias: `npm install`.

## Contribución
1. Crea un fork del repositorio.
2. Realiza tus cambios en una rama nueva:
   ```bash
   git checkout -b feature/nueva-funcionalidad
   ```
3. Commitea y sube los cambios:
   ```bash
   git commit -m "Añade nueva funcionalidad"
   git push origin feature/nueva-funcionalidad
   ```
4. Crea un Pull Request con una descripción clara.

## Mejoras futuras
- **Validaciones**: Restringir emails únicos y prioridades válidas.
- **Mensajes de éxito**: Mostrar alertas tras acciones (añadir, editar, eliminar).
- **Filtrado**: Mostrar tareas por usuario o prioridad.
- **Autenticación**: Añadir login para restringir acceso.
- **Despliegue**: Configurar para SiteGround u otros servicios de hosting.

## Licencia
Este proyecto está bajo la [Licencia MIT](LICENSE). Siéntete libre de usarlo y modificarlo según tus necesidades.

## Contacto
Para preguntas o sugerencias, contacta a iamvaldidev@gmail.com o abre un issue en el repositorio.