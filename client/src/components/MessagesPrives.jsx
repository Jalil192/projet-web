import { useState, useEffect } from 'react';
import api from '../api.js';

function MessagesPrives({ user }) {
  const [messages, setMessages] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [selectedLogin, setSelectedLogin] = useState(null);
  const [newRecipient, setNewRecipient] = useState('');
  const [newContent, setNewContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sendError, setSendError] = useState(null);

  useEffect(() => {
    api.get('/messages/private')
      .then(res => {
        const msgs = res.data;
        setMessages(msgs);

        // Construire la liste des interlocuteurs
        const logins = new Set();
        msgs.forEach(m => {
          if (m.authorLogin !== user.login) logins.add(m.authorLogin);
          if (m.recipientLogin && m.recipientLogin !== user.login) logins.add(m.recipientLogin);
        });
        setConversations([...logins]);
        if (logins.size > 0) setSelectedLogin([...logins][0]);
      })
      .catch(() => setError('Impossible de charger les messages privés'))
      .finally(() => setLoading(false));
  }, []);

  const conversationWith = (login) =>
    messages.filter(m =>
      (m.authorLogin === user.login && m.recipientLogin === login) ||
      (m.authorLogin === login && m.recipientLogin === user.login)
    ).sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

  const handleSend = (e) => {
    e.preventDefault();
    setSendError(null);
    const recipient = selectedLogin || newRecipient.trim();
    if (!recipient || !newContent.trim()) return;

    api.post('/messages/private', { content: newContent, recipientLogin: recipient })
      .then(res => {
        setMessages(prev => [...prev, res.data]);
        setNewContent('');
        if (!conversations.includes(recipient)) {
          setConversations(prev => [...prev, recipient]);
          setSelectedLogin(recipient);
        }
      })
      .catch(err => setSendError(err.response?.data?.error || 'Erreur d\'envoi'));
  };

  const formatDate = (d) =>
    new Date(d).toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' });

  if (loading) return <p className="loading">Chargement des messages privés...</p>;
  if (error) return <p className="error-msg">{error}</p>;

  const currentConv = selectedLogin ? conversationWith(selectedLogin) : [];

  return (
    <section className="messages-prives">
      <h2>Messages privés</h2>
      <div className="mp-layout">
        <aside className="mp-sidebar">
          <h3>Conversations</h3>
          {conversations.length === 0 && (
            <p className="no-conv">Aucune conversation</p>
          )}
          {conversations.map(login => (
            <button
              key={login}
              className={`conv-item${selectedLogin === login ? ' active' : ''}`}
              onClick={() => setSelectedLogin(login)}
            >
              @{login}
            </button>
          ))}
          <div className="new-conv">
            <h4>Nouvelle conversation</h4>
            <input
              type="text"
              placeholder="Identifiant du destinataire"
              value={newRecipient}
              onChange={e => setNewRecipient(e.target.value)}
              onFocus={() => setSelectedLogin(null)}
            />
          </div>
        </aside>

        <div className="mp-main">
          {selectedLogin && (
            <div className="mp-conv-header">
              <h3>Conversation avec @{selectedLogin}</h3>
            </div>
          )}

          <div className="mp-messages">
            {currentConv.map(msg => (
              <div
                key={msg._id}
                className={`mp-bubble${msg.authorLogin === user.login ? ' mp-mine' : ' mp-other'}`}
              >
                <p className="mp-content">{msg.content}</p>
                <span className="mp-date">{formatDate(msg.createdAt)}</span>
              </div>
            ))}
            {selectedLogin && currentConv.length === 0 && (
              <p className="no-messages">Début de la conversation</p>
            )}
          </div>

          <form className="mp-form" onSubmit={handleSend}>
            <textarea
              value={newContent}
              onChange={e => setNewContent(e.target.value)}
              placeholder={`Écrire à @${selectedLogin || newRecipient || '...'}...`}
              rows={3}
            />
            {sendError && <p className="error-msg">{sendError}</p>}
            <button
              type="submit"
              disabled={!newContent.trim() || (!selectedLogin && !newRecipient.trim())}
            >
              Envoyer
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}

export default MessagesPrives;
