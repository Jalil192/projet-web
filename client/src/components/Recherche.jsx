import { useState } from 'react';
import MessageList from './MessageList.jsx';
import api from '../api.js';

function Recherche({ user }) {
  const [q, setQ] = useState('');
  const [author, setAuthor] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [results, setResults] = useState([]);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSearch = (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const params = new URLSearchParams();
    if (q) params.append('q', q);
    if (author) params.append('author', author);
    if (from) params.append('from', from);
    if (to) params.append('to', to);

    api.get(`/messages/search?${params.toString()}`)
      .then(res => {
        setResults(res.data);
        setSearched(true);
      })
      .catch(err => setError(err.response?.data?.error || 'Erreur de recherche'))
      .finally(() => setLoading(false));
  };

  const handleReset = () => {
    setQ(''); setAuthor(''); setFrom(''); setTo('');
    setResults([]); setSearched(false);
  };

  return (
    <section className="recherche">
      <h2>Recherche</h2>

      <form className="search-form" onSubmit={handleSearch}>
        <div className="search-fields">
          <div className="field-group">
            <label htmlFor="search-q">Mots-clés</label>
            <input
              id="search-q"
              type="text"
              value={q}
              onChange={e => setQ(e.target.value)}
              placeholder="Rechercher dans le contenu..."
            />
          </div>
          <div className="field-group">
            <label htmlFor="search-author">Auteur</label>
            <input
              id="search-author"
              type="text"
              value={author}
              onChange={e => setAuthor(e.target.value)}
              placeholder="Identifiant de l'auteur..."
            />
          </div>
          <div className="field-group">
            <label htmlFor="search-from">Date début</label>
            <input
              id="search-from"
              type="date"
              value={from}
              onChange={e => setFrom(e.target.value)}
            />
          </div>
          <div className="field-group">
            <label htmlFor="search-to">Date fin</label>
            <input
              id="search-to"
              type="date"
              value={to}
              onChange={e => setTo(e.target.value)}
            />
          </div>
        </div>

        <div className="search-actions">
          <button type="submit" disabled={loading}>
            {loading ? 'Recherche...' : 'Rechercher'}
          </button>
          <button type="button" onClick={handleReset}>Réinitialiser</button>
        </div>
      </form>

      {error && <p className="error-msg">{error}</p>}

      {searched && !loading && (
        <div className="search-results">
          <p className="results-count">
            {results.length === 0
              ? 'Aucun résultat trouvé'
              : `${results.length} résultat(s) trouvé(s)`}
          </p>
          <MessageList messages={results} user={user} onRefresh={setResults} />
        </div>
      )}
    </section>
  );
}

export default Recherche;
