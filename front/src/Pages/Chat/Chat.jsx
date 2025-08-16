import { useEffect, useState } from "react";
import ChatMessage from "../../Components/ChatMessage/ChatMessage";
import { useParams } from "react-router";
import { useAuth } from "../../Contexts/AuthContext";

const Chat = () => {
  const { storyId } = useParams();
  const { user, token } = useAuth();
  const [chat, setChat] = useState();
  const [messages, setMessages] = useState([]);
  const [selectedCharacter, setSelectedCharacter] = useState("");
  const [selectedPlace, setSelectedPlace] = useState();
  const [messageContent, setMessageContent] = useState("");
  const [lastMessage, setLastMessage] = useState();

  useEffect(() => {
    if (!token) return;
    fetchMessages();
    fetchChat();

    const url = new URL("http://localhost/.well-known/mercure");
    url.searchParams.append(
      "topic",
      `http://localhost:8000/api/chats/${storyId}/messages`
    );
    url.searchParams.append(
      "topic",
      `http://localhost:8000/api/chats/${storyId}`
    );

    const es = new EventSource(url);
    es.onmessage = (e) => {
      const data = JSON.parse(e.data);
      if (data["@type"] === "Message") {
        setMessages((prev) => [...prev, data]);
        setLastMessage(data);
      } else if (data["@type"] === "Chat") {
        setChat(data);
        if (data.currentPlace) {
          setSelectedPlace(data.currentPlace.id.toString());
        }
      }
    };

    return () => es.close();
  }, [storyId, token]);

  ////////////////////////////////////////////////////////////////////////////////////////
  // FETCHS
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
      setMessages(data.member);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchChat = async () => {
    try {
      const response = await fetch(
        `http://localhost:8000/api/chats/${storyId}`,
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
      setChat(data);

      if (data.currentPlace) {
        setSelectedPlace(data.currentPlace.id.toString());
      }
    } catch (err) {
      console.error(err);
    }
  };

  ////////////////////////////////////////////////////////////////////////////////////////
  // CRUD
  ////////////////////////////////////////////////////////////////////////////////////////

  const updateCurrentPlace = async (placeId) => {
    if (!user) return;

    try {
      const response = await fetch(
        `http://localhost:8000/api/chats/${chat.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/merge-patch+json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            currentPlace: `/api/places/${placeId}`,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Erreur serveur : ${response.status}`);
      }

      const data = await response.json();
    } catch (err) {
      console.error("Erreur lors de la mise à jour du lieu :", err);
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
      chat: `/api/chats/${storyId}`,
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

      setMessageContent("");
    } catch (error) {
      console.error("Erreur lors de l'envoi du message :", error);
    }
  };

  return (
    <div className="chat">
      <h1>Page Chat de la Story {storyId}</h1>
      {/* ENCART RP BOX */}
      RP BOX
      <div className="">
        {chat && (
          <div className="">
            <h2>Current place</h2>
            <img
              src={`http://localhost:8000/${chat.currentPlace?.placeImageUrl}`}
              alt="Current place image"
              style={{
                width: "50px",
                maxHeight: "160px",
                objectFit: "cover",
              }}
            />
          </div>
        )}
        {lastMessage && (
          <div className="">
            <img
              src={`http://localhost:8000/${lastMessage.characterAlias?.avatarUrl}`}
              alt="Character avatar"
              style={{
                width: "50px",
                maxHeight: "160px",
                objectFit: "cover",
              }}
            />
            <div className="">
              <h1 className="">{lastMessage.characterAlias?.name}</h1>
              <p className="">{lastMessage.content}</p>
            </div>
          </div>
        )}
      </div>
      {/* MESSAGES */}
      <div className="container__messages">
        <p>Les messages : </p>
        {messages &&
          messages.map((message) => (
            <div key={message.id}>
              <div className="">
                <div className="">
                  <img
                    src={`http://localhost:8000/${message.author?.memberUser?.avatarUrl}`}
                    alt=""
                    style={{
                      width: "40px",
                      maxHeight: "40px",
                      objectFit: "cover",
                    }}
                  />
                  <img
                    src={`http://localhost:8000/${message.characterAlias?.avatarUrl}`}
                    alt=""
                    style={{
                      width: "40px",
                      maxHeight: "40px",
                      objectFit: "cover",
                    }}
                  />
                  <h3 className="">{message.characterAlias?.name}</h3>
                  <span className="">
                    {new Date(message.createdAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
                <p className="">{message.content}</p>
              </div>
            </div>
          ))}
      </div>
      {/* INPUTS */}
      <div className="">
        <label htmlFor="currentPlace">Select a place</label>
        <select
          id="currentPlace"
          value={selectedPlace}
          onChange={(e) => {
            updateCurrentPlace(e.target.value);
            setSelectedPlace(e.target.value);
            console.log("Selected place:", e.target.value);
          }}
        >
          <option value="">-- Select --</option>
          {chat &&
            chat.story?.places?.map((place) => (
              <option key={place.id} value={place.id}>
                {place.title}
              </option>
            ))}
        </select>
      </div>
      <div className="">
        <label htmlFor="character">Choose a character :</label>
        <select
          id="character"
          value={selectedCharacter}
          onChange={(e) => setSelectedCharacter(e.target.value)}
        >
          <option value="">-- Select --</option>
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
