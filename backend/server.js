const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json()); // Para processar body em JSON (Login)
app.use(express.urlencoded({ extended: true })); // Para processar URL-encoded (se necessário)

// Tornar a pasta uploads acessível publicamente
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Rotas
const produtosRoutes = require('./routes/produtos');
const usuariosRoutes = require('./routes/usuarios');

app.use('/produtos', produtosRoutes);
app.use('/usuarios', usuariosRoutes);

const PORT = 3000;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));