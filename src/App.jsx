import { Route, Routes } from "react-router-dom";
import Homepage from "./pages/Homepage/Homepage";
import Authpage from "./pages/Authpage/Authpage";
import PageLayouts from "./Layouts/PageLayouts/PageLayouts";
import ProfilePage from "./pages/ProfilePage/ProfilePage";

function App() {
  return (
    <>
      <PageLayouts>
        <Routes>
          <Route path="/" element={<Homepage />} />
          <Route path="/auth" element={<Authpage />} />
          <Route path="/:username" element={<ProfilePage />} />
        </Routes>
      </PageLayouts>
    </>
  );
}

export default App;
