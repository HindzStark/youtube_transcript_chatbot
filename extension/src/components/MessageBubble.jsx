import { Copy, Check } from "lucide-react"
import { useState } from "react"

export default function MessageBubble({ message }) {

  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(message.text)
    setCopied(true)

    setTimeout(() => {
      setCopied(false)
    }, 2000)
  }

  const isUser = message.sender === "user"

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} group`}>

      <div
        className={`max-w-[85%] rounded-2xl px-4 py-2.5 shadow-sm ${
          isUser
            ? "bg-red-500 text-white rounded-br-sm"
            : "bg-gray-100 text-gray-900 rounded-bl-sm"
        }`}
      >

        <div className="text-sm leading-relaxed whitespace-pre-wrap">
          {message.text}
        </div>

        {!isUser && (
          <button
            onClick={handleCopy}
            className="mt-2 inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-700"
          >
            {copied ? (
              <>
                <Check className="w-3 h-3"/>
                Copied
              </>
            ) : (
              <>
                <Copy className="w-3 h-3"/>
                Copy
              </>
            )}
          </button>
        )}

      </div>

    </div>
  )
}