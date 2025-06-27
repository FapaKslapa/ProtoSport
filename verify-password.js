const bcrypt = require('bcryptjs');

const password = 'admin';

const currentHash = '$2a$10$UbJj69iz0aPRY5dq3ftMyeTONLpV0z.wYJkoGA/XjmMvCmRqsYFhO';

bcrypt.compare(password, currentHash).then(isValid => {
    console.log(`L'hash attuale ${isValid ? 'è valido' : 'NON è valido'} per la password "${password}"`);
});

bcrypt.hash(password, 10).then(newHash => {
    console.log('\nNuovo hash generato:');
    console.log(newHash);
    console.log('\nPuoi usare questo hash nel file db.ts:');
    console.log(`INSERT INTO users (nome, cognome, telefono, is_admin, is_super_admin, password)
                 VALUES ('Admin', 'Admin', 'admin', 1, 1, '${newHash}');`);
});