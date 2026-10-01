const express = require('express');
const { getDB } = require('../db/connection');
const { ObjectId } = require('mongodb');

const router = express.Router();

function requireAuth(req, res, next) {
  if (!req.session.user) {
    return res.status(401).json({ error: 'Authentification requise' });
  }
  next();
}

function requireAdmin(req, res, next) {
  if (!req.session.user || !req.session.user.isAdmin) {
    return res.status(403).json({ error: 'Accès administrateur requis' });
  }
  next();
}

// GET /api/users/pending - Utilisateurs en attente (admin)
router.get('/pending', requireAdmin, async (req, res) => {
  try {
    const db = getDB();
    const users = await db.collection('users')
      .find({ status: 'pending' })
      .sort({ createdAt: 1 })
      .toArray();

    res.json(users.map(u => ({
      _id: u._id.toString(),
      firstName: u.firstName,
      lastName: u.lastName,
      login: u.login,
      status: u.status,
      createdAt: u.createdAt
    })));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// GET /api/users - Tous les utilisateurs actifs (admin)
router.get('/', requireAdmin, async (req, res) => {
  try {
    const db = getDB();
    const users = await db.collection('users')
      .find({ status: 'active' })
      .sort({ lastName: 1, firstName: 1 })
      .toArray();

    res.json(users.map(u => ({
      _id: u._id.toString(),
      firstName: u.firstName,
      lastName: u.lastName,
      login: u.login,
      isAdmin: u.isAdmin,
      status: u.status,
      createdAt: u.createdAt
    })));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// GET /api/users/:login - Infos d'un utilisateur
router.get('/:login', requireAuth, async (req, res) => {
  try {
    const db = getDB();
    const user = await db.collection('users').findOne({ login: req.params.login });

    if (!user) {
      return res.status(404).json({ error: 'Utilisateur introuvable' });
    }

    res.json({
      _id: user._id.toString(),
      firstName: user.firstName,
      lastName: user.lastName,
      login: user.login,
      isAdmin: user.isAdmin,
      createdAt: user.createdAt
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// PUT /api/users/:id/validate - Valider une inscription (admin)
router.put('/:id/validate', requireAdmin, async (req, res) => {
  try {
    const db = getDB();
    const userId = new ObjectId(req.params.id);

    const result = await db.collection('users').updateOne(
      { _id: userId, status: 'pending' },
      { $set: { status: 'active' } }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'Utilisateur introuvable ou déjà traité' });
    }

    res.json({ message: 'Inscription validée' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// PUT /api/users/:id/refuse - Refuser une inscription (admin)
router.put('/:id/refuse', requireAdmin, async (req, res) => {
  try {
    const db = getDB();
    const userId = new ObjectId(req.params.id);

    const result = await db.collection('users').updateOne(
      { _id: userId, status: 'pending' },
      { $set: { status: 'refused' } }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'Utilisateur introuvable ou déjà traité' });
    }

    res.json({ message: 'Inscription refusée' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

module.exports = router;
