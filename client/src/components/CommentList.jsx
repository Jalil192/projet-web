import { useState, useEffect } from 'react';
import Comment from './Comment.jsx';
import MessageForm from './MessageForm.jsx';
import api from '../api.js';

function CommentList({ messageId, forumType, user }) {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    api.get(`/messages/${messageId}/comments`)
      .then(res => setComments(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, [messageId]);

  const handleNewComment = (newComment) => {
    setComments(prev => [...prev, newComment]);
    setShowForm(false);
  };

  const handleDelete = (id) => {
    setComments(prev => prev.filter(c => c._id !== id));
  };

  if (loading) return <p className="loading">Chargement des commentaires...</p>;

  return (
    <div className="comment-list">
      {comments.length === 0 && <p className="no-comments">Aucun commentaire</p>}
      {comments.map(c => (
        <Comment key={c._id} comment={c} user={user} onDelete={handleDelete} />
      ))}
      {user && (
        <div className="add-comment">
          {showForm ? (
            <MessageForm
              forumType={forumType}
              parentId={messageId}
              onSubmit={handleNewComment}
              onCancel={() => setShowForm(false)}
              placeholder="Écrire un commentaire..."
            />
          ) : (
            <button className="reply-btn" onClick={() => setShowForm(true)}>
              + Répondre
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default CommentList;
