const jwt = require("jsonwebtoken");
const SECRET = "segredo123"; // **IMPORTANTE: USE UMA CHAVE SECRETA MAIS COMPLEXA EM PRODUÇÃO**

module.exports = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader)
        return res.status(401).json({ message: "Token não fornecido" });

    const parts = authHeader.split(" ");
    if (parts.length !== 2 || parts[0] !== "Bearer")
        return res.status(401).json({ message: "Formato do token inválido" });

    const token = parts[1];

    try {
        const decoded = jwt.verify(token, SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        console.error("Erro JWT:", err.message);
        return res.status(401).json({ message: "Token inválido ou expirado" });
    }
};

module.exports.SECRET = SECRET;