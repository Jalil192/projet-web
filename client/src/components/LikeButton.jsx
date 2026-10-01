import { useState } from 'react';
import api from '../api.js';

function LikeButton({ messageId, initialLikes, currentUserId }) {
  const [liked, setLiked] = useState(
    currentUserId ? initialLikes.includes(currentUserId) : false
  );
  const [count, setCount] = useState(initialLikes.length);
  const [loading, setLoading] = useState(false);

  const handleLike = () => {
    if (!currentUserId || loading) return;
    setLoading(true);
    api.post(`/messages/${messageId}/like`)
      .then(res => {
        setLiked(res.data.liked);
        setCount(res.data.count);
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  };

  return (
    <button
      className={`like-btn${liked ? ' liked' : ''}`}
      onClick={handleLike}
      disabled={!currentUserId || loading}
      title={liked ? 'Ne plus aimer' : 'Aimer'}
    >
      ♥ {count}
    </button>
  );
}

export default LikeButton;
