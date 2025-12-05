const connection = require("../database");
const fs = require('fs'); // ⬅️ MÓDULO FS PARA DELETAR ARQUIVOS

// LISTAR PRODUTOS (Sem alterações)
exports.listarProdutos = (req, res) => {
    let sql = "SELECT * FROM produtos";
    const params = [];

    if (req.query.categoria) {
        sql += " WHERE categoria = ?";
        params.push(req.query.categoria);
    }

    connection.query(sql, params, (err, results) => {
        if (err) return res.status(500).json(err);
        res.json(results);
    });
};

// ADICIONAR PRODUTO (somente admin)
exports.adicionarProduto = (req, res) => {
    if (req.user.tipo !== "admin") {
        // Se houver arquivo, deleta antes de retornar erro de autorização
        if (req.file) fs.unlinkSync(req.file.path); 
        return res.status(403).json({ message: "Não autorizado" });
    }

    const { nome, descricao, preco, categoria } = req.body;
    // req.file.filename é o nome gerado pelo multer (usado no diskStorage)
    const imagem = req.file ? req.file.filename : null; 

    if (!nome || !preco) {
        // Se houver arquivo, deleta antes de retornar erro de dados incompletos
        if (req.file) fs.unlinkSync(req.file.path);
        return res.status(400).json({ message: "Nome e preço são obrigatórios" });
    }

    connection.query(
        "INSERT INTO produtos (nome, descricao, preco, categoria, imagem) VALUES (?, ?, ?, ?, ?)",
        [nome, descricao, preco, categoria, imagem],
        (err, results) => {
            if (err) return res.status(500).json(err);
            res.json({ message: "Produto adicionado!", id: results.insertId });
        }
    );
};

// rota
router.put("/:id", authMiddleware, upload.single('imagem'), produtosController.editarProduto);

// controller
exports.editarProduto = (req, res) => {
    if (req.user.tipo !== "admin") return res.status(403).json({ message: "Não autorizado" });

    const { id } = req.params;
    const { nome, descricao, preco, categoria } = req.body;
    const novaImagem = req.file ? req.file.filename : null;

    // Pega imagem antiga
    connection.query("SELECT imagem FROM produtos WHERE id = ?", [id], (err, results) => {
        if (err) return res.status(500).json(err);
        if (results.length === 0) return res.status(404).json({ message: "Produto não encontrado" });

        const imagemAntiga = results[0].imagem;

        const sql = "UPDATE produtos SET nome=?, descricao=?, preco=?, categoria=?, imagem=? WHERE id=?";
        const params = [nome, descricao, preco, categoria, novaImagem || imagemAntiga, id];

        connection.query(sql, params, (err2) => {
            if (err2) return res.status(500).json(err2);

            // Se houver nova imagem, deletar a antiga
            if (novaImagem && imagemAntiga) fs.unlink(`uploads/${imagemAntiga}`, (unlinkErr) => {
                if (unlinkErr) console.error("Erro ao deletar imagem antiga:", unlinkErr);
            });

            res.json({ message: "Produto atualizado com sucesso!" });
        });
    });
};

// REMOVER PRODUTO (somente admin)
exports.removerProduto = (req, res) => {
    if (req.user.tipo !== "admin")
        return res.status(403).json({ message: "Não autorizado" });

    const { id } = req.params;

    // 1. Obter o nome do arquivo da imagem
    connection.query("SELECT imagem FROM produtos WHERE id = ?", [id], (err, results) => {
        if (err) return res.status(500).json(err);
        if (results.length === 0)
            return res.status(404).json({ message: "Produto não encontrado" });

        const imagem = results[0].imagem;

        // 2. Deletar o registro do BD
        connection.query("DELETE FROM produtos WHERE id = ?", [id], (err, results) => {
            if (err) return res.status(500).json(err);
            
            // 3. Deletar o arquivo físico
            if (imagem) {
                fs.unlink(`uploads/${imagem}`, (unlinkErr) => {
                    if (unlinkErr) console.error("Aviso: Não foi possível deletar o arquivo.", unlinkErr);
                    // Continua mesmo se falhar em deletar o arquivo
                });
            }

            res.json({ message: "Produto removido!" });
        });
    });
};