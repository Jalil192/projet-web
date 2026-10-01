import { useState, useEffect } from 'react';
import api from '../api.js';
import AdminBadge from './AdminBadge.jsx';

function ForumPublic({ onLoginClick }) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    api.get('/messages/public')
      .then(res => setMessages(res.data))
      .catch(() => setError('Impossible de charger le forum'))
      .finally(() => setLoading(false));
  }, []);

  const formatDate = (d) =>
    new Date(d).toLocaleString('fr-FR', { dateStyle: 'medium', timeStyle: 'short' });

  return (
    <section className="forum-public">
      <div className="forum-public-banner">
        <p>
          Vous consultez le forum en lecture seule.{' '}
          <button className="link-btn" onClick={onLoginClick}>Connectez-vous</button>{' '}
          pour participer.
        </p>
      </div>

      {loading && <p className="loading">Chargement du forum...</p>}
      {error && <p className="error-msg">{error}</p>}

      {!loading && !error && messages.length === 0 && (
        <p className="no-messages">Aucun message pour l'instant.</p>
      )}

      <div className="message-list">
        {messages.map(msg => (
          <article key={msg._id} className="message message-readonly">
            <div className="message-header">
              <div className="message-author-info">
                <span className="message-author">
                  {msg.authorFirstName} {msg.authorLastName}
                </span>
                <span className="message-login">@{msg.authorLogin}</span>
                <AdminBadge isAdmin={msg.authorIsAdmin} />
              </div>
              <span className="message-date">{formatDate(msg.createdAt)}</span>
            </div>
            <p className="message-content">{msg.content}</p>
            <div className="message-actions">
              <span className="like-count">♥ {(msg.likes || []).length}</span>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

export default ForumPublic;
