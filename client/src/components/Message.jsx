import { useState } from 'react';
import AdminBadge from './AdminBadge.jsx';
import LikeButton from './LikeButton.jsx';
import ReportButton from './ReportButton.jsx';
import CommentList from './CommentList.jsx';
import api from '../api.js';

function Message({ message, user, onDelete }) {
  const [showComments, setShowComments] = useState(false);

  const canDelete = user && (user.id === message.authorId || user.isAdmin);

  const handleDelete = () => {
    if (!window.confirm('Supprimer ce message et ses commentaires ?')) return;
    api.delete(`/messages/${message._id}`)
      .then(() => onDelete(message._id))
      .catch(err => console.error(err));
  };

  const formatDate = (d) =>
    new Date(d).toLocaleString('fr-FR', { dateStyle: 'medium', timeStyle: 'short' });

  return (
    <article className="message">
      <div className="message-header">
        <div className="message-author-info">
          <span className="message-author">
            {message.authorFirstName} {message.authorLastName}
          </span>
          <span className="message-login">@{message.authorLogin}</span>
          <AdminBadge isAdmin={message.authorIsAdmin} />
        </div>
        <span className="message-date">{formatDate(message.createdAt)}</span>
      </div>

      <p className="message-content">{message.content}</p>

      <div className="message-actions">
        <LikeButton
          messageId={message._id}
          initialLikes={message.likes || []}
          currentUserId={user?.id}
        />
        <button
          className="comments-toggle-btn"
          onClick={() => setShowComments(!showComments)}
        >
          💬 Commentaires {showComments ? '▲' : '▼'}
        </button>
        {user && user.id !== message.authorId && (
          <ReportButton messageId={message._id} />
        )}
        {canDelete && (
          <button className="delete-btn" onClick={handleDelete}>
            🗑 Supprimer
          </button>
        )}
      </div>

      {showComments && (
        <div className="message-comments">
          <CommentList
            messageId={message._id}
            forumType={message.forumType}
            user={user}
          />
        </div>
      )}
    </article>
  );
}

export default Message;
