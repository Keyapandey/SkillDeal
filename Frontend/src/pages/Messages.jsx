import DashboardNavbar from "../components/DashboardNavbar";
import {
  getMessages,
  sendMessage,
  getConversations
} from "../api/message";

import "../css/messages.css";
import "../css/activeExchanges.css";

import { useEffect, useState } from "react";

import {
  getIncomingRequests,
  acceptExchangeRequest,
  declineExchangeRequest,
  scheduleExchange
} from "../api/exchange";

import {
  Paperclip,
  Smile,
  CalendarDays,
  Clock,
  X
} from "lucide-react";


function Messages() {

  const [activeChat, setActiveChat] = useState(null);

  const [requests, setRequests] = useState([]);

  const [messages, setMessages] = useState([]);

  const [messageText, setMessageText] = useState("");

  const [conversations, setConversations] = useState([]);

  const [showSchedule, setShowSchedule] = useState(false);

  const [scheduleExchangeId, setScheduleExchangeId] = useState(null);

  const [scheduleData, setScheduleData] = useState({
    date: "",
    time: "",
    days: "1"
  });


  /* =========================================
     FORMAT EXISTING SCHEDULE
  ========================================= */

  const formatScheduledDateTime = (scheduledAt) => {

    if (!scheduledAt) {
      return {
        date: "",
        time: ""
      };
    }

    const date = new Date(scheduledAt);

    if (Number.isNaN(date.getTime())) {
      return {
        date: "",
        time: ""
      };
    }

    return {
      date: date.toISOString().split("T")[0],

      time: date.toTimeString().slice(0, 5)
    };
  };


  /* =========================================
     FETCH CONVERSATIONS
  ========================================= */

  useEffect(() => {

    const fetchConversations = async () => {

      try {

        const data = await getConversations();

        console.log("CONVERSATIONS:", data);

        setConversations(data.conversations || []);

      } catch (error) {

        console.error(
          "Failed to fetch conversations:",
          error
        );

      }

    };

    fetchConversations();

  }, []);


  /* =========================================
     FETCH MESSAGES
  ========================================= */

  useEffect(() => {

    const fetchMessages = async () => {

      if (!activeChat) {
        return;
      }

      try {

        const data = await getMessages(activeChat);

        console.log("MESSAGES:", data);

        setMessages(
          (data.messages || []).map((msg) => ({
            type:
              msg.senderId === activeChat
                ? "received"
                : "sent",

            text: msg.content,

            time: new Date(
              msg.createdAt
            ).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit"
            })
          }))
        );

      } catch (error) {

        console.error(
          "Failed to fetch messages:",
          error
        );

        setMessages([]);

      }

    };

    fetchMessages();

  }, [activeChat]);


  /* =========================================
     SET FIRST CHAT
  ========================================= */

  useEffect(() => {

    if (
      conversations.length > 0 &&
      !activeChat
    ) {

      setActiveChat(
        conversations[0].user.id
      );

    }

  }, [conversations, activeChat]);


  /* =========================================
     FETCH REQUESTS
  ========================================= */

  useEffect(() => {

    const fetchRequests = async () => {

      try {

        const data =
          await getIncomingRequests();

        setRequests(
          data.requests || []
        );

      } catch (error) {

        console.error(
          "Failed to fetch requests:",
          error
        );

      }

    };

    fetchRequests();

  }, []);


  /* =========================================
     ACCEPT REQUEST
  ========================================= */

  const handleAccept = async (requestId) => {

    try {

      const data =
        await acceptExchangeRequest(
          requestId
        );

      alert(data.message);

      setRequests((prev) =>
        prev.filter(
          (request) =>
            request.id !== requestId
        )
      );

    } catch (error) {

      alert(error.message);

    }

  };


  /* =========================================
     DECLINE REQUEST
  ========================================= */

  const handleDecline = async (requestId) => {

    try {

      const data =
        await declineExchangeRequest(
          requestId
        );

      alert(data.message);

      setRequests((prev) =>
        prev.filter(
          (request) =>
            request.id !== requestId
        )
      );

    } catch (error) {

      alert(error.message);

    }

  };


  /* =========================================
     CURRENT CONVERSATION
  ========================================= */

  const currentConversation =
    conversations.find(
      (conversation) =>
        conversation.user.id === activeChat
    );


  const currentChat =
    currentConversation
      ? {
          name:
            currentConversation.user.name,

          initials:
            currentConversation.user.name
              .split(" ")
              .map((name) => name[0])
              .join("")
              .slice(0, 2)
              .toUpperCase(),

          teaches: "",

          wants: ""
        }

      : null;


  /* =========================================
     NO CHAT
  ========================================= */

  if (!currentChat) {

    return (
      <>
        <DashboardNavbar />

        <section className="messages-page">

          <div className="messages-sidebar">

            <h3 className="sidebar-heading">
              Requests
            </h3>

            <p>
              No conversations yet.
            </p>

          </div>

        </section>
      </>
    );

  }


  /* =========================================
     SKILLS
  ========================================= */

  const teaches =
    currentConversation?.user.skills
      ?.filter(
        (item) =>
          item.type === "TEACH"
      )
      .map(
        (item) =>
          item.skill.name
      )
      .join(", ");


  const wants =
    currentConversation?.user.skills
      ?.filter(
        (item) =>
          item.type === "LEARN"
      )
      .map(
        (item) =>
          item.skill.name
      )
      .join(", ");


  /* =========================================
     SCHEDULE INPUT CHANGE
  ========================================= */

  const handleScheduleChange = (e) => {

    const {
      name,
      value
    } = e.target;

    setScheduleData((prev) => ({
      ...prev,
      [name]: value
    }));

  };


  /* =========================================
     SCHEDULE
  ========================================= */

  const handleSchedule = async (e) => {

    e.preventDefault();

    if (
      !scheduleData.date ||
      !scheduleData.time ||
      !scheduleData.days ||
      !scheduleExchangeId
    ) {

      return;

    }

    try {

      const scheduledAt =
        `${scheduleData.date}T${scheduleData.time}`;

      const data =
        await scheduleExchange(
          scheduleExchangeId,
          scheduledAt
        );

      alert(data.message);

      const updatedConversations =
        await getConversations();

      setConversations(
        updatedConversations.conversations
      );

      setShowSchedule(false);

      setScheduleExchangeId(null);

      setScheduleData({
        date: "",
        time: "",
        days: "1"
      });

    } catch (error) {

      alert(error.message);

    }

  };


  /* =========================================
     SEND MESSAGE
  ========================================= */

  const handleSendMessage = async () => {

    if (
      !messageText.trim() ||
      !activeChat
    ) {

      return;

    }

    try {

      await sendMessage(
        activeChat,
        messageText
      );

      setMessageText("");


      const data =
        await getMessages(activeChat);


      setMessages(
        (data.messages || []).map(
          (msg) => ({

            type:
              msg.senderId === activeChat
                ? "received"
                : "sent",

            text:
              msg.content,

            time:
              new Date(
                msg.createdAt
              ).toLocaleTimeString(
                [],
                {
                  hour: "2-digit",
                  minute: "2-digit"
                }
              )

          })
        )
      );

    } catch (error) {

      alert(error.message);

    }

  };


  /* =========================================
     ENTER TO SEND
  ========================================= */

  const handleKeyDown = (e) => {

    if (
      e.key === "Enter" &&
      !e.shiftKey
    ) {

      e.preventDefault();

      handleSendMessage();

    }

  };


  return (
    <>
      <DashboardNavbar />


      <section className="messages-page">


        {/* =================================
            LEFT SIDEBAR
        ================================= */}

        <div className="messages-sidebar">


          <h3 className="sidebar-heading">
            Requests
          </h3>


          {requests.map((request) => (

            <div
              className="request-card"
              key={request.id}
            >


              <div className="request-user">


                <div className="request-initials">

                  {request.sender.name
                    .split(" ")
                    .map(
                      (name) =>
                        name[0]
                    )
                    .join("")
                    .toUpperCase()}

                </div>


                <div className="request-info">


                  <span className="request-name">

                    {request.sender.name}

                  </span>


                  <p className="request-skill">

                    Exchange Request

                  </p>


                </div>


              </div>


              <div className="request-actions">


                <button
                  className="accept-btn"
                  onClick={() =>
                    handleAccept(
                      request.id
                    )
                  }
                >
                  ✓
                </button>


                <button
                  className="reject-btn"
                  onClick={() =>
                    handleDecline(
                      request.id
                    )
                  }
                >
                  ✕
                </button>


              </div>


            </div>

          ))}


          {/* =================================
              CONVERSATIONS
          ================================= */}

          {conversations.map(
            (conversation) => (

              <div
                key={
                  conversation.user.id
                }

                className={`inbox-card ${
                  activeChat ===
                  conversation.user.id
                    ? "active"
                    : ""
                }`}

                onClick={() =>
                  setActiveChat(
                    conversation.user.id
                  )
                }
              >

                <h4>
                  {conversation.user.name}
                </h4>

                <p>
                  {
                    conversation.lastMessage ||
                    "Start a conversation"
                  }
                </p>

              </div>

            )
          )}


        </div>


        {/* =================================
            RIGHT CHAT
        ================================= */}

        <div className="chat-section">


          {/* =================================
              CHAT HEADER
          ================================= */}

          <div className="chat-header">


            <div className="chat-user-info">


              <div className="chat-user">


                <div className="chat-initials">

                  {currentChat.initials}

                </div>


                <span>
                  {currentChat.name}
                </span>


              </div>


              <div className="chat-skills">


                <span className="teach-tag">

                  Teaches:{" "}
                  {teaches || "—"}

                </span>


                <span className="want-tag">

                  Wants:{" "}
                  {wants || "—"}

                </span>


              </div>


            </div>


            <button
              className="schedule-btn"

              onClick={() => {

                setScheduleExchangeId(
                  currentConversation.exchangeId
                );


                const existingSchedule =
                  formatScheduledDateTime(
                    currentConversation.scheduledAt
                  );


                setScheduleData({

                  date:
                    existingSchedule.date,

                  time:
                    existingSchedule.time,

                  days: "1"

                });


                setShowSchedule(true);

              }}
            >

              Schedule

            </button>


          </div>


          {/* =================================
              MESSAGES
          ================================= */}

          <div className="chat-messages">


            <div className="chat-date">
              Today
            </div>


            {messages.map(
              (msg, index) => (

                <div
                  key={index}
                  className={`message ${msg.type}`}
                >

                  <span>
                    {msg.text}
                  </span>


                  <span className="message-time">
                    {msg.time}
                  </span>

                </div>

              )
            )}


          </div>


          {/* =================================
              INPUT
          ================================= */}

          <div className="chat-input">


            <button
              className="icon-btn"
              type="button"
            >
              <Paperclip size={22} />
            </button>


            <button
              className="icon-btn"
              type="button"
            >
              <Smile size={22} />
            </button>


            <input
              type="text"
              placeholder="Type a message..."
              value={messageText}
              onChange={(e) =>
                setMessageText(
                  e.target.value
                )
              }
              onKeyDown={handleKeyDown}
            />


            <button
              className="send-btn"
              onClick={
                handleSendMessage
              }
            >
              Send
            </button>


          </div>


        </div>


      </section>


      {/* =====================================
          SCHEDULE MODAL
      ===================================== */}

      {showSchedule && (

        <div
          className="schedule-overlay"
          onClick={() =>
            setShowSchedule(false)
          }
        >

          <div
            className="schedule-modal"
            onClick={(e) =>
              e.stopPropagation()
            }
          >


            <div className="schedule-header">


              <h2>
                Schedule Session
              </h2>


              <button
                type="button"
                onClick={() =>
                  setShowSchedule(false)
                }
              >
                <X size={20} />
              </button>


            </div>


            <form
              onSubmit={handleSchedule}
              className="schedule-form"
            >


              {/* DATE */}

              <div className="schedule-field">

                <label>

                  <CalendarDays size={17} />

                  Date

                </label>


                <input
                  type="date"
                  name="date"
                  value={
                    scheduleData.date
                  }
                  onChange={
                    handleScheduleChange
                  }
                  required
                />

              </div>


              {/* TIME */}

              <div className="schedule-field">

                <label>

                  <Clock size={17} />

                  Time

                </label>


                <input
                  type="time"
                  name="time"
                  value={
                    scheduleData.time
                  }
                  onChange={
                    handleScheduleChange
                  }
                  required
                />

              </div>


              {/* DAYS */}

              <div className="schedule-field">

                <label>
                  Number of Days
                </label>


                <select
                  name="days"
                  value={
                    scheduleData.days
                  }
                  onChange={
                    handleScheduleChange
                  }
                >

                  <option value="1">
                    1 Day
                  </option>

                  <option value="2">
                    2 Days
                  </option>

                  <option value="3">
                    3 Days
                  </option>

                  <option value="4">
                    4 Days
                  </option>

                  <option value="5">
                    5 Days
                  </option>

                  <option value="7">
                    7 Days
                  </option>

                  <option value="14">
                    14 Days
                  </option>

                  <option value="30">
                    30 Days
                  </option>

                </select>

              </div>


              <button
                type="submit"
                className="schedule-save-btn"
              >
                Schedule Session
              </button>


            </form>


          </div>

        </div>

      )}

    </>
  );
}


export default Messages;