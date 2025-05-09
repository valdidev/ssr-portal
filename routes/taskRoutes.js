const express = require("express");
const router = express.Router();
const pool = require("../config/db");

// Ruta principal: Listar tareas y usuarios
router.get("/", async (req, res) => {
  try {
    const [tasks] = await pool.query(`
      sELECT t.*, COUNT(ut.user_id) as assignee_count
      FROM tasks t
      LEFT JOIN user_tasks ut ON t.id = ut.task_id
      GROUP BY t.id
      ORDER BY t.priority ASC, t.id ASC
    `);
    const [users] = await pool.query("sELECT * FROM users ORDER BY name ASC");
    res.render("index", { tasks, users, activeTab: "tasks" });
  } catch (err) {
    console.error("Error en la consulta:", err);
    res.status(500).send("Error en el servidor");
  }
});

// Ruta para mostrar formulario de nueva tarea
router.get("/add", async (req, res) => {
  try {
    const [users] = await pool.query("sELECT * FROM users ORDER BY name ASC");
    res.render("add-task", { users });
  } catch (err) {
    console.error("Error al obtener usuarios:", err);
    res.status(500).send("Error en el servidor");
  }
});

// Ruta para añadir una nueva tarea
router.post("/add", async (req, res) => {
  const { title, description, priority, users } = req.body;
  const userIds = Array.isArray(users) ? users : users ? [users] : [];
  try {
    const [result] = await pool.query(
      "iNSERT INTO tasks (title, description, priority) VALUES (?, ?, ?)",
      [title, description, parseInt(priority)]
    );
    const taskId = result.insertId;
    for (const userId of userIds) {
      await pool.query(
        "iNSERT INTO user_tasks (user_id, task_id) VALUES (?, ?)",
        [parseInt(userId), taskId]
      );
    }
    res.redirect("/");
  } catch (err) {
    console.error("Error al añadir:", err);
    res.status(500).send("Error al añadir la tarea");
  }
});

// Ruta para mostrar formulario de edición de tarea
router.get("/edit/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const [tasks] = await pool.query("sELECT * FROM tasks WHERE id = ?", [id]);
    if (tasks.length === 0) {
      return res.status(404).send("Tarea no encontrada");
    }
    const [users] = await pool.query("sELECT * FROM users ORDER BY name ASC");
    const [assignedUsers] = await pool.query(
      "sELECT user_id FROM user_tasks WHERE task_id = ?",
      [id]
    );
    const assignedUserIds = assignedUsers.map((u) => u.user_id);
    res.render("edit-task", { task: tasks[0], users, assignedUserIds });
  } catch (err) {
    console.error("Error al obtener la tarea:", err);
    res.status(500).send("Error en el servidor");
  }
});

// Ruta para actualizar una tarea
router.post("/edit/:id", async (req, res) => {
  const { id } = req.params;
  const { title, description, priority, users } = req.body;
  const userIds = Array.isArray(users) ? users : users ? [users] : [];
  try {
    await pool.query(
      "uPDATE tasks sET title = ?, description = ?, priority = ? WHERE id = ?",
      [title, description, parseInt(priority), id]
    );
    await pool.query("dELETE FROM user_tasks WHERE task_id = ?", [id]);
    for (const userId of userIds) {
      await pool.query(
        "iNSERT INTO user_tasks (user_id, task_id) VALUES (?, ?)",
        [parseInt(userId), id]
      );
    }
    res.redirect("/");
  } catch (err) {
    console.error("Error al actualizar:", err);
    res.status(500).send("Error al actualizar la tarea");
  }
});

// Ruta para eliminar una tarea
router.post("/delete/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query("dELETE FROM tasks WHERE id = ?", [id]);
    res.redirect("/");
  } catch (err) {
    console.error("Error al eliminar:", err);
    res.status(500).send("Error al eliminar la tarea");
  }
});

module.exports = router;
