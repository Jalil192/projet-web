import { useState } from 'react';
import api from '../api.js';

function Login({ onLogin, onSignupClick }) {
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    api.post('/auth/login', { login, password })
      .then(res => {
        onLogin(res.data);
      })
      .catch(err => {
        const data = err.response?.data;
        setError(data?.error || 'Erreur de connexion');
      })
      .finally(() => setLoading(false));
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h2>Connexion</h2>
        <form onSubmit={handleSubmit}>
          <div className="field-group">
            <label htmlFor="login-id">Identifiant</label>
            <input
              id="login-id"
              type="text"
              value={login}
              onChange={e => setLogin(e.target.value)}
              required
              autoFocus
            />
          </div>
          <div className="field-group">
            <label htmlFor="login-pwd">Mot de passe</label>
            <input
              id="login-pwd"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>
          {error && <p className="error-msg">{error}</p>}
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>
        <p className="auth-switch">
          Pas encore membre ?{' '}
          <button className="link-btn" onClick={onSignupClick}>
            S'inscrire
          </button>
        </p>
      </div>
    </div>
  );
}

export default Login;
