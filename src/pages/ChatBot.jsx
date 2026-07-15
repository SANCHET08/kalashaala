import { useEffect, useRef, useState } from "react";
import { Loader2, Send, Volume2, VolumeX } from "lucide-react";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

function buildResponse(input, contextData) {
  const query = input.toLowerCase();
  const schemes = contextData.schemes || [];
  const courses = contextData.courses || [];
  const blogs = contextData.blogs || [];

  if (query.includes("scheme") || query.includes("government")) {
    if (!schemes.length) return "I do not have government scheme information in the database yet.";
    return `I found ${schemes.length} scheme record(s): ${schemes.slice(0, 3).map((item) => item.title).join(", ")}.`;
  }

  if (query.includes("course") || query.includes("learn")) {
    if (!courses.length) return "I do not have course information in the database yet.";
    return `I found ${courses.length} course record(s): ${courses.slice(0, 3).map((item) => item.title).join(", ")}.`;
  }

  if (query.includes("blog") || query.includes("article")) {
    if (!blogs.length) return "I do not have article information in the database yet.";
    return `I found ${blogs.length} article record(s): ${blogs.slice(0, 3).map((item) => item.title).join(", ")}.`;
  }

  if (query.includes("register") || query.includes("artist")) {
    return "Artists can register from the Sign up as Artist page. Customers and supporters can use Sign up as Customer.";
  }

  return "I can help with KalaShaala schemes, courses, blogs, artist discovery, and registration. Ask about one of those topics.";
}

function ChatBot() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hello! I can help with KalaShaala schemes, courses, blogs, artists, and registration.",
      sender: "bot",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function fetchContext(userQuery) {
    const safeQuery = encodeURIComponent(userQuery.slice(0, 300));
    const response = await fetch(`${API_BASE_URL}/blog/chatbot/context/?query=${safeQuery}`);
    if (!response.ok) throw new Error("Failed to fetch context data");
    return response.json();
  }

  function speakText(text) {
    if (!("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(new SpeechSynthesisUtterance(text));
  }

  async function handleSendMessage(event) {
    event.preventDefault();
    const cleanInput = input.trim().slice(0, 500);
    if (!cleanInput || isLoading) return;

    const userMessage = {
      id: Date.now(),
      text: cleanInput,
      sender: "user",
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const contextData = await fetchContext(cleanInput);
      const text = buildResponse(cleanInput, contextData);
      setMessages((prev) => [...prev, { id: Date.now() + 1, text, sender: "bot" }]);
      if (isSpeaking) speakText(text);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          text: "I could not reach the KalaShaala database right now. Please try again later.",
          sender: "bot",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-orange-50 p-6">
      <div className="mx-auto flex max-w-3xl flex-col overflow-hidden rounded-2xl bg-white shadow-xl">
        <div className="flex items-center justify-between bg-orange-600 px-5 py-4 text-white">
          <div>
            <h1 className="text-xl font-bold">KalaShaala Assistant</h1>
            <p className="text-sm text-orange-100">Database-backed, no frontend API keys.</p>
          </div>
          <button
            type="button"
            onClick={() => setIsSpeaking((value) => !value)}
            className="rounded-full bg-white/15 p-2 hover:bg-white/25"
            aria-label="Toggle speech"
          >
            {isSpeaking ? <Volume2 size={20} /> : <VolumeX size={20} />}
          </button>
        </div>

        <div className="h-[520px] space-y-3 overflow-y-auto p-5">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`max-w-[82%] rounded-2xl px-4 py-3 text-sm leading-6 ${
                message.sender === "user"
                  ? "ml-auto bg-orange-600 text-white"
                  : "bg-orange-100 text-stone-900"
              }`}
            >
              {message.text}
            </div>
          ))}
          {isLoading && (
            <div className="inline-flex items-center gap-2 rounded-2xl bg-orange-100 px-4 py-3 text-sm">
              <Loader2 className="animate-spin" size={16} />
              Checking KalaShaala data...
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleSendMessage} className="flex gap-3 border-t p-4">
          <input
            value={input}
            onChange={(event) => setInput(event.target.value)}
            maxLength={500}
            placeholder="Ask about schemes, courses, blogs, artists..."
            className="flex-1 rounded-full border border-orange-200 px-4 py-3 outline-none focus:border-orange-500"
          />
          <button
            type="submit"
            disabled={isLoading}
            className="inline-flex items-center gap-2 rounded-full bg-orange-600 px-5 py-3 font-semibold text-white disabled:opacity-60"
          >
            <Send size={18} />
            Send
          </button>
        </form>
      </div>
    </div>
  );
}

export default ChatBot;
