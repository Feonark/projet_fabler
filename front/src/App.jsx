import { BrowserRouter, Routes, Route } from "react-router";
import "./App.css";
import PublicLayout from "./Layouts/PublicLayout/PublicLayout";
import Chat from "./Pages/Chat/Chat";
import Home from "./Pages/Home/Home";
import Login from "./Pages/Login/Login";
import Register from "./Pages/Register/Register";
import { AuthProvider } from "./Contexts/AuthContext";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route element={<PublicLayout />}>
            <Route index element={<Home />} />

            <Route path="login" element={<Login />} />
            <Route path="register" element={<Register />} />
            <Route path="story/:storyId/chat" element={<Chat />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
