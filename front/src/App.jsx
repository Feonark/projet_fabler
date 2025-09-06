import "./App.css";
import Chat from "./Pages/Chat/Chat";
import Home from "./Pages/Home/Home";
import Login from "./Pages/Login/Login";
import Story from "./Pages/Story/Story";
import NewStory from "./Pages/Story/NewStory";
import EditStory from "./Pages/Story/EditStory";
import NewPlace from "./Pages/Place/NewPlace";
import EditPlace from "./Pages/Place/EditPlace";
import NewCharacter from "./Pages/Character/NewCharacter";
import EditCharacter from "./Pages/Character/EditCharacter";
import Register from "./Pages/Register/Register";
import Profile from "./Pages/Profile/Profile";
import EditProfile from "./Pages/Profile/EditProfile";
import { AuthProvider } from "./Contexts/AuthContext";
import { BrowserRouter, Routes, Route } from "react-router";
import PublicLayout from "./Layouts/PublicLayout/PublicLayout";
import StorySearch from "./Pages/StorySearch/StorySearch";
import NotFound from "./Pages/NotFound/NotFound";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route element={<PublicLayout />}>
            <Route index element={<Home />} />

            <Route path="login" element={<Login />} />
            <Route path="register" element={<Register />} />

            <Route path="profile" element={<Profile />} />
            <Route path="profile/edit" element={<EditProfile />} />

            <Route path="profile/characters/new" element={<NewCharacter />} />
            <Route
              path="profile/characters/:characterId/edit"
              element={<EditCharacter />}
            />

            <Route path="stories/search" element={<StorySearch />} />

            <Route path="stories/new" element={<NewStory />} />
            <Route path="stories/:storyId" element={<Story />} />
            <Route path="stories/:storyId/edit" element={<EditStory />} />

            <Route path="stories/:storyId/places/new" element={<NewPlace />} />
            <Route
              path="stories/:storyId/places/:placeId/edit"
              element={<EditPlace />}
            />

            <Route path="stories/:storyId/chat" element={<Chat />} />

            <Route path="/notfound" element={<NotFound />}></Route>
            <Route path="*" element={<NotFound />}></Route>
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
