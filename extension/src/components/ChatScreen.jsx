import { useState, useRef, useEffect } from "react"
import { Play, Download, ArrowLeft } from "lucide-react"
import MessageBubble from "./MessageBubble"
import ChatInput from "./ChatInput"
import TypingIndicator from "./TypingIndicator"

export default function ChatScreen({ onBack }) {

  const [messages, setMessages] = useState([])
  const [isTyping, setIsTyping] = useState(false)
  const [responseMode, setResponseMode] = useState("medium")

  const messagesEndRef = useRef(null)

  const suggestedQuestions = [
    "Summarize this video",
    "Explain the main concept",
    "Give me study notes",
    "What are the key takeaways?"
  ]

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, isTyping])

  const handleSendMessage = async (text) => {

    const userMessage = {
      id: Date.now().toString(),
      text,
      sender: "user",
      timestamp: new Date()
    }

    setMessages((prev) => [...prev, userMessage])
    setIsTyping(true)

    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true
    })

    const videoUrl = tab.url

    try {

      await fetch("http://127.0.0.1:8000/load-video", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: videoUrl })
      })

      const ansLength =
        responseMode === "short" ? 1 :
        responseMode === "medium" ? 3 : 5

      const response = await fetch("http://127.0.0.1:8000/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: videoUrl,
          query: text,
          ans_len: ansLength
        })
      })

      const data = await response.json()

      const aiMessage = {
        id: (Date.now() + 1).toString(),
        text: data.answer,
        sender: "ai",
        timestamp: new Date()
      }

      setMessages((prev) => [...prev, aiMessage])

    } catch (err) {

      const errorMessage = {
        id: (Date.now() + 1).toString(),
        text: "Server error. Make sure backend is running.",
        sender: "ai",
        timestamp: new Date()
      }

      setMessages((prev) => [...prev, errorMessage])

    }

    setIsTyping(false)
  }

  const handleSuggestionClick = (q) => {
    handleSendMessage(q)
  }

  return (
    <div className="h-full flex flex-col bg-white">

      <div className="bg-gradient-to-r from-red-500 to-red-600 text-white px-4 py-3 shadow-md flex items-center justify-between">

        <div className="flex items-center gap-3">

          <button onClick={onBack}>
            <ArrowLeft className="w-5 h-5"/>
          </button>

          <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
            <Play className="w-4 h-4"/>
          </div>

          <div>
            <h2 className="font-semibold text-sm">ClipSens</h2>
            <p className="text-xs text-red-100">AI video assistant</p>
          </div>

        </div>

        <Download className="w-4 h-4"/>
      </div>

      <div className="flex gap-2 px-4 py-2 bg-gray-50 border-b">

        {["short","medium","detailed"].map((mode) => (
          <button
            key={mode}
            onClick={() => setResponseMode(mode)}
            className={`px-3 py-1 rounded-full text-xs ${
              responseMode === mode
                ? "bg-red-500 text-white"
                : "bg-white text-gray-600"
            }`}
          >
            {mode}
          </button>
        ))}

      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">

        {messages.length === 0 ? (

          <div className="flex flex-col gap-2">

            {suggestedQuestions.map((q, i) => (
              <button
                key={i}
                onClick={() => handleSuggestionClick(q)}
                className="border rounded-lg px-4 py-3 text-left hover:bg-gray-50"
              >
                {q}
              </button>
            ))}

          </div>

        ) : (

          <>
            {messages.map((m) => (
              <MessageBubble key={m.id} message={m}/>
            ))}

            {isTyping && <TypingIndicator/>}

            <div ref={messagesEndRef}/>
          </>

        )}

      </div>

      <ChatInput onSendMessage={handleSendMessage} disabled={isTyping}/>

    </div>
  )
}