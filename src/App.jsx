import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Login } from './Parts/LoginPage/LoginPage.jsx';
import { Signup } from './Parts/SignUpPage/SignUpPage.jsx';
import { EmailConfirmed } from './Parts/EmailConfirmed';
import { ProtectedRoute } from './Parts/ProtectedRoute.jsx';
import styles from './App.module.css';
import OverviewBar from './Parts/OverviewBar/OverviewBar.jsx';
import Container from "./Parts/Container/Container.jsx";

// Your main app content as a separate component
function MainApp() {
    const { signOut, user } = useAuth();

    const handleLogout = async () => {
        try {
            await signOut();
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    return (
        <div className={styles.backGround}>
            {/* Optional: Add a logout button */}
            <div style={{ position: 'absolute', top: '10px', right: '10px', zIndex: 1000 }}>
                <button
                    onClick={handleLogout}
                    style={{
                        padding: '8px 16px',
                        backgroundColor: '#dc3545',
                        color: 'white',
                        border: 'none',
                        borderRadius: '5px',
                        cursor: 'pointer'
                    }}
                >
                    Logout
                </button>
                <span style={{ marginLeft: '10px', color: '#666' }}>
          {user?.email}
        </span>
            </div>

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
                    {/* Public routes */}
                    <Route path="/login" element={<Login />} />
                    <Route path="/signup" element={<Signup />} />
                    <Route path="/email-confirmed" element={<EmailConfirmed />} />

                    {/* Protected route - your main app */}
                    <Route
                        path="/"
                        element={
                            <ProtectedRoute>
                                <MainApp />
                            </ProtectedRoute>
                        }
                    />

                    {/* Catch all - redirect to home */}
                    <Route path="*" element={<Navigate to="/" />} />
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    );
}

export default App;