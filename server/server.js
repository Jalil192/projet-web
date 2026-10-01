const express = require('express');
const session = require('express-session');
const cors = require('cors');
const { connectDB } = require('./db/connection');
const { populateDB } = require('./db/populate');
const authRouter = require('./routes/auth');
const messagesRouter = require('./routes/messages');
const usersRouter = require('./routes/users');

const app = express();
const PORT = 3000;

// CORS - autorise le client React (Vite sur port 5173)
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));

// Parseurs de requêtes
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Gestion des sessions
app.use(session({
  secret: 'organiz-asso-secret-key-lu3in017-2025',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 heures
  }
}));

// Routes API
app.use('/api/auth', authRouter);
app.use('/api/messages', messagesRouter);
app.use('/api/users', usersRouter);

// Route 404
app.use((req, res) => {
  res.status(404).json({ error: 'Route non trouvée' });
});

// Démarrage du serveur
async function start() {
  try {
    await connectDB();
    await populateDB();
    app.listen(PORT, () => {
      console.log(`Serveur Organiz'Asso démarré sur http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('Erreur au démarrage du serveur :', err);
    process.exit(1);
  }
}

start();
