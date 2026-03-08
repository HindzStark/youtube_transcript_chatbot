import { useState } from "react"
import WelcomeScreen from "./components/WelcomeScreen"
import ChatScreen from "./components/ChatScreen"

function App() {

  const [screen, setScreen] = useState("welcome")

  return (
    <div className="w-[420px] h-[520px] bg-gray-50 overflow-hidden">

      {screen === "welcome" ? (
        <WelcomeScreen onStartChat={() => setScreen("chat")}/>
      ) : (
        <ChatScreen onBack={() => setScreen("welcome")}/>
      )}

    </div>
  )
}

export default App