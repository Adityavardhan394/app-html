// Authentication Service
const API_URL = 'http://localhost:3000/api';

const AuthService = {
    // Send OTP
    async sendOTP(phone) {
        try {
            const response = await fetch(`${API_URL}/send-otp`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ phone })
            });

            const data = await response.json();
            
            if (!data.success) {
                throw new Error(data.error || 'Failed to send OTP');
            }

            return true;
        } catch (error) {
            console.error('Failed to send OTP:', error);
            throw new Error(error.message || 'Failed to send OTP. Please try again.');
        }
    },

    // Verify OTP
    async verifyOTP(phone, otp) {
        try {
            const response = await fetch(`${API_URL}/verify-otp`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ phone, otp })
            });

            const data = await response.json();
            
            if (!data.success) {
                throw new Error(data.error || 'OTP verification failed');
            }

            return {
                sessionId: data.sessionId,
                user: data.user
            };
        } catch (error) {
            console.error('OTP verification failed:', error);
            throw new Error(error.message || 'OTP verification failed');
        }
    },

    // Verify Google token
    async verifyGoogleToken(credential) {
        try {
            const response = await fetch(`${API_URL}/auth/google`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ credential })
            });

            const data = await response.json();
            
            if (!data.success) {
                throw new Error(data.error || 'Google authentication failed');
            }

            return {
                sessionId: data.sessionId,
                user: data.user
            };
        } catch (error) {
            console.error('Google authentication failed:', error);
            throw new Error(error.message || 'Google authentication failed');
        }
    },

    // Create guest session
    createGuestSession() {
        const guestUser = {
            id: 'guest_' + Date.now(),
            name: 'Guest User',
            isGuest: true,
            loginMethod: 'guest',
            createdAt: new Date().toISOString()
        };

        const sessionId = 'sess_' + Math.random().toString(36).substr(2, 9);

        return {
            sessionId,
            user: guestUser
        };
    },

    // Get current session
    getCurrentSession() {
        const sessionId = localStorage.getItem('sessionId');
        const user = localStorage.getItem('user');
        
        if (!sessionId || !user) {
            return null;
        }

        try {
            return {
                sessionId,
                user: JSON.parse(user)
            };
        } catch {
            return null;
        }
    },

    // Save session
    saveSession(sessionId, user) {
        localStorage.setItem('sessionId', sessionId);
        localStorage.setItem('user', JSON.stringify(user));
    },

    // Clear session
    clearSession() {
        localStorage.removeItem('sessionId');
        localStorage.removeItem('user');
        localStorage.removeItem('isGuestSession');
    },

    // Check if user is logged in
    isLoggedIn() {
        return !!this.getCurrentSession();
    },

    // Check if current session is guest
    isGuestSession() {
        const session = this.getCurrentSession();
        return session?.user?.isGuest || false;
    }
};

// Export for use in other files
window.AuthService = AuthService; 