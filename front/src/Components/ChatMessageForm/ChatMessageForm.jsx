import React from "react";

const ChatMessageForm = () => {
  return (
    <>
      <form onSubmit={handleSubmit}>
        {/* Ici input select pour changer de Character (c'est un enum côté symfony) */}
        {/* Ici input text pour le contenu du message */}
        {/* Ici le bouton pour envoyer */}
      </form>
    </>
  );
};

export default ChatMessageForm;
