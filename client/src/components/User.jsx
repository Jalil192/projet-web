import AdminBadge from './AdminBadge.jsx';

function User({ user }) {
  if (!user) return null;

  const initiale = (user.firstName?.[0] || '?').toUpperCase();

  return (
    <div className="user-card">
      <div className="user-avatar">{initiale}</div>
      <div className="user-info">
        <p className="user-fullname">{user.firstName} {user.lastName}</p>
        <p className="user-login">@{user.login}</p>
        <AdminBadge isAdmin={user.isAdmin} />
      </div>
    </div>
  );
}

export default User;
