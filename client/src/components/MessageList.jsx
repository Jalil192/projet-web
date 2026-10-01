import Message from './Message.jsx';

function MessageList({ messages, user, onRefresh }) {
  const handleDelete = (id) => {
    onRefresh(messages.filter(m => m._id !== id));
  };

  if (messages.length === 0) {
    return <p className="no-messages">Aucun message dans ce forum.</p>;
  }

  return (
    <div className="message-list">
      {messages.map(msg => (
        <Message
          key={msg._id}
          message={msg}
          user={user}
          onDelete={handleDelete}
        />
      ))}
    </div>
  );
}

export default MessageList;
