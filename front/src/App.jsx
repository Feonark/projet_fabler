import "./App.css";
import Chat from "./Pages/Chat/Chat";
import Home from "./Pages/Home/Home";
import Login from "./Pages/Login/Login";
import Story from "./Pages/Story/Story";
import Register from "./Pages/Register/Register";
import { AuthProvider } from "./Contexts/AuthContext";
import { BrowserRouter, Routes, Route } from "react-router";
import PublicLayout from "./Layouts/PublicLayout/PublicLayout";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route element={<PublicLayout />}>
            <Route index element={<Home />} />

            <Route path="login" element={<Login />} />
            <Route path="register" element={<Register />} />
            <Route path="stories/:storyId/chat" element={<Chat />} />
            <Route path="stories/:storyId" element={<Story />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
