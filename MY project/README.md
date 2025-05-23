# MediQuick - Medicine Delivery Application

MediQuick is a modern, user-friendly medicine delivery application that connects users with nearby pharmacies for quick and reliable medicine delivery. The application features a clean, medical-themed interface and focuses on providing essential healthcare services.

## Features

### 1. User Authentication
- Phone number-based OTP verification
- Social login options (Google, Apple)
- Guest mode for quick access

### 2. Medicine Ordering
- Browse medicines by category
- Search functionality
- Add to cart
- Upload prescriptions (camera/file upload)
- Real-time order tracking

### 3. Emergency Services
- SOS button for immediate assistance
- Quick access to emergency medicines
- Ambulance calling feature
- Nearby pharmacy locator
- Emergency contacts management

### 4. Profile Management
- Personal information management
- Multiple delivery addresses
- Order history
- Payment methods

### 5. Security Features
- Secure OTP verification
- Encrypted data storage
- Privacy-focused design

## Technical Stack

- Frontend:
  - HTML5
  - CSS3 (with Flexbox and Grid)
  - JavaScript (ES6+)
  - Tailwind CSS for styling
  - Material Icons for iconography

- Storage:
  - LocalStorage for data persistence
  - Session management

## Getting Started

1. Clone the repository:
```bash
git clone https://github.com/yourusername/mediquick.git
cd mediquick
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

4. Open `http://localhost:3000` in your browser

## Project Structure

```
mediquick/
├── assets/           # Images and icons
├── css/             # Stylesheets
│   └── styles.css   # Main stylesheet
├── js/              # JavaScript files
│   ├── login.js     # Authentication
│   ├── upload.js    # Prescription upload
│   ├── tracking.js  # Order tracking
│   ├── emergency.js # Emergency services
│   └── profile.js   # Profile management
├── index.html       # Login page
├── dashboard.html   # Main dashboard
├── cart.html        # Shopping cart
└── README.md        # Documentation
```

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Security Considerations

1. Data Protection
   - All sensitive data is stored securely
   - No medical information is stored locally
   - Prescription images are encrypted before upload

2. User Privacy
   - Location access only when required
   - Optional emergency contact storage
   - Clear data removal process

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Contact

Your Name - your.email@example.com
Project Link: https://github.com/yourusername/mediquick

## Acknowledgments

- Material Icons
- Tailwind CSS
- Google Fonts 