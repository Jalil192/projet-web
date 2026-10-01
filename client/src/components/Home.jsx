import { useState } from 'react';
import UserBanner from './UserBanner.jsx';
import Forum from './Forum.jsx';
import MessagesPrives from './MessagesPrives.jsx';
import Recherche from './Recherche.jsx';
import Profile from './Profile.jsx';
import ValidationInscription from './ValidationInscription.jsx';

function Home({ user }) {
  const [activeSection, setActiveSection] = useState('forum-ouvert');

  const renderSection = () => {
    switch (activeSection) {
      case 'forum-ouvert':
        return <Forum user={user} forumType="ouvert" />;
      case 'forum-ferme':
        return user.isAdmin
          ? <Forum user={user} forumType="ferme" />
          : <p className="error-msg">Accès réservé aux administrateurs.</p>;
      case 'messages-prives':
        return <MessagesPrives user={user} />;
      case 'recherche':
        return <Recherche user={user} />;
      case 'profil':
        return <Profile user={user} />;
      case 'validation':
        return user.isAdmin
          ? <ValidationInscription user={user} />
          : <p className="error-msg">Accès réservé aux administrateurs.</p>;
      default:
        return <Forum user={user} forumType="ouvert" />;
    }
  };

  return (
    <div className="home-layout">
      <UserBanner
        user={user}
        activeSection={activeSection}
        onSectionChange={setActiveSection}
      />
      <main className="home-main">
        {renderSection()}
      </main>
    </div>
  );
}

export default Home;
