import { useState } from 'react';
import api from '../api.js';

const MOTIFS = [
  'Contenu inapproprié',
  'Harcèlement ou intimidation',
  'Spam ou publicité',
  'Fausse information',
  'Autre'
];

function ReportButton({ messageId }) {
  const [showForm, setShowForm] = useState(false);
  const [reason, setReason] = useState(MOTIFS[0]);
  const [done, setDone] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    api.post(`/messages/${messageId}/report`, { reason })
      .then(() => {
        setDone(true);
        setShowForm(false);
      })
      .catch(err => {
        setError(err.response?.data?.error || 'Erreur lors du signalement');
      });
  };

  if (done) return <span className="report-done">Signalé</span>;

  return (
    <div className="report-container">
      <button className="report-btn" onClick={() => setShowForm(!showForm)}>
        ⚑ Signaler
      </button>
      {showForm && (
        <form className="report-form" onSubmit={handleSubmit}>
          <select value={reason} onChange={e => setReason(e.target.value)}>
            {MOTIFS.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
          <div className="report-actions">
            <button type="submit">Envoyer</button>
            <button type="button" onClick={() => setShowForm(false)}>Annuler</button>
          </div>
          {error && <p className="error-msg">{error}</p>}
        </form>
      )}
    </div>
  );
}

export default ReportButton;
