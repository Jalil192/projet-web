import { useState } from 'react';
import api from '../api.js';

function Signup({ onSignupSuccess, onLoginClick }) {
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    login: '',
    password: '',
    passwordConfirm: ''
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError(null);

    if (form.password !== form.passwordConfirm) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }

    setLoading(true);
    api.post('/auth/signup', form)
      .then(() => onSignupSuccess())
      .catch(err => setError(err.response?.data?.error || 'Erreur lors de l\'inscription'))
      .finally(() => setLoading(false));
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h2>Inscription</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="field-group">
              <label htmlFor="signup-firstname">Prénom</label>
              <input
                id="signup-firstname"
                name="firstName"
                type="text"
                value={form.firstName}
                onChange={handleChange}
                required
              />
            </div>
            <div className="field-group">
              <label htmlFor="signup-lastname">Nom</label>
              <input
                id="signup-lastname"
                name="lastName"
                type="text"
                value={form.lastName}
                onChange={handleChange}
                required
              />
            </div>
          </div>
          <div className="field-group">
            <label htmlFor="signup-login">Identifiant</label>
            <input
              id="signup-login"
              name="login"
              type="text"
              value={form.login}
              onChange={handleChange}
              required
              autoComplete="username"
            />
          </div>
          <div className="field-group">
            <label htmlFor="signup-pwd">Mot de passe <small>(min. 6 caractères)</small></label>
            <input
              id="signup-pwd"
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              required
              minLength={6}
            />
          </div>
          <div className="field-group">
            <label htmlFor="signup-confirm">Confirmer le mot de passe</label>
            <input
              id="signup-confirm"
              name="passwordConfirm"
              type="password"
              value={form.passwordConfirm}
              onChange={handleChange}
              required
            />
          </div>
          {error && <p className="error-msg">{error}</p>}
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Inscription...' : 'S\'inscrire'}
          </button>
        </form>
        <p className="auth-switch">
          Déjà membre ?{' '}
          <button className="link-btn" onClick={onLoginClick}>
            Se connecter
          </button>
        </p>
      </div>
    </div>
  );
}

export default Signup;
