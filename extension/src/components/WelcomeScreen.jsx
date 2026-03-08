import { Play, BookOpen, FileText, Sparkles } from "lucide-react"

export default function WelcomeScreen({ onStartChat }) {

  return (
    <div className="h-full flex flex-col items-center justify-center p-6 bg-gradient-to-br from-gray-50 to-gray-100">

      <div className="flex items-center justify-center w-20 h-20 bg-red-500 rounded-2xl mb-6 shadow-lg">
        <Play className="w-10 h-10 text-white fill-white" />
      </div>

      <h1 className="text-2xl font-bold text-gray-900 mb-2 text-center">
        Welcome to <span className="text-red-500">ClipSens</span>
      </h1>

      <p className="text-gray-600 text-center text-sm mb-8 max-w-xs">
        Chat with any YouTube video and understand concepts faster using AI-powered learning.
      </p>

      <button
        onClick={onStartChat}
        className="bg-red-500 hover:bg-red-600 text-white font-semibold px-8 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 mb-8"
      >
        Start Chat
      </button>

      <div className="space-y-3 w-full max-w-sm">

        <FeatureCard
          icon={<Sparkles className="w-5 h-5 text-red-500" />}
          title="Ask Questions"
          description="Get instant answers about the video"
        />

        <FeatureCard
          icon={<BookOpen className="w-5 h-5 text-red-500" />}
          title="Study Notes"
          description="Generate structured notes for learning"
        />

        <FeatureCard
          icon={<FileText className="w-5 h-5 text-red-500" />}
          title="Summarize Concepts"
          description="Quick summaries of complex topics"
        />

      </div>

    </div>
  )
}

function FeatureCard({ icon, title, description }) {

  return (
    <div className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow flex items-start gap-3">

      <div className="flex-shrink-0 w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center">
        {icon}
      </div>

      <div>
        <h3 className="font-semibold text-gray-900 text-sm">
          {title}
        </h3>

        <p className="text-gray-600 text-xs mt-0.5">
          {description}
        </p>
      </div>

    </div>
  )
}