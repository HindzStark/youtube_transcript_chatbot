import { useState } from "react"
import { Send, Mic } from "lucide-react"

export default function ChatInput({ onSendMessage, disabled }) {

  const [message, setMessage] = useState("")

  const handleSubmit = (e) => {
    e.preventDefault()

    if (message.trim() && !disabled) {
      onSendMessage(message.trim())
      setMessage("")
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="border-t border-gray-200 bg-white px-4 py-3">

      <div className="flex items-center gap-2">

        <div className="flex-1 relative">

          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask about this video..."
            disabled={disabled}
            className="w-full px-4 py-2.5 pr-10 rounded-full border border-gray-300 focus:border-red-500 focus:ring-2 focus:ring-red-100 outline-none text-sm"
          />

          <button
            type="button"
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-gray-400 hover:text-red-500"
          >
            <Mic className="w-4 h-4"/>
          </button>

        </div>

        <button
          type="submit"
          disabled={!message.trim() || disabled}
          className="bg-red-500 hover:bg-red-600 text-white p-2.5 rounded-full"
        >
          <Send className="w-4 h-4"/>
        </button>

      </div>

    </form>
  )
}