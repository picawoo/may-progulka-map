import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import MapPage from "./pages/MapPage";
import AdminPage from "./pages/AdminPage";
import LoginForm from "./components/LoginForm";
import { useAuth } from "./contexts/AuthContext";

function ProtectedAdminRoute() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div style={{ padding: "2rem", textAlign: "center" }}>
        Загрузка...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginForm />;
  }

  return <AdminPage />;
}

function App() {
  return (
    <BrowserRouter>
      <div className="bodywrapper">
        <Header />
      </div>
      <Routes>
        <Route path="/" element={<MapPage />} />
        <Route path="/admin" element={<ProtectedAdminRoute />} />
      </Routes>
      <Footer />
    </BrowserRouter>
  );
}

export default App;
