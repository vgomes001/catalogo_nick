const connection = require("../database");
const jwt = require("jsonwebtoken");
const { SECRET } = require("../middleware/auth");
const bcrypt = require("bcrypt"); // ⬅️ IMPORTADO

// LOGIN
exports.login = (req, res) => {
    const { email, senha } = req.body;

    // 1. Busca usuário apenas pelo email
    connection.query(
        "SELECT * FROM usuarios WHERE email = ?",
        [email],
        (err, results) => {
            if (err) return res.status(500).json(err);
            
            if (results.length === 0)
                // Retorna 400 se o email não for encontrado
                return res.status(400).json({ message: "Email ou senha inválidos" });

            const user = results[0];
            const hash = user.senha; 

            // 2. Compara a senha fornecida com o hash armazenado
            bcrypt.compare(senha, hash, (bcryptErr, result) => {
                if (bcryptErr) return res.status(500).json({ message: "Erro de servidor." });
                
                if (!result) {
                    // Senha incorreta
                    return res.status(400).json({ message: "Email ou senha inválidos" });
                }

                // 3. Senha correta: Gera o Token
                const token = jwt.sign(
                    { id: user.id, tipo: user.tipo },
                    SECRET,
                    { expiresIn: "1h" }
                );

                res.json({ token, nome: user.nome, tipo: user.tipo });
            });
        }
    );
};

// ⚠️ FUNÇÃO OPCIONAL E NECESSÁRIA PARA INSERIR USUÁRIOS COM HASH
// Esta função deve ser usada para o setup inicial de um usuário admin no BD.
exports.registrarAdmin = (req, res) => {
    const { nome, email, senha } = req.body;
    const tipo = "admin";
    const saltRounds = 10; // Custo do hash (quanto maior, mais seguro e lento)

    // 1. Gerar o hash da senha
    bcrypt.hash(senha, saltRounds, (err, hash) => {
        if (err) {
            console.error("Erro ao gerar hash:", err);
            return res.status(500).json({ message: "Erro ao registrar usuário." });
        }

        // 2. Salvar o hash no BD
        connection.query(
            "INSERT INTO usuarios (nome, email, senha, tipo) VALUES (?, ?, ?, ?)",
            [nome, email, hash, tipo],
            (dbErr, results) => {
                if (dbErr) return res.status(500).json({ message: "Erro ao salvar no BD.", error: dbErr });
                res.status(201).json({ message: "Admin registrado com sucesso!", id: results.insertId });
            }
        );
    });
};