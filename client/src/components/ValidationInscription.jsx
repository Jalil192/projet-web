import { useState, useEffect } from 'react';
import api from '../api.js';

function ValidationInscription({ user }) {
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    if (!user.isAdmin) return;
    api.get('/users/pending')
      .then(res => setPending(res.data))
      .catch(() => setError('Impossible de charger les inscriptions'))
      .finally(() => setLoading(false));
  }, []);

  const handleValidate = (id) => {
    api.put(`/users/${id}/validate`)
      .then(() => {
        setPending(prev => prev.filter(u => u._id !== id));
        setMessage('Inscription validée !');
        setTimeout(() => setMessage(null), 3000);
      })
      .catch(err => setError(err.response?.data?.error || 'Erreur'));
  };

  const handleRefuse = (id) => {
    if (!window.confirm('Refuser cette inscription ?')) return;
    api.put(`/users/${id}/refuse`)
      .then(() => {
        setPending(prev => prev.filter(u => u._id !== id));
        setMessage('Inscription refusée.');
        setTimeout(() => setMessage(null), 3000);
      })
      .catch(err => setError(err.response?.data?.error || 'Erreur'));
  };

  const formatDate = (d) =>
    new Date(d).toLocaleString('fr-FR', { dateStyle: 'medium', timeStyle: 'short' });

  if (!user.isAdmin) {
    return <p className="error-msg">Accès réservé aux administrateurs.</p>;
  }

  return (
    <section className="validation-inscription">
      <h2>Validation des inscriptions</h2>

      {message && <p className="success-msg">{message}</p>}
      {error && <p className="error-msg">{error}</p>}
      {loading && <p className="loading">Chargement...</p>}

      {!loading && pending.length === 0 && (
        <p className="no-messages">Aucune inscription en attente.</p>
      )}

      {pending.map(u => (
        <div key={u._id} className="pending-user">
          <div className="pending-user-info">
            <strong>{u.firstName} {u.lastName}</strong>
            <span className="pending-login">@{u.login}</span>
            <span className="pending-date">{formatDate(u.createdAt)}</span>
          </div>
          <div className="pending-actions">
            <button
              className="validate-btn"
              onClick={() => handleValidate(u._id)}
            >
              ✓ Valider
            </button>
            <button
              className="refuse-btn"
              onClick={() => handleRefuse(u._id)}
            >
              ✕ Refuser
            </button>
          </div>
        </div>
      ))}
    </section>
  );
}

export default ValidationInscription;
