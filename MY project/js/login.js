document.addEventListener('DOMContentLoaded', () => {
    // Check if already logged in
    if (AuthService.isLoggedIn() && !AuthService.isGuestSession()) {
        window.location.href = 'dashboard.html';
        return;
    }

    // Get DOM elements
    const loginForm = document.getElementById('loginForm');
    const phoneInput = document.getElementById('phoneInput');
    const otpContainer = document.getElementById('otpContainer');
    const otpInputs = document.querySelectorAll('.otp-digit');
    const errorMessage = document.getElementById('errorMessage');
    const loadingOverlay = document.getElementById('loadingOverlay');
    const resendButton = document.getElementById('resendOTP');
    const googleSignInBtn = document.getElementById('googleSignIn');
    const appleSignInBtn = document.getElementById('appleSignIn');
    const guestBtn = document.querySelector('.guest-btn');
    const createAccountLink = document.getElementById('createAccount');

    let currentPhone = '';

    // Show error message
    function showError(message) {
        errorMessage.textContent = message;
        errorMessage.classList.add('show');
        setTimeout(() => errorMessage.classList.remove('show'), 3000);
    }

    // Show success message
    function showSuccess(message) {
        const successDiv = document.createElement('div');
        successDiv.className = 'success-message show';
        successDiv.textContent = message;
        errorMessage.parentNode.insertBefore(successDiv, errorMessage);
        setTimeout(() => successDiv.remove(), 3000);
    }

    // Show loading state
    function showLoading(show = true) {
        loadingOverlay.style.display = show ? 'flex' : 'none';
    }

    // Handle successful authentication
    function handleAuthSuccess(sessionId, user) {
        AuthService.saveSession(sessionId, user);
        showSuccess('Login successful!');
        setTimeout(() => {
            window.location.href = 'dashboard.html';
        }, 1000);
    }

    // Handle guest login
    async function handleGuestLogin() {
        showLoading(true);
        try {
            const { sessionId, user } = AuthService.createGuestSession();
            handleAuthSuccess(sessionId, user);
        } catch (error) {
            console.error('Guest login failed:', error);
            showError('Failed to continue as guest. Please try again.');
            showLoading(false);
        }
    }

    // Handle Google Sign-In callback
    window.handleGoogleSignIn = async (response) => {
        showLoading(true);
        try {
            const { credential } = response;
            const { sessionId, user } = await AuthService.verifyGoogleToken(credential);
            handleAuthSuccess(sessionId, user);
        } catch (error) {
            console.error('Google Sign-In failed:', error);
            showError('Google Sign-In failed. Please try again or continue as guest.');
            showLoading(false);
        }
    };

    // Handle Apple Sign-In
    window.handleAppleSignIn = async (authorization) => {
        showLoading(true);
        try {
            // Verify the token with your backend
            const verifyResponse = await fetch(`${API_URL}/auth/apple`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ authorization })
            });

            const data = await verifyResponse.json();
            
            if (!data.success) {
                throw new Error(data.error || 'Apple Sign-In failed');
            }

            handleAuthSuccess(data.sessionId, data.user);
        } catch (error) {
            console.error('Apple Sign-In failed:', error);
            showError('Apple Sign-In failed. Please try again or continue as guest.');
            showLoading(false);
        }
    };

    // Initialize Google Sign-In button
    googleSignInBtn.addEventListener('click', () => {
        try {
            // Trigger Google Sign-In
            const googleSignInDiv = document.querySelector('.g_id_signin');
            if (googleSignInDiv) {
                googleSignInDiv.click();
            } else {
                throw new Error('Google Sign-In not initialized');
            }
        } catch (error) {
            console.error('Google Sign-In error:', error);
            showError('Google Sign-In is not available. Please try another method or continue as guest.');
        }
    });

    // Initialize Apple Sign-In button
    appleSignInBtn.addEventListener('click', () => {
        try {
            // Trigger Apple Sign-In
            AppleID.auth.signIn();
        } catch (error) {
            console.error('Apple Sign-In error:', error);
            showError('Apple Sign-In is not available. Please try another method or continue as guest.');
        }
    });

    // Handle form submission (OTP)
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const phone = phoneInput.value.trim();
        currentPhone = phone;

        if (!/^[0-9]{10}$/.test(phone)) {
            phoneInput.classList.add('shake');
            showError('Please enter a valid 10-digit phone number or continue as guest');
            setTimeout(() => phoneInput.classList.remove('shake'), 500);
            return;
        }

        const submitButton = loginForm.querySelector('button[type="submit"]');
        submitButton.classList.add('loading');
        showLoading(true);

        try {
            await AuthService.sendOTP(phone);
            otpContainer.style.display = 'block';
            submitButton.classList.remove('loading');
            showLoading(false);
            otpInputs[0].focus();
            startResendTimer();
            showSuccess('OTP sent successfully!');
        } catch (error) {
            showError(error.message || 'Failed to send OTP. Please try again or continue as guest.');
            submitButton.classList.remove('loading');
            showLoading(false);
        }
    });

    // Handle OTP input
    otpInputs.forEach((input, index) => {
        input.addEventListener('keyup', (e) => {
            if (e.key >= '0' && e.key <= '9') {
                input.value = e.key;
                if (index < otpInputs.length - 1) {
                    otpInputs[index + 1].focus();
                }
                if (index === otpInputs.length - 1) {
                    verifyOTP();
                }
            } else if (e.key === 'Backspace') {
                input.value = '';
                if (index > 0) {
                    otpInputs[index - 1].focus();
                }
            }
        });

        input.addEventListener('focus', () => {
            input.select();
        });

        // Handle paste event
        input.addEventListener('paste', (e) => {
            e.preventDefault();
            const pastedData = e.clipboardData.getData('text').trim();
            if (pastedData.length === 4 && /^\d{4}$/.test(pastedData)) {
                otpInputs.forEach((input, i) => {
                    input.value = pastedData[i];
                });
                verifyOTP();
            }
        });
    });

    // Verify OTP
    async function verifyOTP() {
        const otp = Array.from(otpInputs).map(input => input.value).join('');
        
        if (otp.length !== 4) {
            showError('Please enter a valid OTP or continue as guest');
            return;
        }

        showLoading(true);

        try {
            const { sessionId, user } = await AuthService.verifyOTP(currentPhone, otp);
            handleAuthSuccess(sessionId, user);
        } catch (error) {
            showError(error.message || 'Invalid OTP. Please try again or continue as guest.');
            showLoading(false);
        }
    }

    // Handle resend timer
    function startResendTimer() {
        let timeLeft = 30;
        resendButton.disabled = true;
        
        const timer = setInterval(() => {
            if (timeLeft <= 0) {
                clearInterval(timer);
                resendButton.disabled = false;
                resendButton.textContent = 'Resend';
                return;
            }
            
            resendButton.textContent = `Resend in ${timeLeft}s`;
            timeLeft--;
        }, 1000);
    }

    // Handle resend button
    resendButton.addEventListener('click', async () => {
        if (resendButton.disabled) return;
        
        showLoading(true);
        
        try {
            await AuthService.sendOTP(currentPhone);
            showLoading(false);
            startResendTimer();
            showSuccess('OTP sent successfully!');
        } catch (error) {
            showLoading(false);
            showError(error.message || 'Failed to resend OTP. Please try again or continue as guest.');
        }
    });

    // Initialize Guest login button
    guestBtn.addEventListener('click', handleGuestLogin);

    // Handle create account link
    createAccountLink.addEventListener('click', (e) => {
        e.preventDefault();
        window.location.href = 'register.html';
    });
});

// Show notification
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);

    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
} 