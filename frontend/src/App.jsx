import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import Home from "./pages/Home";
import Profile from "./pages/Profile";
import Hunts from "./pages/Hunts";
import Join from "./pages/JoinAndPlay/Join";
import StartHunt from "./pages/JoinAndPlay/StartHunt";
import EditHunt from "./pages/EditHunt/EditHunt";
import EditQuestion from "./pages/EditHunt/EditQuestion";
import Login from "./pages/Login/login";
import Register from "./pages/Login/register";
import PlayHunt from "./pages/JoinAndPlay/PlayHunt";
import Navbar from "./components/Navbar";
import AppDashboard from "./components/shared/AppDashboard";
import config from "../config.js";
import "./App.css";

function AppContent() {
  const location = useLocation();

  const usesAppPageLayout =
    location.pathname !== "/login" &&
    location.pathname !== "/register" &&
    !location.pathname.startsWith("/playhunt/");

  return (
    <>
      <AppDashboard
        imageSrc={config.linkOfImage}
        infoText={config.infoText}
      />
      <main className={usesAppPageLayout ? "app-page" : undefined}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/hunts" element={<Hunts />} />
          <Route path="/join" element={<Join />} />
          <Route path="/starthunt/:huntCode" element={<StartHunt />} />
          <Route path="/edithunt/:huntId" element={<EditHunt />} />
          <Route path="/editquestion" element={<EditQuestion />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/playhunt/:huntCode" element={<PlayHunt />} />
        </Routes>
      </main>
      <Navbar />
    </>
  );
}

export default function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}