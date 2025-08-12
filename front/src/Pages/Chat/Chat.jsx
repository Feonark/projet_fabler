import { useEffect, useState } from "react";
import ChatMessage from "../../Components/ChatMessage/ChatMessage";
import { useParams } from "react-router";
import { useAuth } from "../../Contexts/AuthContext";

const Chat = () => {
  const { storyId } = useParams();
  const { user, token } = useAuth();
  const [messages, setMessages] = useState([]);
  const [selectedCharacter, setSelectedCharacter] = useState("");
  const [messageContent, setMessageContent] = useState("");

  useEffect(() => {
    console.log("User:", user);
  }, [user]);

  useEffect(() => {
    if (!token) return;
    fetchMessages();

    const url = new URL("http://localhost/.well-known/mercure");
    url.searchParams.append(
      "topic",
      `http://localhost:8000/api/chats/${storyId}/messages`
    );

    const es = new EventSource(url);
    es.onmessage = (e) => {
      const msg = JSON.parse(e.data);
      setMessages((prev) => [...prev, msg]);
    };

    return () => es.close();
  }, [storyId, token]);

  ////////////////////////////////////////////////////////////////////////////////////////
  // FETCH MESSAGES
  ////////////////////////////////////////////////////////////////////////////////////////

  const fetchMessages = async () => {
    try {
      const response = await fetch(
        `http://localhost:8000/api/chats/${storyId}/messages?order[createdAt]=asc`,
        {
          headers: {
            Accept: "application/ld+json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Erreur serveur : ${response.status}`);
      }

      const data = await response.json();
      const list = data.member;
      setMessages(list);
    } catch (err) {
      console.error(err);
    }
  };

  ////////////////////////////////////////////////////////////////////////////////////////
  // HANDLE
  ////////////////////////////////////////////////////////////////////////////////////////

  const handleSend = async () => {
    if (!selectedCharacter || !messageContent.trim()) return;

    const payload = {
      content: messageContent,
      characterAlias: `/api/characters/${selectedCharacter}`,
      chat: `/api/chats/${storyId}`, // Ici changer par le chatId même si c'est pareil que StoryID
    };

    try {
      const response = await fetch("http://localhost:8000/api/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/ld+json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`Erreur serveur : ${response.status}`);
      }

      const data = await response.json();
      console.log("Message envoyé :", data);

      setMessageContent(""); // reset après envoi
    } catch (error) {
      console.error("Erreur lors de l'envoi du message :", error);
    }
  };

  return (
    <div className="chat">
      <h1>Page Chat de la Story {storyId}</h1>

      {/* MESSAGES */}
      <div className="container__messages">
        <p>Les messages : </p>
        {messages &&
          messages.map((message) => (
            <div key={message.id}>
              {message.characterAlias.name} : {message.content}
            </div>
          ))}
      </div>

      {/* INPUTS */}
      <div className="message__select">
        <label htmlFor="character">Choisir un personnage :</label>
        <select
          id="character"
          value={selectedCharacter}
          onChange={(e) => setSelectedCharacter(e.target.value)}
        >
          <option value="">-- Sélectionner --</option>
          {user &&
            user.characters?.map((character) => (
              <option key={character.id} value={character.id}>
                {character.name}
              </option>
            ))}
        </select>
      </div>

      <div className="message__input">
        <input
          type="text"
          placeholder="Écrire un message..."
          value={messageContent}
          onChange={(e) => setMessageContent(e.target.value)}
          disabled={!selectedCharacter}
        />
        <button
          onClick={handleSend}
          disabled={!selectedCharacter || !messageContent.trim()}
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default Chat;
