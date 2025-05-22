document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const phoneInput = document.getElementById('phoneInput');
    const otpContainer = document.getElementById('otpContainer');
    const otpInputs = document.querySelectorAll('.otp-digit');
    const errorMessage = document.getElementById('errorMessage');
    const socialButtons = document.querySelectorAll('.social-btn');
    
    // Phone number validation
    function isValidPhoneNumber(phone) {
        return /^[0-9]{10}$/.test(phone);
    }

    // Handle OTP input navigation
    otpInputs.forEach((input, index) => {
        input.addEventListener('keyup', (e) => {
            if (e.key >= 0 && e.key <= 9) {
                if (index < otpInputs.length - 1) {
                    otpInputs[index + 1].focus();
                }
            } else if (e.key === 'Backspace') {
                if (index > 0) {
                    otpInputs[index - 1].focus();
                }
            }
        });
    });

    // Handle form submission
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const phone = phoneInput.value.trim();
        
        if (!isValidPhoneNumber(phone)) {
            errorMessage.textContent = 'Please enter a valid 10-digit phone number';
            errorMessage.style.display = 'block';
            return;
        }

        // Hide error message if validation passes
        errorMessage.style.display = 'none';
        
        // Show OTP input container
        otpContainer.style.display = 'block';
        
        // In a real application, you would make an API call here to send OTP
        console.log('Sending OTP to:', phone);
    });

    // Handle social login buttons
    socialButtons.forEach(button => {
        button.addEventListener('click', () => {
            const provider = button.getAttribute('data-provider');
            // In a real application, you would implement social login here
            console.log('Logging in with:', provider);
        });
    });

    // Handle guest login
    document.querySelector('.guest-btn').addEventListener('click', () => {
        // In a real application, you would implement guest login here
        console.log('Continuing as guest');
        window.location.href = 'dashboard.html';
    });
}); 