const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const dbPath = path.join(__dirname, 'db.json');

const firstNames = ['Ana', 'Bruno', 'Carlos', 'Daniela', 'Eduardo', 'Fernanda', 'Gabriel', 'Helena', 'Igor', 'Julia'];
const lastNames = ['Silva', 'Santos', 'Oliveira', 'Souza', 'Rodrigues', 'Ferreira', 'Alves', 'Pereira', 'Lima', 'Gomes'];
const roles = ['Visualizador', 'Editor'];

function seed() {
  if (!fs.existsSync(dbPath)) return;
  
  const db = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
  
  // Limpar os fakes antigos caso existam (opcional) ou apenas adicionar novos.
  // Vamos manter o Admin e limpar o resto
  db.users = db.users.filter(u => u.email === 'gustavo.koglin@teste.com');

  for (let i = 1; i <= 90; i++) {
    const fName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lName = lastNames[Math.floor(Math.random() * lastNames.length)];
    const name = `${fName} ${lName}`;
    const email = `${fName.toLowerCase()}.${lName.toLowerCase()}${i}@teste.com`;
    const cpf = `000.000.000-${i.toString().padStart(2, '0')}`;
    const phone = `1199999${i.toString().padStart(4, '0')}`;
    const role = roles[Math.floor(Math.random() * roles.length)];

    db.users.push({
      id: uuidv4(),
      name,
      email,
      cpf,
      phone,
      phoneType: 'celular',
      role,
      password: '' // fake users without password
    });
  }

  fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
  console.log('Seed concluído com sucesso!');
}

seed();
