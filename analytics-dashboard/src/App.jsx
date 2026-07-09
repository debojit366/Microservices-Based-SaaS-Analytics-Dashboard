import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AuthPage from "./pages/AuthPage";
import Dashboard from "./pages/Dashboard";

export default function App() {
  const isLoggedIn = !!localStorage.getItem("accessToken");

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/auth" element={<AuthPage />} />

        <Route
          path="/dashboard"
          element={isLoggedIn ? <Dashboard /> : <Navigate to="/auth" replace />}
        />

        <Route
          path="/"
          element={
            <Navigate
              to={isLoggedIn ? "/dashboard" : "/auth"}
              replace
            />
          }
        />
      </Routes>
    </BrowserRouter>
  );
}