const express = require("express");
const router = express.Router();
const produtosController = require("../controllers/produtosController");
const authMiddleware = require("../middleware/auth");
const multer = require("multer"); 

// Configuração do Multer para destino e nome do arquivo
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // Garanta que a pasta 'uploads' exista
    },
    filename: (req, file, cb) => {
        // Renomeia o arquivo para evitar conflitos (ex: nomeoriginal-timestamp.ext)
        cb(null, Date.now() + '-' + file.originalname);
    }
});
const upload = multer({ storage: storage });

// GET /produtos - Listar produtos (Público)
router.get("/", produtosController.listarProdutos);

// POST /produtos - Adicionar produto (Protegido e com Upload)
router.post(
    "/", 
    authMiddleware, 
    upload.single('imagem'), // ⬅️ MIDDLEWARE DE UPLOAD
    produtosController.adicionarProduto
);

// DELETE /produtos/:id - Remover produto (Protegido)
router.delete("/:id", authMiddleware, produtosController.removerProduto);

module.exports = router;