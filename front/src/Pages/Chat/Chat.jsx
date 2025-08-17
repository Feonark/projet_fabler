import { useEffect, useState, useRef } from "react";
import ChatMessages from "../../Components/ChatMessages/ChatMessages";
import { useParams } from "react-router";
import { useAuth } from "../../Contexts/AuthContext";
import "./Chat.css";

const Chat = () => {
  const { storyId } = useParams();
  const { user, token } = useAuth();
  const [chat, setChat] = useState();
  const [messages, setMessages] = useState([]);
  const [selectedCharacter, setSelectedCharacter] = useState("");
  const [selectedPlace, setSelectedPlace] = useState();
  const [messageContent, setMessageContent] = useState("");
  const [lastMessage, setLastMessage] = useState();
  const [isTyping, setIsTyping] = useState(false);
  const typingTimeout = useRef(null);
  const messagesEndRef = useRef(null);

  // Premier useEffect pour l'abonnement aux events Chat + Messages
  // Se lance au montage du composant
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

  // Deuxième useEffect, séparé du premier car on écoute Chat lorsqu'il a fini d'être fetch (plus précisément ses membres)
  // On s'abonne aux events de MemberChatStatus
  useEffect(() => {
    if (!token || !chat?.members) return;

    const url = new URL("http://localhost/.well-known/mercure");
    chat.members.forEach((member) => {
      if (member.memberChatStatus?.["@id"]) {
        url.searchParams.append(
          "topic",
          `http://localhost:8000${member.memberChatStatus["@id"]}`
        );
      }
    });

    const es = new EventSource(url);
    es.onmessage = (e) => {
      const data = JSON.parse(e.data);
      if (data["@type"] === "MemberChatStatus") {
        setChat((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            members: prev.members.map((member) =>
              member.memberChatStatus?.id === data.id
                ? {
                    ...member,
                    memberChatStatus: { ...member.memberChatStatus, ...data },
                  }
                : member
            ),
          };
        });
      }
    };

    return () => es.close();
  }, [token, chat?.members?.map((m) => m.memberChatStatus?.["@id"]).join(",")]);

  // Troisième useEffect pour la gestion online/offline
  // Quand le chat & l'user sont bien présents, on passe le statut à online
  // Quand l'user quitte la page, on passe le statut à offline
  useEffect(() => {
    if (chat && user && token) {
      setOnlineStatus(true);
    }

    return () => {
      if (user && token) {
        setOnlineStatus(false);
      }
    };
  }, [chat?.id, user?.id, token]);

  // Dernier useEffect pour le scroll automatique du chat lors du post d'un nouveau message
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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

  const setOnlineStatus = async (online) => {
    console.log("Called with:", online);
    if (!chat || !user) return;
    const myMember = chat.members?.find(
      (member) => member.memberUser.id === user.id
    );
    console.log("N+1");
    if (!myMember) return;
    console.log("N+2");
    try {
      const response = await fetch(
        `http://localhost:8000${myMember.memberChatStatus["@id"]}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/merge-patch+json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ isOnline: online }),
        }
      );

      if (!response.ok) {
        throw new Error(`Erreur serveur : ${response.status}`);
      }

      const data = await response.json();
      console.log("Et là ça met :", data);

      console.log("N+3");
    } catch (err) {
      console.error("Erreur setOnlineStatus:", err);
    }
  };

  const setWritingStatus = async (writing) => {
    if (!chat || !user) return;
    const myMember = chat.members?.find(
      (member) => member.memberUser.id === user.id
    );
    if (!myMember) return;

    try {
      await fetch(`http://localhost:8000${myMember.memberChatStatus["@id"]}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/merge-patch+json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ isWriting: writing }),
      });
    } catch (err) {
      console.error("Erreur setWritingStatus:", err);
    }
  };

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
      setIsTyping(false);
      setWritingStatus(false);
    } catch (error) {
      console.error("Erreur lors de l'envoi du message :", error);
    }
  };

  function scrollToBottom() {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }

  ////////////////////////////////////////////////////////////////////////////////////////
  // UI
  ////////////////////////////////////////////////////////////////////////////////////////

  return (
    <div className="chat__container">
      <h1>Page Chat de la Story {storyId}</h1>
      {chat && (
        <div className="">
          <span className="">{chat.members?.length} roleplayers</span>
          <h2 className="">
            {chat.members?.filter((m) => m.memberChatStatus?.online).length}
            roleplayer(s) online
          </h2>
        </div>
      )}
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
      <div className="messages__container">
        <ChatMessages messages={messages} chat={chat} user={user} />
        <div ref={messagesEndRef} />
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
          onChange={(e) => {
            setMessageContent(e.target.value);

            if (!isTyping) {
              setIsTyping(true);
              setWritingStatus(true);
            }

            // Clear l'ancien timer
            if (typingTimeout.current) clearTimeout(typingTimeout.current);

            // Après 5s sans frappe on met isWriting à false
            typingTimeout.current = setTimeout(() => {
              setIsTyping(false);
              setWritingStatus(false);
            }, 5000);
          }}
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
