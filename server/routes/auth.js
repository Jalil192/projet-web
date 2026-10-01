const express = require('express');
const bcrypt = require('bcrypt');
const { getDB } = require('../db/connection');

const router = express.Router();

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { login, password } = req.body;

  if (!login || !password) {
    return res.status(400).json({ error: 'Identifiant et mot de passe requis' });
  }

  try {
    const db = getDB();
    const user = await db.collection('users').findOne({ login });

    if (!user) {
      return res.status(401).json({ error: 'Identifiant ou mot de passe incorrect' });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Identifiant ou mot de passe incorrect' });
    }

    if (user.status === 'pending') {
      return res.status(403).json({ error: "Votre compte est en attente de validation par un administrateur", status: 'pending' });
    }

    if (user.status === 'refused') {
      return res.status(403).json({ error: "Votre demande d'inscription a été refusée", status: 'refused' });
    }

    // Création de la session
    req.session.user = {
      id: user._id.toString(),
      login: user.login,
      firstName: user.firstName,
      lastName: user.lastName,
      isAdmin: user.isAdmin
    };

    res.json(req.session.user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// POST /api/auth/logout
router.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ error: 'Erreur lors de la déconnexion' });
    }
    res.clearCookie('connect.sid');
    res.json({ message: 'Déconnecté avec succès' });
  });
});

// POST /api/auth/signup
router.post('/signup', async (req, res) => {
  const { firstName, lastName, login, password, passwordConfirm } = req.body;

  if (!firstName || !lastName || !login || !password || !passwordConfirm) {
    return res.status(400).json({ error: 'Tous les champs sont requis' });
  }

  if (password !== passwordConfirm) {
    return res.status(400).json({ error: 'Les mots de passe ne correspondent pas' });
  }

  if (password.length < 6) {
    return res.status(400).json({ error: 'Le mot de passe doit contenir au moins 6 caractères' });
  }

  try {
    const db = getDB();

    const existing = await db.collection('users').findOne({ login });
    if (existing) {
      return res.status(409).json({ error: 'Cet identifiant est déjà utilisé' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await db.collection('users').insertOne({
      firstName,
      lastName,
      login,
      password: hashedPassword,
      isAdmin: false,
      status: 'pending',
      createdAt: new Date()
    });

    res.status(201).json({ message: "Inscription envoyée, en attente de validation par un administrateur" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// GET /api/auth/me - Restaurer la session
router.get('/me', (req, res) => {
  if (req.session.user) {
    res.json(req.session.user);
  } else {
    res.status(401).json({ error: 'Non connecté' });
  }
});

module.exports = router;
