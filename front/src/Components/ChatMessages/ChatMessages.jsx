import "./ChatMessages.css";

const ChatMessages = ({ messages, chat, user }) => {
  return (
    <>
      {messages &&
        messages.map((message, index) => {
          const prevMessage = messages[index - 1];
          const sameCharacter =
            prevMessage &&
            prevMessage.characterAlias?.id === message.characterAlias?.id;

          return (
            <div key={message.id} className="message__container">
              {!sameCharacter && (
                <div className="message__left">
                  <img
                    src={`http://localhost:8000/${message.characterAlias?.avatarUrl}`}
                    className="message__charaAvi"
                  />
                </div>
              )}

              <div className="message__right">
                {!sameCharacter && (
                  <div className="message__header">
                    <span className="message__characterName">
                      {message.characterAlias?.name}
                    </span>
                    <span className="message__createdAt">
                      {new Date(message.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                )}
                <div className="message__body">
                  {sameCharacter && <div className="message__empty"></div>}
                  <p className="message__content">{message.content}</p>
                </div>
              </div>
            </div>
          );
        })}
      {/* INDICATION IS WRITING */}
      {chat && (
        <div className="writing__container">
          {chat &&
            chat.members
              .filter(
                (m) =>
                  m.memberUser.id !== user?.id &&
                  m.memberChatStatus?.writing === true
              )
              .map((m) => (
                <p key={m.id}>
                  {m.memberUser?.username} est en train d’écrire...
                </p>
              ))}
        </div>
      )}
    </>
  );
};

export default ChatMessages;
