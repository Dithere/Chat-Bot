import React, { useState, useRef, useEffect } from "react";
import "./App.css";

function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [darkMode, setDarkMode] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  // Scroll to bottom whenever messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const sendMessage = async () => {
    const trimmedInput = input.trim();
    if (!trimmedInput) return;

    // Add user's message
    setMessages((prev) => [...prev, { user: "You", text: trimmedInput }]);
    setInput("");
    setIsTyping(true);

    try {
      // Use relative URL for production (Vercel)
      const res = await fetch("/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: trimmedInput }),
      });

      if (!res.ok) throw new Error("Server error");

      const data = await res.json();

      setMessages((prev) => [
        ...prev,
        { user: "Bot", text: data.reply || "Kuch galat ho gaya 😔" },
      ]);
    } catch (err) {
      console.error("Fetch failed:", err);
      setMessages((prev) => [
        ...prev,
        { user: "Bot", text: "Server se reply nahi aa raha 😔" },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className={`App ${darkMode ? "dark" : ""}`}>
      <header>
        <h1>GrowBot</h1>
        <button
          className="toggle-btn"
          onClick={() => setDarkMode((prev) => !prev)}
        >
          {darkMode ? "Light Mode ☀️" : "Dark Mode 🌙"}
        </button>
      </header>

      <div className="chatbox">
        {messages.map((m, i) => (
          <div
            key={i}
            className={`message-bubble ${
              m.user === "Bot" ? "bot-msg" : "user-msg"
            }`}
          >
            <strong>{m.user}: </strong>
            {m.text}
          </div>
        ))}

        {isTyping && (
          <div className="message-bubble bot-msg typing">
            <strong>Bot: </strong>
            <span className="dot"></span>
            <span className="dot"></span>
            <span className="dot"></span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="input-area">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          placeholder="Type something..."
          autoFocus
        />
        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
}

export default App;
