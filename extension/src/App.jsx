import { useState, useRef, useEffect } from "react"

function App() {

  const [started, setStarted] = useState(false)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)

  const chatEndRef = useRef(null)

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, loading])

  const sendMessage = async () => {

    if (!input.trim()) return

    const question = input
    setInput("")
    setLoading(true)

    setMessages(prev => [
      ...prev,
      { role: "user", text: question }
    ])

    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true
    })

    const videoUrl = tab.url

    try {

      await fetch("http://127.0.0.1:8000/load-video", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({ url: videoUrl })
      })

      const response = await fetch("http://127.0.0.1:8000/ask", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({
          url: videoUrl,
          query: question,
          ans_len: 3
        })
      })

      const data = await response.json()

      setMessages(prev => [
        ...prev,
        { role: "bot", text: data.answer }
      ])

    } catch {

      setMessages(prev => [
        ...prev,
        { role: "bot", text: "⚠️ Server error." }
      ])

    }

    setLoading(false)
  }

  const handleKey = (e) => {
    if (e.key === "Enter") sendMessage()
  }

  /* ------------------------
      WELCOME SCREEN
  -------------------------*/

  if (!started) {

    return (

      <div className="w-[420px] h-[520px] bg-gradient-to-br from-red-50 to-white flex flex-col items-center justify-center text-center p-8">

        <div className="w-20 h-20 rounded-full bg-red-600 text-white flex items-center justify-center text-3xl shadow-lg">
          ▶
        </div>

        <h1 className="text-2xl font-bold mt-6 text-gray-800">
          Welcome to <span className="text-red-600">ClipSense</span>
        </h1>

        <p className="text-gray-500 text-sm mt-3 leading-relaxed max-w-xs">
          Ask questions about any YouTube video and get instant AI explanations.
        </p>

        <button
          onClick={() => setStarted(true)}
          className="mt-8 bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-full text-sm font-semibold shadow-lg transition"
        >
          Start Chat
        </button>

      </div>
    )
  }

  /* ------------------------
        CHAT SCREEN
  -------------------------*/

  return (

    <div className="w-[420px] h-[520px] flex flex-col bg-gradient-to-b from-white to-gray-100">

      {/* Header */}

      <div className="flex items-center justify-between px-4 py-3 bg-white border-b shadow-sm">

        <div className="flex items-center gap-3">

          <div className="w-9 h-9 rounded-full bg-red-600 text-white flex items-center justify-center text-sm font-bold">
            CS
          </div>

          <div className="flex flex-col leading-tight">
            <span className="font-semibold text-gray-800 text-sm">
              ClipSense AI
            </span>
            <span className="text-xs text-gray-400">
              YouTube Study Assistant
            </span>
          </div>

        </div>

      </div>

      {/* Chat Area */}

      <div className="flex-1 overflow-y-auto p-4 space-y-4">

        {messages.length === 0 && (

          <div className="text-center text-gray-400 text-sm mt-16">
            Ask anything about this video 🎓
          </div>

        )}

        {messages.map((msg, i) => (

          <div
            key={i}
            className={`flex ${
              msg.role === "user"
                ? "justify-end"
                : "justify-start"
            }`}
          >

            <div
              className={
                msg.role === "user"
                  ? "bg-red-600 text-white px-4 py-2 rounded-2xl rounded-br-sm max-w-[80%] text-sm shadow-md"
                  : "bg-white border px-4 py-2 rounded-2xl rounded-bl-sm max-w-[80%] text-sm shadow-sm"
              }
            >
              {msg.text}
            </div>

          </div>

        ))}

        {loading && (

          <div className="flex justify-start">

            <div className="bg-white border px-4 py-2 rounded-xl shadow-sm flex gap-2">

              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-150"></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-300"></div>

            </div>

          </div>

        )}

        <div ref={chatEndRef}></div>

      </div>

      {/* Input */}

      <div className="border-t bg-white p-3 flex gap-2">

        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKey}
          placeholder="Ask about this video..."
          className="flex-1 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
        />

        <button
          onClick={sendMessage}
          className="bg-red-600 hover:bg-red-700 text-white px-5 py-2 rounded-lg text-sm font-semibold shadow-sm"
        >
          Ask
        </button>

      </div>

    </div>

  )
}

export default App