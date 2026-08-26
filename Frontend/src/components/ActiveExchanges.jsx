import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Camera,
  CameraOff,
  Mic,
  MicOff,
  MonitorUp,
  Maximize,
  PhoneOff,
  PenLine,
  X,
  CalendarDays,
  Clock
} from "lucide-react";

import { getMyExchanges,scheduleExchange,startSession,endSession} from "../api/exchange";
import "../css/activeExchanges.css";
import { getProfile } from "../api/profile";


function ActiveExchanges() {

  const navigate = useNavigate();

  const [openExchange, setOpenExchange] = useState(null);
  const [exchanges, setExchanges] = useState([]);
  const [currentUserId, setCurrentUserId] = useState(null);

  /* Schedule */

  const [showSchedule, setShowSchedule] = useState(false);
const [scheduleExchangeId, setScheduleExchangeId] = useState(null);

  const [scheduleData, setScheduleData] = useState({
    date: "",
    time: "",
    days: "1"
  });


  /* Meeting */

  const [showMeeting, setShowMeeting] = useState(false);
  const [meetingExchangeId, setMeetingExchangeId] = useState(null);

  const [cameraOn, setCameraOn] = useState(true);
  const [micOn, setMicOn] = useState(true);
  const [showWhiteboard, setShowWhiteboard] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const canvasRef = useRef(null);
  const isDrawing = useRef(false);


  /* =========================
     FETCH EXCHANGES
  ========================= */

  useEffect(() => {

    const fetchExchanges = async () => {

      try {

        const profileData = await getProfile();
        const exchangeData = await getMyExchanges();

        setCurrentUserId(profileData.profile.id);
        setExchanges(exchangeData.exchanges);

      } catch (error) {

        console.error(
          "Failed to fetch exchanges:",
          error
        );

      }

    };

    fetchExchanges();

  }, []);


  /* =========================
     TOGGLE EXCHANGE
  ========================= */

  const toggleExchange = (index) => {

    setOpenExchange(
      openExchange === index
        ? null
        : index
    );

  };


  /* =========================
     SCHEDULE
  ========================= */

  const handleScheduleChange = (e) => {

    const { name, value } = e.target;

    setScheduleData((prev) => ({
      ...prev,
      [name]: value
    }));

  };


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
    const scheduledAt = `${scheduleData.date}T${scheduleData.time}`;

    const data = await scheduleExchange(
      scheduleExchangeId,
      scheduledAt
    );

    alert(data.message);

    // Update the exchange locally
    setExchanges((prev) =>
      prev.map((exchange) =>
        exchange.id === scheduleExchangeId
          ? {
              ...exchange,
              scheduledAt: data.exchange.scheduledAt
            }
          : exchange
      )
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

const handleStartSession = async (exchangeId) => {
  try {
    await startSession(exchangeId);

    setMeetingExchangeId(exchangeId);
    openMeeting();

  } catch (error) {
    alert(error.message);
  }
};

  /* =========================
     MEETING
  ========================= */

  const openMeeting = () => {

    setCameraOn(true);
    setMicOn(true);
    setShowWhiteboard(false);
    setIsFullscreen(false);

    setShowMeeting(true);

  };


  const endMeeting = async () => {
  if (!meetingExchangeId) {
    setShowMeeting(false);
    return;
  }

  try {
    const data = await endSession(meetingExchangeId);

    alert(data.message);

    setShowMeeting(false);
    setShowWhiteboard(false);
    setIsFullscreen(false);
    setMeetingExchangeId(null);

  } catch (error) {
    alert(error.message);
  }
};


  const toggleFullscreen = () => {

    setIsFullscreen((prev) => !prev);

  };


  /* =========================
     SCREEN SHARE
  ========================= */

  const handleScreenShare = async () => {

    try {

      if (!navigator.mediaDevices?.getDisplayMedia) {

        alert(
          "Screen sharing is not supported by this browser."
        );

        return;
      }

      await navigator.mediaDevices.getDisplayMedia({
        video: true
      });

    } catch (error) {

      console.log(
        "Screen sharing cancelled."
      );

    }

  };


  /* =========================
     CANVAS DRAWING
  ========================= */

  const startDrawing = (e) => {

    if (!showWhiteboard) return;

    const canvas = canvasRef.current;

    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();

    const ctx = canvas.getContext("2d");

    ctx.beginPath();

    ctx.moveTo(
      e.clientX - rect.left,
      e.clientY - rect.top
    );

    isDrawing.current = true;

  };


  const draw = (e) => {

    if (!isDrawing.current) return;

    const canvas = canvasRef.current;

    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();

    const ctx = canvas.getContext("2d");

    ctx.lineWidth = 3;

    ctx.lineCap = "round";

    ctx.strokeStyle = "#3b2f28";

    ctx.lineTo(
      e.clientX - rect.left,
      e.clientY - rect.top
    );

    ctx.stroke();

  };


  const stopDrawing = () => {

    isDrawing.current = false;

  };


  /* =========================
     CLEAR WHITEBOARD
  ========================= */

  const clearWhiteboard = () => {

    const canvas = canvasRef.current;

    if (!canvas) return;

    const ctx = canvas.getContext("2d");

    ctx.clearRect(
      0,
      0,
      canvas.width,
      canvas.height
    );

  };

  const formatScheduledDateTime = (scheduledAt) => {
  if (!scheduledAt) {
    return {
      date: "",
      time: ""
    };
  }

  const date = new Date(scheduledAt);

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return {
    date: `${year}-${month}-${day}`,
    time: `${hours}:${minutes}`
  };
};


  return (
    <>

      <section className="active-exchanges">


        {/* =================================
            SECTION HEADING
        ================================= */}

        <div className="exchange-section-heading">

          <div className="exchange-heading-words">

            <span className="word-first">
              Ongoing
            </span>

            <span className="word-second">
              Exchanges
            </span>

          </div>

          <div className="heading-line"></div>

        </div>


        {/* =================================
            EXCHANGES
        ================================= */}

        {exchanges.map((exchange, index) => {

          const otherUser =
            exchange.senderId === currentUserId
              ? exchange.receiver
              : exchange.sender;


          return (

            <div
              key={exchange.id}
              className={`exchange-card ${
                openExchange === index
                  ? "expanded"
                  : ""
              }`}
              onClick={() =>
                toggleExchange(index)
              }
            >


              {/* HEADER */}

              <div className="exchange-header">

                <h3>
                  {otherUser.name}
                </h3>


                <div className="exchange-time">

                  <span>
                    Ongoing
                  </span>

                  <span className="dropdown-arrow">

                    {openExchange === index
                      ? "⌃"
                      : "⌄"}

                  </span>

                </div>

              </div>


              {/* PROGRESS */}

              <div className="progress-wrapper">

                <div className="progress-fill fill-40"></div>

              </div>


              {/* DETAILS */}

              {openExchange === index && (

                <div className="exchange-details">

                  <p className="progress-text">
                    Exchange in progress
                  </p>


                  <div className="exchange-buttons">


                    {/* MESSAGE */}

                    <button
                      onClick={(e) => {

                        e.stopPropagation();

                        navigate("/messages");

                      }}
                    >
                      Message
                    </button>


                    {/* SCHEDULE */}

                    <button
  onClick={(e) => {
    e.stopPropagation();

    setScheduleExchangeId(exchange.id);

    const existingSchedule = formatScheduledDateTime(
      exchange.scheduledAt
    );

    setScheduleData({
      date: existingSchedule.date,
      time: existingSchedule.time,
      days: "1"
    });

    setShowSchedule(true);
  }}
>
  Schedule Session
</button>

                    {/* MEETING */}

                    <button
  onClick={(e) => {
    e.stopPropagation();
    handleStartSession(exchange.id);
  }}
>
  Log Session
</button>


                  </div>

                </div>

              )}

            </div>

          );

        })}

      </section>


      {/* =========================================
          SCHEDULE MODAL
      ========================================= */}

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
                  value={scheduleData.date}
                  onChange={handleScheduleChange}
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
                  value={scheduleData.time}
                  onChange={handleScheduleChange}
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
                  value={scheduleData.days}
                  onChange={handleScheduleChange}
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


      {/* =========================================
          MEETING
      ========================================= */}

      {showMeeting && (

        <div
          className={`meeting-overlay ${
            isFullscreen
              ? "meeting-fullscreen"
              : ""
          }`}
        >


          <div className="meeting-window">


            {/* =================================
                MEETING HEADER
            ================================= */}

            <div className="meeting-header">

              <h2>
                SkillDeal Meeting
              </h2>


              <div className="meeting-window-actions">

                <button
  onClick={() => setIsFullscreen(false)}
  title="Minimize"
>
  −
</button>


                <button
                  onClick={toggleFullscreen}
                  title="Maximize"
                >
                  <Maximize size={18} />
                </button>


                <button
                  onClick={endMeeting}
                  title="Close"
                >
                  <X size={18} />
                </button>

              </div>

            </div>


            {/* =================================
                MEETING AREA
            ================================= */}

            <div className="meeting-area">


              {/* WHITEBOARD */}

              {showWhiteboard ? (

                <div className="whiteboard-wrapper">

                  <canvas
                    ref={canvasRef}
                    width={1100}
                    height={550}
                    className="whiteboard"
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                  />

                  <button
                    className="clear-board-btn"
                    onClick={clearWhiteboard}
                  >
                    Clear
                  </button>

                </div>

              ) : (


                /* PARTICIPANTS */

                <div className="participants">


                  {/* CURRENT USER */}

                  <div className="participant-box">

                    <div className="participant-avatar">
                      ME
                    </div>

                  </div>


                  {/* OTHER USER */}

                  <div className="participant-box">

                    <div className="participant-avatar">

                      {openExchange !== null &&
                      exchanges[openExchange]
                        ? (
                          exchanges[
                            openExchange
                          ].senderId ===
                          currentUserId
                            ? exchanges[
                                openExchange
                              ].receiver.name
                            : exchanges[
                                openExchange
                              ].sender.name
                        )
                            .split(" ")
                            .map(
                              (name) =>
                                name[0]
                            )
                            .join("")
                            .toUpperCase()
                            .slice(0, 2)
                        : "US"}

                    </div>

                  </div>

                </div>

              )}

            </div>


            {/* =================================
                MEETING CONTROLS
            ================================= */}

            <div className="meeting-controls">


              {/* MIC */}

              <button
                className={`meeting-control ${
                  micOn
                    ? "control-active"
                    : "control-off"
                }`}
                onClick={() =>
                  setMicOn(
                    (prev) => !prev
                  )
                }
                title="Microphone"
              >

                {micOn
                  ? <Mic size={21} />
                  : <MicOff size={21} />}

              </button>


              {/* CAMERA */}

              <button
                className={`meeting-control ${
                  cameraOn
                    ? "control-active"
                    : "control-off"
                }`}
                onClick={() =>
                  setCameraOn(
                    (prev) => !prev
                  )
                }
                title="Camera"
              >

                {cameraOn
                  ? <Camera size={21} />
                  : <CameraOff size={21} />}

              </button>


              {/* SCREEN SHARE */}

              <button
                className="meeting-control"
                onClick={handleScreenShare}
                title="Share screen"
              >

                <MonitorUp size={21} />

              </button>


              {/* WHITEBOARD */}

              <button
                className={`meeting-control ${
                  showWhiteboard
                    ? "control-active"
                    : ""
                }`}
                onClick={() =>
                  setShowWhiteboard(
                    (prev) => !prev
                  )
                }
                title="Whiteboard"
              >

                <PenLine size={21} />

              </button>


              {/* END */}

              <button
                className="end-meeting-btn"
                onClick={endMeeting}
                title="End meeting"
              >

                <PhoneOff size={21} />

                <span>
                  End
                </span>

              </button>

            </div>

          </div>

        </div>

      )}

    </>
  );
}

export default ActiveExchanges;