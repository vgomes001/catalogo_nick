const bcrypt = require('bcryptjs');

const senha = '123456'; // senha que você quer usar
const senhaHash = bcrypt.hashSync(senha, 10);

console.log('Hash gerado:', senhaHash);
