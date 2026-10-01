import { useState, useEffect } from 'react';
import NavigationPanel from './NavigationPanel.jsx';
import Login from './Login.jsx';
import Signup from './Signup.jsx';
import SignupInProgress from './SignupInProgress.jsx';
import Home from './Home.jsx';
import ForumPublic from './ForumPublic.jsx';
import api from '../api.js';

// Vues possibles
const VIEWS = {
  LOADING: 'loading',
  PUBLIC: 'public',
  LOGIN: 'login',
  SIGNUP: 'signup',
  PENDING: 'pending',
  HOME: 'home'
};

function App() {
  const [user, setUser] = useState(null);
  const [view, setView] = useState(VIEWS.LOADING);

  // Restaurer la session au chargement
  useEffect(() => {
    api.get('/auth/me')
      .then(res => {
        setUser(res.data);
        setView(VIEWS.HOME);
      })
      .catch(() => {
        setView(VIEWS.PUBLIC);
      });
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
    setView(VIEWS.HOME);
  };

  const handleLogout = () => {
    setUser(null);
    setView(VIEWS.PUBLIC);
  };

  const handleSignupSuccess = () => {
    // Après inscription réussie, afficher la page d'attente
    setView(VIEWS.PENDING);
  };

  if (view === VIEWS.LOADING) {
    return (
      <div className="loading-screen">
        <p>Chargement...</p>
      </div>
    );
  }

  return (
    <div className="app">
      <NavigationPanel
        user={user}
        onLoginClick={() => setView(VIEWS.LOGIN)}
        onSignupClick={() => setView(VIEWS.SIGNUP)}
        onLogout={handleLogout}
      />

      <div className="app-content">
        {view === VIEWS.PUBLIC && (
          <ForumPublic onLoginClick={() => setView(VIEWS.LOGIN)} />
        )}

        {view === VIEWS.LOGIN && (
          <Login
            onLogin={handleLogin}
            onSignupClick={() => setView(VIEWS.SIGNUP)}
          />
        )}

        {view === VIEWS.SIGNUP && (
          <Signup
            onSignupSuccess={handleSignupSuccess}
            onLoginClick={() => setView(VIEWS.LOGIN)}
          />
        )}

        {view === VIEWS.PENDING && (
          <SignupInProgress onLogout={handleLogout} />
        )}

        {view === VIEWS.HOME && user && (
          <Home user={user} />
        )}
      </div>
    </div>
  );
}

export default App;
