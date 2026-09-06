import { Navigate, Route, Routes } from "react-router-dom";
import Homepage from "./pages/Homepage/Homepage";
import Authpage from "./pages/Authpage/Authpage";
import PageLayouts from "./Layouts/PageLayouts/PageLayouts";
import ProfilePage from "./pages/ProfilePage/ProfilePage";
import { useAuth } from "./context/AuthContext";
import { Center, Spinner } from "@chakra-ui/react";

function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <Center h="100vh" bg={"#000"}>
        <Spinner size="xl" color={"blue.500"} thickness={"4px"} speed={"0.65s"} />
      </Center>
    );
  }

  return (
    <PageLayouts>
      <Routes>
        <Route path="/" element={user ? <Homepage /> : <Navigate to="/auth" />} />
        <Route path="/auth" element={!user ? <Authpage /> : <Navigate to="/" />} />
        <Route path="/:username" element={<ProfilePage />} />
      </Routes>
    </PageLayouts>
  );
}

export default App;
