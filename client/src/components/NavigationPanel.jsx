import Logout from './Logout.jsx';

function NavigationPanel({ user, onLoginClick, onSignupClick, onLogout }) {
  return (
    <header className="nav-panel">
      <div className="nav-brand">
        <h1>Organiz'Asso</h1>
        <p className="nav-tagline">Forum associatif</p>
      </div>
      <nav className="nav-auth">
        {user ? (
          <div className="nav-user">
            <span className="nav-welcome">Bonjour, {user.firstName} !</span>
            <Logout onLogout={onLogout} />
          </div>
        ) : (
          <div className="nav-buttons">
            <button className="btn-secondary" onClick={onLoginClick}>
              Se connecter
            </button>
            <button className="btn-primary" onClick={onSignupClick}>
              S'inscrire
            </button>
          </div>
        )}
      </nav>
    </header>
  );
}

export default NavigationPanel;
