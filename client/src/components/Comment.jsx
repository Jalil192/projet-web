import AdminBadge from './AdminBadge.jsx';
import api from '../api.js';

function Comment({ comment, user, onDelete }) {
  const canDelete = user && (user.id === comment.authorId || user.isAdmin);

  const handleDelete = () => {
    if (!window.confirm('Supprimer ce commentaire ?')) return;
    api.delete(`/messages/${comment._id}`)
      .then(() => onDelete(comment._id))
      .catch(err => console.error(err));
  };

  const formatDate = (d) =>
    new Date(d).toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' });

  return (
    <div className="comment">
      <div className="comment-header">
        <span className="comment-author">
          {comment.authorFirstName} {comment.authorLastName}
          <AdminBadge isAdmin={comment.authorIsAdmin} />
        </span>
        <span className="comment-date">{formatDate(comment.createdAt)}</span>
        {canDelete && (
          <button className="delete-btn" onClick={handleDelete} title="Supprimer">✕</button>
        )}
      </div>
      <p className="comment-content">{comment.content}</p>
    </div>
  );
}

export default Comment;
