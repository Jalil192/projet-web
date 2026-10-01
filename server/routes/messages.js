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

function serializeMsg(m) {
  return {
    ...m,
    _id: m._id.toString(),
    authorId: m.authorId.toString(),
    parentId: m.parentId ? m.parentId.toString() : null,
    recipientId: m.recipientId ? m.recipientId.toString() : null,
    likes: (m.likes || []).map(id => id.toString()),
    reports: (m.reports || []).map(r => ({ ...r, userId: r.userId.toString() }))
  };
}

// GET /api/messages/public - Forum ouvert sans connexion
router.get('/public', async (req, res) => {
  try {
    const db = getDB();
    const messages = await db.collection('messages')
      .find({ forumType: 'ouvert', parentId: null })
      .sort({ createdAt: -1 })
      .toArray();
    res.json(messages.map(serializeMsg));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// GET /api/messages/private - Conversations privées de l'utilisateur
router.get('/private', requireAuth, async (req, res) => {
  try {
    const db = getDB();
    const userId = new ObjectId(req.session.user.id);

    const messages = await db.collection('messages')
      .find({
        forumType: 'prive',
        $or: [{ authorId: userId }, { recipientId: userId }]
      })
      .sort({ createdAt: 1 })
      .toArray();

    res.json(messages.map(serializeMsg));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// GET /api/messages/search - Recherche
router.get('/search', requireAuth, async (req, res) => {
  const { q, author, from, to } = req.query;

  try {
    const db = getDB();
    const filter = { parentId: null };

    // Non-admin ne cherche que dans le forum ouvert
    if (req.session.user.isAdmin) {
      filter.forumType = { $in: ['ouvert', 'ferme'] };
    } else {
      filter.forumType = 'ouvert';
    }

    if (q) {
      filter.content = { $regex: q, $options: 'i' };
    }
    if (author) {
      filter.authorLogin = { $regex: author, $options: 'i' };
    }
    if (from || to) {
      filter.createdAt = {};
      if (from) filter.createdAt.$gte = new Date(from);
      if (to) filter.createdAt.$lte = new Date(to + 'T23:59:59');
    }

    const messages = await db.collection('messages')
      .find(filter)
      .sort({ createdAt: -1 })
      .toArray();

    res.json(messages.map(serializeMsg));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// GET /api/messages/profile/:login - Messages d'un profil utilisateur
router.get('/profile/:login', requireAuth, async (req, res) => {
  try {
    const db = getDB();
    const { login } = req.params;

    const filter = {
      authorLogin: login,
      parentId: null
    };

    // Non-admin ne voit que le forum ouvert sauf pour son propre profil
    if (!req.session.user.isAdmin && login !== req.session.user.login) {
      filter.forumType = 'ouvert';
    } else {
      filter.forumType = { $in: ['ouvert', 'ferme'] };
    }

    const messages = await db.collection('messages')
      .find(filter)
      .sort({ createdAt: -1 })
      .toArray();

    res.json(messages.map(serializeMsg));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// GET /api/messages - Forum ouvert ou fermé (connecté)
router.get('/', requireAuth, async (req, res) => {
  const { type } = req.query;

  if (!['ouvert', 'ferme'].includes(type)) {
    return res.status(400).json({ error: 'Type de forum invalide (ouvert ou ferme)' });
  }

  if (type === 'ferme' && !req.session.user.isAdmin) {
    return res.status(403).json({ error: 'Le forum fermé est réservé aux administrateurs' });
  }

  try {
    const db = getDB();
    const messages = await db.collection('messages')
      .find({ forumType: type, parentId: null })
      .sort({ createdAt: -1 })
      .toArray();

    res.json(messages.map(serializeMsg));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// GET /api/messages/:id/comments - Commentaires d'un message
router.get('/:id/comments', requireAuth, async (req, res) => {
  try {
    const db = getDB();
    const parentId = new ObjectId(req.params.id);

    const comments = await db.collection('messages')
      .find({ parentId })
      .sort({ createdAt: 1 })
      .toArray();

    res.json(comments.map(serializeMsg));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// POST /api/messages - Créer un message dans le forum
router.post('/', requireAuth, async (req, res) => {
  const { content, forumType, parentId } = req.body;

  if (!content || !content.trim()) {
    return res.status(400).json({ error: 'Le contenu est requis' });
  }

  if (!['ouvert', 'ferme'].includes(forumType)) {
    return res.status(400).json({ error: 'Type de forum invalide' });
  }

  if (forumType === 'ferme' && !req.session.user.isAdmin) {
    return res.status(403).json({ error: 'Seuls les administrateurs peuvent poster dans le forum fermé' });
  }

  try {
    const db = getDB();

    let parentObjectId = null;
    if (parentId) {
      parentObjectId = new ObjectId(parentId);
      const parent = await db.collection('messages').findOne({ _id: parentObjectId });
      if (!parent) {
        return res.status(404).json({ error: 'Message parent introuvable' });
      }
    }

    const newMsg = {
      content: content.trim(),
      authorId: new ObjectId(req.session.user.id),
      authorLogin: req.session.user.login,
      authorFirstName: req.session.user.firstName,
      authorLastName: req.session.user.lastName,
      authorIsAdmin: req.session.user.isAdmin,
      forumType,
      parentId: parentObjectId,
      recipientId: null,
      recipientLogin: null,
      likes: [],
      reports: [],
      createdAt: new Date()
    };

    const result = await db.collection('messages').insertOne(newMsg);
    const msg = await db.collection('messages').findOne({ _id: result.insertedId });
    res.status(201).json(serializeMsg(msg));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// POST /api/messages/private (doit être après les routes fixes)
router.post('/private', requireAuth, async (req, res) => {
  const { content, recipientLogin } = req.body;

  if (!content || !content.trim()) {
    return res.status(400).json({ error: 'Le contenu est requis' });
  }
  if (!recipientLogin) {
    return res.status(400).json({ error: 'Destinataire requis' });
  }
  if (recipientLogin === req.session.user.login) {
    return res.status(400).json({ error: 'Vous ne pouvez pas vous écrire à vous-même' });
  }

  try {
    const db = getDB();
    const recipient = await db.collection('users').findOne({ login: recipientLogin, status: 'active' });
    if (!recipient) {
      return res.status(404).json({ error: 'Destinataire introuvable' });
    }

    const newMsg = {
      content: content.trim(),
      authorId: new ObjectId(req.session.user.id),
      authorLogin: req.session.user.login,
      authorFirstName: req.session.user.firstName,
      authorLastName: req.session.user.lastName,
      authorIsAdmin: req.session.user.isAdmin,
      forumType: 'prive',
      parentId: null,
      recipientId: recipient._id,
      recipientLogin: recipient.login,
      likes: [],
      reports: [],
      createdAt: new Date()
    };

    const result = await db.collection('messages').insertOne(newMsg);
    const msg = await db.collection('messages').findOne({ _id: result.insertedId });
    res.status(201).json(serializeMsg(msg));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// DELETE /api/messages/:id
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const db = getDB();
    const msgId = new ObjectId(req.params.id);
    const msg = await db.collection('messages').findOne({ _id: msgId });

    if (!msg) {
      return res.status(404).json({ error: 'Message introuvable' });
    }

    if (msg.authorId.toString() !== req.session.user.id && !req.session.user.isAdmin) {
      return res.status(403).json({ error: 'Non autorisé' });
    }

    // Supprimer le message et ses commentaires
    await db.collection('messages').deleteMany({
      $or: [{ _id: msgId }, { parentId: msgId }]
    });

    res.json({ message: 'Message supprimé' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// POST /api/messages/:id/like - Liker / unliker
router.post('/:id/like', requireAuth, async (req, res) => {
  try {
    const db = getDB();
    const msgId = new ObjectId(req.params.id);
    const userId = new ObjectId(req.session.user.id);

    const msg = await db.collection('messages').findOne({ _id: msgId });
    if (!msg) {
      return res.status(404).json({ error: 'Message introuvable' });
    }

    const hasLiked = (msg.likes || []).some(id => id.toString() === userId.toString());

    if (hasLiked) {
      await db.collection('messages').updateOne({ _id: msgId }, { $pull: { likes: userId } });
    } else {
      await db.collection('messages').updateOne({ _id: msgId }, { $push: { likes: userId } });
    }

    const updated = await db.collection('messages').findOne({ _id: msgId });
    res.json({ liked: !hasLiked, count: updated.likes.length });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// POST /api/messages/:id/report - Signaler un message
router.post('/:id/report', requireAuth, async (req, res) => {
  const { reason } = req.body;

  if (!reason || !reason.trim()) {
    return res.status(400).json({ error: 'Un motif de signalement est requis' });
  }

  try {
    const db = getDB();
    const msgId = new ObjectId(req.params.id);
    const userId = new ObjectId(req.session.user.id);

    const msg = await db.collection('messages').findOne({ _id: msgId });
    if (!msg) {
      return res.status(404).json({ error: 'Message introuvable' });
    }

    const alreadyReported = (msg.reports || []).some(r => r.userId.toString() === userId.toString());
    if (alreadyReported) {
      return res.status(409).json({ error: 'Vous avez déjà signalé ce message' });
    }

    await db.collection('messages').updateOne(
      { _id: msgId },
      { $push: { reports: { userId, reason: reason.trim(), createdAt: new Date() } } }
    );

    res.json({ message: 'Message signalé' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

module.exports = router;
