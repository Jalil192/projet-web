import User from './User.jsx';

const SECTIONS = [
  { key: 'forum-ouvert', label: '🗣 Forum ouvert', adminOnly: false },
  { key: 'forum-ferme', label: '🔒 Forum fermé', adminOnly: true },
  { key: 'messages-prives', label: '✉ Messages privés', adminOnly: false },
  { key: 'recherche', label: '🔍 Recherche', adminOnly: false },
  { key: 'profil', label: '👤 Mon profil', adminOnly: false },
  { key: 'validation', label: '✅ Validations', adminOnly: true }
];

function UserBanner({ user, activeSection, onSectionChange }) {
  const visibleSections = SECTIONS.filter(s => !s.adminOnly || user.isAdmin);

  return (
    <aside className="user-banner">
      <User user={user} />
      <nav className="user-nav">
        {visibleSections.map(s => (
          <button
            key={s.key}
            className={`nav-item${activeSection === s.key ? ' active' : ''}`}
            onClick={() => onSectionChange(s.key)}
          >
            {s.label}
          </button>
        ))}
      </nav>
    </aside>
  );
}

export default UserBanner;
