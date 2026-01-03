import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';

export const EmailConfirmed = () => {
    const [status, setStatus] = useState('verifying');
    const navigate = useNavigate();

    useEffect(() => {
        const checkAuth = async () => {
            const { data: { session } } = await supabase.auth.getSession();

            if (session) {
                setStatus('success');
                setTimeout(() => navigate('/'), 2000);
            } else {
                setStatus('error');
            }
        };

        checkAuth();
    }, [navigate]);

    return (
        <div style={{ maxWidth: '400px', margin: '100px auto', padding: '20px', textAlign: 'center' }}>
            {status === 'verifying' && (
                <>
                    <h2>Verifying your email...</h2>
                    <p>Please wait while we confirm your account.</p>
                </>
            )}

            {status === 'success' && (
                <>
                    <h2 style={{ color: 'green' }}>✓ Email Confirmed!</h2>
                    <p>Your account has been activated.</p>
                    <p>Redirecting to home page...</p>
                </>
            )}

            {status === 'error' && (
                <>
                    <h2 style={{ color: 'red' }}>Verification Failed</h2>
                    <p>There was an error confirming your email.</p>
                    <button
                        onClick={() => navigate('/login')}
                        style={{
                            padding: '10px 20px',
                            fontSize: '16px',
                            cursor: 'pointer',
                            marginTop: '20px',
                            backgroundColor: '#007bff',
                            color: 'white',
                            border: 'none',
                            borderRadius: '5px'
                        }}
                    >
                        Go to Login
                    </button>
                </>
            )}
        </div>
    );
};