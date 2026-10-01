import api from '../api.js';

function Logout({ onLogout }) {
  const handleLogout = () => {
    api.post('/auth/logout')
      .then(() => onLogout())
      .catch(() => onLogout()); // on déconnecte côté client dans tous les cas
  };

  return (
    <button className="btn-logout" onClick={handleLogout}>
      Se déconnecter
    </button>
  );
}

export default Logout;
