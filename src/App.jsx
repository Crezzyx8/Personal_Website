import { BrowserRouter, Routes, Route } from "react-router-dom"
import HomePage from "./pages/HomePage"
import GamesPage from "./pages/GamesPage"
import AiOffice from "./pages/AiOffice"

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/games" element={<GamesPage />} />
        <Route path="/ai-office" element={<AiOffice />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App