const express = require("express");
const router = express.Router();
const usuariosController = require("../controllers/usuariosController");

// POST /usuarios/login - Autenticação
router.post("/login", usuariosController.login);

// *OPCIONAL: Rota para criar um usuário admin (para fins de setup)
// router.post("/registrar-admin", usuariosController.registrarAdmin);

module.exports = router;