import { useState } from 'react';
import api from '../api.js';

function MessageForm({ forumType, parentId = null, onSubmit, onCancel, placeholder = 'Écrire un message...' }) {
  const [content, setContent] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!content.trim()) {
      setError('Le message ne peut pas être vide');
      return;
    }
    setLoading(true);
    setError(null);

    api.post('/messages', { content, forumType, parentId })
      .then(res => {
        setContent('');
        onSubmit(res.data);
      })
      .catch(err => {
        setError(err.response?.data?.error || 'Erreur lors de l\'envoi');
      })
      .finally(() => setLoading(false));
  };

  return (
    <form className="message-form" onSubmit={handleSubmit}>
      <textarea
        value={content}
        onChange={e => setContent(e.target.value)}
        placeholder={placeholder}
        rows={4}
        disabled={loading}
      />
      {error && <p className="error-msg">{error}</p>}
      <div className="form-actions">
        <button type="submit" disabled={loading || !content.trim()}>
          {loading ? 'Envoi...' : 'Publier'}
        </button>
        {onCancel && (
          <button type="button" onClick={onCancel} disabled={loading}>
            Annuler
          </button>
        )}
      </div>
    </form>
  );
}

export default MessageForm;
