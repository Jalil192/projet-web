const { getDB } = require('./connection');
const bcrypt = require('bcrypt');

async function populateDB() {
  const db = getDB();

  // Ne peuple que si la base est vide
  const usersCount = await db.collection('users').countDocuments();
  if (usersCount > 0) {
    console.log('Base déjà peuplée, skip.');
    return;
  }

  console.log('Peuplement de la base de données...');

  // Utilisateur admin
  const adminPassword = await bcrypt.hash('admin123', 10);
  const adminUser = await db.collection('users').insertOne({
    firstName: 'Admin',
    lastName: 'Organiz',
    login: 'admin',
    password: adminPassword,
    isAdmin: true,
    status: 'active',
    createdAt: new Date()
  });

  // Utilisateurs membres actifs
  const motdepasse = await bcrypt.hash('motdepasse', 10);

  const user1 = await db.collection('users').insertOne({
    firstName: 'Alice',
    lastName: 'Dupont',
    login: 'alice',
    password: motdepasse,
    isAdmin: false,
    status: 'active',
    createdAt: new Date(Date.now() - 86400000 * 5)
  });

  const user2 = await db.collection('users').insertOne({
    firstName: 'Bob',
    lastName: 'Martin',
    login: 'bob',
    password: motdepasse,
    isAdmin: false,
    status: 'active',
    createdAt: new Date(Date.now() - 86400000 * 3)
  });

  // Utilisateur en attente de validation
  const password3 = await bcrypt.hash('motdepasse', 10);
  await db.collection('users').insertOne({
    firstName: 'Charlie',
    lastName: 'Durand',
    login: 'charlie',
    password: password3,
    isAdmin: false,
    status: 'pending',
    createdAt: new Date(Date.now() - 86400000)
  });

  // Utilisateur refusé
  const password4 = await bcrypt.hash('motdepasse', 10);
  await db.collection('users').insertOne({
    firstName: 'Diana',
    lastName: 'Leroy',
    login: 'diana',
    password: password4,
    isAdmin: false,
    status: 'refused',
    createdAt: new Date(Date.now() - 86400000 * 2)
  });

  const now = Date.now();

  // Messages forum ouvert
  const msg1 = await db.collection('messages').insertOne({
    content: "Bienvenue sur le forum de l'association Organiz'Asso ! N'hésitez pas à vous présenter et à participer aux discussions.",
    authorId: adminUser.insertedId,
    authorLogin: 'admin',
    authorFirstName: 'Admin',
    authorLastName: 'Organiz',
    authorIsAdmin: true,
    forumType: 'ouvert',
    parentId: null,
    recipientId: null,
    recipientLogin: null,
    likes: [],
    reports: [],
    createdAt: new Date(now - 86400000 * 2)
  });

  await db.collection('messages').insertOne({
    content: "Bonjour ! Je suis Alice, ravie de rejoindre cette belle association. Hâte de vous rencontrer !",
    authorId: user1.insertedId,
    authorLogin: 'alice',
    authorFirstName: 'Alice',
    authorLastName: 'Dupont',
    authorIsAdmin: false,
    forumType: 'ouvert',
    parentId: msg1.insertedId,
    recipientId: null,
    recipientLogin: null,
    likes: [adminUser.insertedId],
    reports: [],
    createdAt: new Date(now - 86400000)
  });

  const msg2 = await db.collection('messages').insertOne({
    content: "Salut tout le monde ! Moi c'est Bob. J'ai hâte de participer aux activités organisées par l'asso !",
    authorId: user2.insertedId,
    authorLogin: 'bob',
    authorFirstName: 'Bob',
    authorLastName: 'Martin',
    authorIsAdmin: false,
    forumType: 'ouvert',
    parentId: null,
    recipientId: null,
    recipientLogin: null,
    likes: [adminUser.insertedId, user1.insertedId],
    reports: [],
    createdAt: new Date(now - 3600000 * 6)
  });

  await db.collection('messages').insertOne({
    content: "Bienvenue Bob ! N'hésite pas à consulter le calendrier des événements.",
    authorId: adminUser.insertedId,
    authorLogin: 'admin',
    authorFirstName: 'Admin',
    authorLastName: 'Organiz',
    authorIsAdmin: true,
    forumType: 'ouvert',
    parentId: msg2.insertedId,
    recipientId: null,
    recipientLogin: null,
    likes: [],
    reports: [],
    createdAt: new Date(now - 3600000 * 5)
  });

  // Messages forum fermé (admin seulement)
  await db.collection('messages').insertOne({
    content: "Réunion du bureau prévue le 20 de ce mois à 18h. Ordre du jour : bilan financier, projets du trimestre, renouvellement des adhésions.",
    authorId: adminUser.insertedId,
    authorLogin: 'admin',
    authorFirstName: 'Admin',
    authorLastName: 'Organiz',
    authorIsAdmin: true,
    forumType: 'ferme',
    parentId: null,
    recipientId: null,
    recipientLogin: null,
    likes: [],
    reports: [],
    createdAt: new Date(now - 3600000 * 12)
  });

  await db.collection('messages').insertOne({
    content: "Rappel : les inscriptions pour l'événement de printemps ferment ce vendredi. Merci de communiquer vos disponibilités avant cette date.",
    authorId: adminUser.insertedId,
    authorLogin: 'admin',
    authorFirstName: 'Admin',
    authorLastName: 'Organiz',
    authorIsAdmin: true,
    forumType: 'ferme',
    parentId: null,
    recipientId: null,
    recipientLogin: null,
    likes: [],
    reports: [],
    createdAt: new Date(now - 3600000 * 2)
  });

  // Messages privés
  await db.collection('messages').insertOne({
    content: "Bonjour Alice, bienvenue dans l'association ! N'hésite pas si tu as des questions.",
    authorId: adminUser.insertedId,
    authorLogin: 'admin',
    authorFirstName: 'Admin',
    authorLastName: 'Organiz',
    authorIsAdmin: true,
    forumType: 'prive',
    parentId: null,
    recipientId: user1.insertedId,
    recipientLogin: 'alice',
    likes: [],
    reports: [],
    createdAt: new Date(now - 3600000 * 3)
  });

  await db.collection('messages').insertOne({
    content: "Merci beaucoup pour l'accueil ! Je suis très contente de rejoindre l'asso.",
    authorId: user1.insertedId,
    authorLogin: 'alice',
    authorFirstName: 'Alice',
    authorLastName: 'Dupont',
    authorIsAdmin: false,
    forumType: 'prive',
    parentId: null,
    recipientId: adminUser.insertedId,
    recipientLogin: 'admin',
    likes: [],
    reports: [],
    createdAt: new Date(now - 3600000 * 2)
  });

  console.log("Base de données peuplée avec succès !");
  console.log("Comptes de test :");
  console.log("  admin / admin123  (administrateur)");
  console.log("  alice / motdepasse (membre actif)");
  console.log("  bob   / motdepasse (membre actif)");
  console.log("  charlie / motdepasse (inscription en attente)");
}

module.exports = { populateDB };
