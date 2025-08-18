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
    </>
  );
};

export default ChatMessages;
