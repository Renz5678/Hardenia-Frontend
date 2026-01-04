import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { Login } from './Parts/LoginPage/LoginPage.jsx';
import { Signup } from './Parts/SignUpPage/SignUpPage.jsx';
import { EmailConfirmed } from './Parts/EmailConfirmed';
import { ProtectedRoute } from './Parts/ProtectedRoute.jsx';
import styles from './App.module.css';
import OverviewBar from './Parts/OverviewBar/OverviewBar.jsx';
import Container from "./Parts/Container/Container.jsx";

function MainApp() {
    return (
        <div className={styles.backGround}>
            <Container />
            <OverviewBar />
        </div>
    );
}

function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/signup" element={<Signup />} />
                    <Route path="/email-confirmed" element={<EmailConfirmed />} />
                    <Route path="/" element={<ProtectedRoute><MainApp /></ProtectedRoute>} />
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    );
}

export default App;