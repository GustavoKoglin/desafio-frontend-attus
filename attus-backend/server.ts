import express, { Request, Response, NextFunction } from 'express';
import fs from 'fs';
import path from 'path';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import cors from 'cors';
import { v4 as uuidv4 } from 'uuid';

const app = express();
app.use(cors());
app.use(express.json());

const PORT = 3000;
const SECRET_KEY = 'supersecretkey-attus-desafio';
const DB_FILE = path.join(__dirname, 'db.json');

// Inicializa o banco de dados se não existir
if (!fs.existsSync(DB_FILE)) {
  const adminPassword = bcrypt.hashSync('Teste@teste123!', 10);
  const initialData = {
    users: [
      {
        id: uuidv4(),
        name: 'Admin',
        email: 'gustavo.koglin@teste.com',
        password: adminPassword,
        role: 'Admin',
        cpf: '000.000.000-00',
        phone: '00000000000',
        phoneType: 'celular'
      }
    ],
    logs: []
  };
  fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2));
}

// Utilitários de leitura/escrita
const readDB = () => JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'));
const writeDB = (data: any) => fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));

// Adicionar Log
const addLog = (action: string, authorName: string, authorEmail: string, ip: string) => {
  const db = readDB();
  const now = new Date();
  
  const log = {
    id: uuidv4(),
    action,
    authorName,
    authorEmail,
    local: ip,
    date: now.toLocaleDateString('pt-BR'),
    time: now.toLocaleTimeString('pt-BR'),
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
  };
  
  db.logs.push(log);
  writeDB(db);
};

// Middlewares
interface AuthRequest extends Request {
  user?: any;
}

const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ message: 'Token não fornecido' });
  }

  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Token inválido' });
  }
};

const roleMiddleware = (roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Acesso negado' });
    }
    next();
  };
};

// Rotas
app.post('/api/login', (req: Request, res: Response) => {
  const { email, password } = req.body;
  const db = readDB();
  const user = db.users.find((u: any) => u.email === email);

  if (!user || !bcrypt.compareSync(password, user.password)) {
    return res.status(401).json({ message: 'E-mail ou senha incorretos' });
  }

  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role, name: user.name },
    SECRET_KEY,
    { expiresIn: '8h' }
  );

  res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
});

// Listar Usuários (todos logados podem ver)
app.get('/api/users', authMiddleware, (req: AuthRequest, res: Response) => {
  const db = readDB();
  const safeUsers = db.users
    .filter((u: any) => u.id !== req.user.id)
    .map((u: any) => {
      const { password, ...rest } = u;
      return rest;
    });
  res.json(safeUsers);
});

// Criar Usuário (Apenas Admin ou Editor)
app.post('/api/users', authMiddleware, roleMiddleware(['Admin', 'Editor']), (req: AuthRequest, res: Response) => {
  const db = readDB();
  const { name, email, cpf, phone, phoneType, password, role } = req.body;
  
  if (db.users.find((u: any) => u.email === email)) {
    return res.status(400).json({ message: 'E-mail já cadastrado' });
  }

  const newUser = {
    id: uuidv4(),
    name,
    email,
    cpf,
    phone,
    phoneType,
    role: role || 'Visualizador', // Fallback
    password: password ? bcrypt.hashSync(password, 10) : ''
  };

  db.users.push(newUser);
  writeDB(db);

  addLog(`Criou o usuário ${name} (${email})`, req.user.name, req.user.email, req.ip || '0.0.0.0');

  const { password: _, ...safeUser } = newUser;
  res.status(201).json(safeUser);
});

// Editar Usuário (Apenas Admin ou Editor)
app.put('/api/users/:id', authMiddleware, roleMiddleware(['Admin', 'Editor']), (req: AuthRequest, res: Response) => {
  const db = readDB();
  const index = db.users.findIndex((u: any) => u.id === req.params.id);
  
  if (index === -1) {
    return res.status(404).json({ message: 'Usuário não encontrado' });
  }

  const { name, email, cpf, phone, phoneType, role, password } = req.body;
  const oldUser = db.users[index];

  db.users[index] = {
    ...oldUser,
    name: name || oldUser.name,
    email: email || oldUser.email,
    cpf: cpf || oldUser.cpf,
    phone: phone || oldUser.phone,
    phoneType: phoneType || oldUser.phoneType,
    role: role || oldUser.role,
    password: password ? bcrypt.hashSync(password, 10) : oldUser.password
  };

  writeDB(db);

  addLog(`Editou o usuário ${db.users[index].name} (${db.users[index].email})`, req.user.name, req.user.email, req.ip || '0.0.0.0');

  const { password: _, ...safeUser } = db.users[index];
  res.json(safeUser);
});

// Deletar Usuário (Apenas Admin ou Editor)
app.delete('/api/users/:id', authMiddleware, roleMiddleware(['Admin', 'Editor']), (req: AuthRequest, res: Response) => {
  const db = readDB();
  const index = db.users.findIndex((u: any) => u.id === req.params.id);
  
  if (index === -1) {
    return res.status(404).json({ message: 'Usuário não encontrado' });
  }

  const user = db.users[index];
  db.users.splice(index, 1);
  writeDB(db);

  addLog(`Deletou o usuário ${user.name} (${user.email})`, req.user.name, req.user.email, req.ip || '0.0.0.0');

  res.status(204).send();
});

// Listar Logs (Apenas Admin)
app.get('/api/logs', authMiddleware, roleMiddleware(['Admin']), (req: AuthRequest, res: Response) => {
  const db = readDB();
  res.json(db.logs);
});

app.listen(PORT, () => {
  console.log(`Backend rodando na porta ${PORT}`);
});
