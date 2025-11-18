// src/App.tsx
import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import DailyLog from "./pages/DailyLog";
// 週次・ストーリー用はあとで中身を作る前提で
import WeeklyCouncil from "./pages/WeeklyCouncil";
import StoryLog from "./pages/StoryLog";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/daily-log" element={<DailyLog />} />
      <Route path="/weekly-council" element={<WeeklyCouncil />} />
      <Route path="/story-log" element={<StoryLog />} />
    </Routes>
  );
}
