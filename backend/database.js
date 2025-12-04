const mysql = require('mysql2');

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',       // troque pelo seu usuário MySQL
    password: 'root',     // troque pela sua senha
    database: 'catalogo'       // nome do banco que você criou
});

connection.connect((err) => {
    if (err) throw err;
    console.log('Banco de dados conectado!');
});

module.exports = connection;
