import { useState, useEffect } from 'react';

const messages = [
  "Waking up the server... it's an early riser, just not that early 🌅",
  "Matching skills, brewing coffee for the backend ☕",
  "Almost there — good things take a hot minute",
  "Fetching your matches, be right back",
  "Render's free tier is stretching before it runs"
];

function Loading() {
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % messages.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="loading-container">
      <p className="loading-message">{messages[messageIndex]}</p>
    </div>
  );
}

export default Loading;