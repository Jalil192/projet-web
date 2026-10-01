import Logout from './Logout.jsx';

function SignupInProgress({ onLogout }) {
  return (
    <div className="auth-container">
      <div className="auth-box pending-box">
        <div className="pending-icon">⏳</div>
        <h2>Inscription en attente</h2>
        <p>
          Votre demande d'inscription a bien été envoyée. Un administrateur doit
          valider votre compte avant que vous puissiez accéder au forum.
        </p>
        <p>Vous recevrez un accès une fois votre inscription approuvée.</p>
        <Logout onLogout={onLogout} />
      </div>
    </div>
  );
}

export default SignupInProgress;
