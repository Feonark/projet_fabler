import { useEffect, useState, useRef } from "react";
import ChatMessages from "../../Components/ChatMessages/ChatMessages";
import { useParams, Link, useNavigate } from "react-router";
import { useAuth } from "../../Contexts/AuthContext";
import {
  Users,
  MessageCircle,
  DoorOpen,
  SendHorizontal,
  ChevronDown,
  SquarePlus,
} from "lucide-react";
import "./Chat.css";

const Chat = () => {
  const navigate = useNavigate();
  const { storyId } = useParams();
  const { user, token, getUser } = useAuth();
  const [chat, setChat] = useState();
  const [messages, setMessages] = useState([]);
  const [selectedCharacter, setSelectedCharacter] = useState("");
  const [selectedPlace, setSelectedPlace] = useState();
  const [messageContent, setMessageContent] = useState("");
  const [lastMessage, setLastMessage] = useState();
  const [isTyping, setIsTyping] = useState(false);
  const typingTimeout = useRef(null);
  const messagesEndRefMobile = useRef(null);
  const messagesEndRefDesktop = useRef(null);
  const [page, setPage] = useState(1);
  const [itemsPerPage] = useState(50);
  const [totalItems, setTotalItems] = useState(0);
  // juste pour empêcher l’autoscroll quand on ajoute des pages plus anciennes
  const skipScrollRef = useRef(false);

  useEffect(() => {
    if (!token) return;
    getUser();
    fetchMessages();
    fetchChat();

    let es;

    const setupMercure = async () => {
      try {
        // Demande au back de poser le cookie mercureAuthorization
        await fetch(`${import.meta.env.VITE_API_URL}/api/mercure-auth`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` }, // ton JWT utilisateur
          credentials: "include", // accepte le Set-Cookie cross-domain
        });

        const url = new URL("https://mercure.fabler.fr/.well-known/mercure");
        url.searchParams.append(
          "topic",
          `${import.meta.env.VITE_API_URL}/api/chats/${storyId}/messages`
        );
        url.searchParams.append(
          "topic",
          `${import.meta.env.VITE_API_URL}/api/chats/${storyId}`
        );

        es = new EventSource(url.toString(), { withCredentials: true });

        es.onopen = () => console.log("✅ Connexion Mercure établie");
        es.onerror = (err) => {
          console.error(
            "❌ Erreur EventSource:",
            err,
            "readyState=",
            es.readyState
          );
          if (es.readyState === EventSource.CLOSED) {
            console.warn("🔌 Connexion Mercure fermée");
          }
        };
        es.onmessage = (e) => {
          console.log("RAW Mercure event:", e);
          console.log("DATA:", e.data);
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
      } catch (err) {
        console.error("❌ Erreur setup Mercure:", err);
      }
    };

    setupMercure();

    return () => {
      if (es) {
        console.log("🔌 Fermeture connexion Mercure");
        es.close();
      }
    };
  }, [storyId, token]);

  // Deuxième useEffect : abonnement aux events MemberChatStatus
  useEffect(() => {
    if (!token || !chat?.members) return;

    let es;
    (async () => {
      try {
        const url = new URL("https://mercure.fabler.fr/.well-known/mercure");
        chat.members.forEach((member) => {
          if (member.memberChatStatus?.["@id"]) {
            url.searchParams.append(
              "topic",
              `${import.meta.env.VITE_API_URL}${member.memberChatStatus["@id"]}`
            );
          }
        });

        es = new EventSource(url.toString(), { withCredentials: true });
        es.onerror = (err) => {
          console.error(
            "❌ Erreur EventSource:",
            err,
            "readyState=",
            es.readyState
          );
          if (es.readyState === EventSource.CLOSED) {
            console.warn("🔌 Connexion Mercure fermée");
          }
        };
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
                        memberChatStatus: {
                          ...member.memberChatStatus,
                          ...data,
                        },
                      }
                    : member
                ),
              };
            });
          }
        };
      } catch (err) {
        console.error("Erreur abonnement Mercure (MemberChatStatus):", err);
      }
    })();

    return () => es?.close();
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
    if (skipScrollRef.current) {
      skipScrollRef.current = false; // on n’auto-scroll pas cette fois
      return;
    }
    scrollToBottom();
  }, [messages]);

  ////////////////////////////////////////////////////////////////////////////////////////
  // FETCHS
  ////////////////////////////////////////////////////////////////////////////////////////

  const fetchMessages = async () => {
    try {
      const response = await fetch(
        `${
          import.meta.env.VITE_API_URL
        }/api/chats/${storyId}/messages?itemsPerPage=50`,
        {
          headers: {
            Accept: "application/ld+json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        navigate("/notfound");
        throw new Error(`Erreur serveur : ${response.status}`);
      }

      const data = await response.json();

      const firstPage = (data.member || []).reverse(); // du plus ancien au plus récent
      setMessages(firstPage);
      setTotalItems(data.totalItems ?? firstPage.length);
      setPage(1);
    } catch (err) {
      console.error(err);
    }
  };

  const loadNextPage = async () => {
    // Si tout est chargé on fait rien
    if (messages.length >= totalItems) return;

    const nextPage = page + 1;
    skipScrollRef.current = true; // On évite de sauter en bas
    try {
      const response = await fetch(
        `${
          import.meta.env.VITE_API_URL
        }/api/chats/${storyId}/messages?itemsPerPage=${itemsPerPage}&page=${nextPage}`,
        {
          headers: {
            Accept: "application/ld+json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!response.ok) throw new Error(`Erreur serveur : ${response.status}`);

      const data = await response.json();
      const older = (data.member || []).reverse();

      // anti-doublons si des SSE ont ajouté des messages entre-temps
      setMessages((prev) => {
        const seen = new Set(prev.map((m) => m.id));
        const toPrepend = older.filter((m) => !seen.has(m.id));
        return [...toPrepend, ...prev];
      });

      setPage(nextPage);
      if (typeof data.totalItems === "number") setTotalItems(data.totalItems);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchChat = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/chats/${storyId}`,
        {
          headers: {
            Accept: "application/ld+json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        navigate("/notfound");
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
    if (!chat || !user) return;
    const myMember = chat.members?.find(
      (member) => member.memberUser.id === user.id
    );
    if (!myMember) return;
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}${myMember.memberChatStatus["@id"]}`,
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
      await fetch(
        `${import.meta.env.VITE_API_URL}${myMember.memberChatStatus["@id"]}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/merge-patch+json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ isWriting: writing }),
        }
      );
    } catch (err) {
      console.error("Erreur setWritingStatus:", err);
    }
  };

  const updateCurrentPlace = async (placeId) => {
    if (!user) return;

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/chats/${chat.id}`,
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
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/messages`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/ld+json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        throw new Error(`Erreur serveur : ${response.status}`);
      }

      const data = await response.json();

      setMessageContent("");
      setIsTyping(false);
      setWritingStatus(false);
    } catch (error) {
      console.error("Erreur lors de l'envoi du message :", error);
    }
  };

  function scrollToBottom() {
    if (window.innerWidth >= 1224) {
      messagesEndRefDesktop.current?.scrollIntoView({ behavior: "smooth" });
    } else {
      messagesEndRefMobile.current?.scrollIntoView({ behavior: "smooth" });
    }
  }

  ////////////////////////////////////////////////////////////////////////////////////////
  // UI
  ////////////////////////////////////////////////////////////////////////////////////////

  return (
    <div className="chat__supercontainer">
      <div className="chat__container">
        {chat && (
          // HEADER
          <div className="chat__header">
            <div className="chat__actions">
              <Link to={`/stories/${storyId}`} className="btn">
                <DoorOpen className="" />
              </Link>
            </div>
            <div className="chat__general">
              <h1 className="title chat__title">{chat.story?.title}</h1>
              <div className="chat__infos">
                <span className="chat__chip chat__members">
                  <Users className="chip__icon" />
                  <span className="chip__text">
                    {chat.members?.filter((m) => m.accepted === true).length}{" "}
                    roleplayers
                  </span>
                </span>

                <span className="chat__chip chat__onlines">
                  <MessageCircle id="chip__online" className="chip__icon" />
                  <span className="chip__text">
                    {
                      chat.members?.filter((m) => m.memberChatStatus?.online)
                        .length
                    }
                    {" online"}
                  </span>
                </span>
              </div>
            </div>
          </div>
        )}
        {/* ENCART RP BOX */}
        <div className="rpbox__container">
          {chat && (
            <div
              className="rpbox__background"
              style={{
                backgroundImage: `url(${import.meta.env.VITE_API_URL}/${
                  chat.currentPlace?.placeImageUrl
                    ? chat.currentPlace.placeImageUrl
                    : "uploads/banners/banner-default.jpg"
                })`,
              }}
            >
              {lastMessage && (
                <div className="rpbox__message-info">
                  <img
                    src={`${import.meta.env.VITE_API_URL}/${
                      lastMessage.characterAlias?.portraitUrl
                    }`}
                    className="rpbox__img"
                    alt="Character avatar"
                  />
                  <div className="rpbox__message">
                    <span className="rpbox__message-title">
                      {lastMessage.characterAlias?.name}
                    </span>
                    <p className="rpbox__message-content">
                      {lastMessage.content}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
        {/* MESSAGES */}

        <div className="messages__container hidden-desktop">
          {messages.length < totalItems && (
            <button
              className="btn chat-btn__load-previous"
              onClick={loadNextPage}
            >
              Load previous messages
            </button>
          )}

          {/* Messages */}
          <ChatMessages messages={messages} chat={chat} user={user} />
          <div ref={messagesEndRefMobile} />
        </div>
        {/* Is writing indications */}
        {chat &&
          chat.members.some(
            (member) =>
              member.memberUser.id !== user?.id &&
              member.memberChatStatus?.writing === true
          ) && (
            <div className="writing__container hidden-desktop">
              {chat &&
                chat.members
                  .filter(
                    (member) =>
                      member.memberUser.id !== user?.id &&
                      member.memberChatStatus?.writing === true
                  )
                  .map((member) => (
                    <div key={member.id} className="writing__message">
                      <img
                        src={`${import.meta.env.VITE_API_URL}/${
                          member.memberUser?.avatarUrl
                            ? member.memberUser.avatarUrl
                            : "uploads/avatars/avatar-default.jpg"
                        }`}
                        className="writing__userAvi"
                      />
                      <div className="">
                        <span className="writing__content">
                          {member.memberUser.username} is writing...
                        </span>
                      </div>
                    </div>
                  ))}
            </div>
          )}
        {/* INPUTS */}
        <div className="inputs__container">
          <div className="chat__options">
            {/* Select place */}
            {chat && chat.story?.places?.length > 0 && (
              <div className="chat-select__container">
                <label htmlFor="currentPlace" />
                <select
                  id="currentPlace"
                  value={selectedPlace}
                  onChange={(e) => {
                    updateCurrentPlace(e.target.value);
                    setSelectedPlace(e.target.value);
                  }}
                >
                  <option value="" disabled selected hidden>
                    -- Select place --
                  </option>
                  {chat &&
                    chat.story?.places?.map((place) => (
                      <option key={place.id} value={place.id}>
                        {place.title}
                      </option>
                    ))}
                </select>
                <ChevronDown className="chat-select__icon" />
              </div>
            )}
          </div>

          {/* Select character */}
          <div className="chat-response__container">
            {user && user?.characters?.length > 0 ? (
              <div className="chat-select__container">
                <label htmlFor="character" />
                <select
                  id="character"
                  className="character__select"
                  value={selectedCharacter}
                  onChange={(e) => setSelectedCharacter(e.target.value)}
                >
                  <option value="">-- Select character --</option>
                  {user?.characters?.map((character) => (
                    <option key={character.id} value={character.id}>
                      {character.name}
                    </option>
                  ))}
                </select>

                {selectedCharacter ? (
                  <img
                    className="character-select__preview"
                    src={`${import.meta.env.VITE_API_URL}/${
                      user?.characters?.find(
                        (c) => c.id.toString() === selectedCharacter
                      )?.avatarUrl
                    }`}
                    alt="Selected avatar"
                  />
                ) : (
                  <img
                    className="character-select__preview"
                    src={`${
                      import.meta.env.VITE_API_URL
                    }/uploads/avatars/avatar-default.jpg`}
                    alt="Default avatar"
                  />
                )}
                <ChevronDown className="chat-select__icon" />
              </div>
            ) : (
              <div className="chat-select__container">
                <Link
                  className="btn btn-outline test"
                  to={`/profile/characters/new`}
                >
                  <SquarePlus className="btn__icon" />
                  <span className="btn__span">Create character</span>
                </Link>
              </div>
            )}

            {/* Input response */}
            <div className="chat-input__container">
              <input
                type="text"
                placeholder="Type your response here..."
                value={messageContent}
                onChange={(e) => {
                  setMessageContent(e.target.value);

                  if (!isTyping) {
                    setIsTyping(true);
                    setWritingStatus(true);
                  }

                  // Clear l'ancien timer
                  if (typingTimeout.current)
                    clearTimeout(typingTimeout.current);

                  // Après 5s sans frappe on met isWriting à false
                  typingTimeout.current = setTimeout(() => {
                    setIsTyping(false);
                    setWritingStatus(false);
                  }, 5000);
                }}
                onKeyDown={(e) => {
                  if (
                    e.key === "Enter" &&
                    messageContent.trim() &&
                    selectedCharacter
                  ) {
                    handleSend();
                  }
                }}
                disabled={!selectedCharacter}
                className={`input ${
                  messageContent.length > 400 ? "input__error" : ""
                }`}
              />
              <button
                className="input__button"
                onClick={handleSend}
                disabled={!selectedCharacter || !messageContent.trim()}
              >
                <SendHorizontal className="button__icon" />
              </button>
            </div>
          </div>
        </div>
      </div>
      {/*  */}
      {/*  */}
      {/* MESSAGES CONTAINER FOR DESKTOP (THE OTHER ONE IS HIDDEN) */}
      {/*  */}
      {/*  */}
      <div className="messages__container--desktop">
        {/* MESSAGES */}
        <div className="messages__container">
          {messages.length < totalItems && (
            <button
              className="btn chat-btn__load-previous"
              onClick={loadNextPage}
            >
              Load previous messages
            </button>
          )}

          {/* Messages */}
          <ChatMessages messages={messages} chat={chat} user={user} />
          <div ref={messagesEndRefDesktop} />
        </div>
        {/* Is writing indications */}
        {chat &&
          chat.members.some(
            (member) =>
              member.memberUser.id !== user?.id &&
              member.memberChatStatus?.writing === true
          ) && (
            <div className="writing__container">
              {chat &&
                chat.members
                  .filter(
                    (member) =>
                      member.memberUser.id !== user?.id &&
                      member.memberChatStatus?.writing === true
                  )
                  .map((member) => (
                    <div key={member.id} className="writing__message">
                      <img
                        src={`${import.meta.env.VITE_API_URL}/${
                          member.memberUser?.avatarUrl
                            ? member.memberUser?.avatarUrl
                            : "uploads/avatars/avatar-default.jpg"
                        }`}
                        className="writing__userAvi"
                      />
                      <div className="">
                        <span className="writing__content">
                          {member.memberUser.username} is writing...
                        </span>
                      </div>
                    </div>
                  ))}
            </div>
          )}
      </div>
    </div>
  );
};

export default Chat;
