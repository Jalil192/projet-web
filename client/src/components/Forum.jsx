import { useState, useEffect } from 'react';
import MessageList from './MessageList.jsx';
import MessageForm from './MessageForm.jsx';
import api from '../api.js';

function Forum({ user, forumType }) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const label = forumType === 'ouvert' ? 'Forum ouvert' : 'Forum fermé (Admin)';

  useEffect(() => {
    setLoading(true);
    setError(null);
    api.get(`/messages?type=${forumType}`)
      .then(res => setMessages(res.data))
      .catch(err => setError(err.response?.data?.error || 'Erreur de chargement'))
      .finally(() => setLoading(false));
  }, [forumType]);

  const handleNewMessage = (msg) => {
    setMessages(prev => [msg, ...prev]);
  };

  // Un membre peut poster dans le forum ouvert ; seul l'admin peut poster dans le forum fermé
  const canPost = forumType === 'ouvert' || (forumType === 'ferme' && user.isAdmin);

  return (
    <section className="forum">
      <h2>{label}</h2>

      {forumType === 'ferme' && (
        <p className="forum-info">
          Ce forum est réservé aux annonces de l'administration. Seuls les administrateurs peuvent y publier.
        </p>
      )}

      {canPost && (
        <div className="forum-new-message">
          <h3>Nouveau message</h3>
          <MessageForm
            forumType={forumType}
            parentId={null}
            onSubmit={handleNewMessage}
          />
        </div>
      )}

      {loading && <p className="loading">Chargement du forum...</p>}
      {error && <p className="error-msg">{error}</p>}

      {!loading && !error && (
        <MessageList
          messages={messages}
          user={user}
          onRefresh={setMessages}
        />
      )}
    </section>
  );
}

export default Forum;
