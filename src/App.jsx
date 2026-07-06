import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import MiniGames from "./pages/MiniGames";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/games" element={<MiniGames />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;