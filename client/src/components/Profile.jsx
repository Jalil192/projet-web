import { useState, useEffect } from 'react';
import User from './User.jsx';
import MessageList from './MessageList.jsx';
import api from '../api.js';

function Profile({ user }) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    api.get(`/messages/profile/${user.login}`)
      .then(res => setMessages(res.data))
      .catch(() => setError('Impossible de charger vos messages'))
      .finally(() => setLoading(false));
  }, [user.login]);

  return (
    <section className="profile">
      <h2>Mon profil</h2>
      <User user={user} />

      <div className="profile-messages">
        <h3>Mes messages publiés</h3>
        {loading && <p className="loading">Chargement...</p>}
        {error && <p className="error-msg">{error}</p>}
        {!loading && !error && (
          <MessageList messages={messages} user={user} onRefresh={setMessages} />
        )}
      </div>
    </section>
  );
}

export default Profile;
