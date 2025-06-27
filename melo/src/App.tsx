import React from "react";
import {
    BrowserRouter as Router,
    Routes,
    Route,
    Navigate,
} from "react-router-dom";
import { ThemeProvider, CssBaseline } from "@mui/material";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { theme } from "./theme";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DashboardPage from "./pages/DashboardPage";
// import ProtectedRoute from "./components/ProtectedRoute";

const AppRoutes: React.FC = () => {
    const { user } = useAuth();

    return (
        <Routes>
            <Route path="/" element={<HomePage />} />
            <Route
                path="/login"
                element={
                    user ? <Navigate to="/dashboard" replace /> : <LoginPage />
                }
            />
            <Route
                path="/register"
                element={
                    user ? (
                        <Navigate to="/dashboard" replace />
                    ) : (
                        <RegisterPage />
                    )
                }
            />
            <Route
                path="/dashboard"
                element={
                    // <ProtectedRoute>
                    <DashboardPage />
                    // </ProtectedRoute>
                }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
};

function App() {
    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <AuthProvider>
                <Router>
                    <AppRoutes />
                </Router>
            </AuthProvider>
        </ThemeProvider>
    );
}

export default App;
