# Mozzartedge Virtual Leagues SPA

A modern, responsive single-page application for Mozzartedge Virtual Leagues predictions with data-driven insights and premium features.

## Features

### 🎯 Core Features
- **Hero Section**: Eye-catching landing with animated 3D elements
- **How It Works**: Trust-building section explaining the prediction process
- **Predictions Table**: Dynamic tables for Virtual Instant and Virtual League matches
- **Premium Section**: Subscription plans with WhatsApp integration
- **Responsive Design**: Mobile-first approach with modern UI/UX

### 🎨 Design Highlights
- **Dark Theme**: Professional dark color scheme (#121212 background)
- **Modern Typography**: Google Fonts (Montserrat, Inter, Poppins)
- **Smooth Animations**: CSS animations and JavaScript interactions
- **Professional Styling**: Clean, betting slip-style tables
- **Visual Elements**: Confidence bars, status indicators, and countdown timers

### ⚡ Technical Features
- **Component-based JavaScript**: Modern ES6+ class architecture
- **Dynamic Data Loading**: JSON-based prediction data
- **Tab Switching**: Seamless navigation between leagues
- **Smooth Scrolling**: Enhanced user experience
- **WhatsApp Integration**: Direct contact and subscription buttons

## File Structure

```
Coolclads/
├── index.html          # Main HTML structure
├── styles.css          # Complete CSS styling
├── script.js           # JavaScript functionality
├── data.json           # Prediction data (manually updated)
└── README.md           # This file
```

## Getting Started

### 1. Setup
1. Download all files to your local directory
2. Open `index.html` in a modern web browser
3. The application will load with sample data automatically

### 2. Customizing Data
Edit `data.json` to update predictions:

```json
{
  "virtual-instant": [
    {
      "match": "Team A vs Team B",
      "kickoff": "7:15 PM",
      "prediction": "Over 2.5",
      "odds": 2.15,
      "confidence": 85,
      "status": "upcoming"
    }
  ]
}
```

### 3. Status Options
- `"upcoming"` - Shows countdown timer
- `"win"` - Shows ✅ WIN
- `"loss"` - Shows ❌ LOSS

### 4. Confidence Levels
- 80%+ = Green (High confidence)
- 60-79% = Orange (Medium confidence)
- <60% = Red (Low confidence)

## Customization Guide

### Colors
Edit CSS variables in `styles.css`:

```css
:root {
    --primary-color: #006400;      /* Main brand color */
    --accent-color: #FF8C00;      /* Accent color */
    --background-dark: #121212;   /* Dark background */
    --success-color: #4CAF50;     /* Success/win color */
    --warning-color: #FF9800;    /* Warning/medium confidence */
    --error-color: #F44336;      /* Error/loss color */
}
```

### Contact Information
Update WhatsApp number in `script.js`:

```javascript
openWhatsAppWithMessage(message) {
    const phoneNumber = '+254700000000'; // Change this
    // ...
}
```

### Premium Pricing
Edit pricing in `index.html`:

```html
<div class="price">KSh 199</div>  <!-- Weekly plan -->
<div class="price">KSh 599</div>  <!-- Monthly plan -->
```

## Browser Compatibility

- ✅ Chrome 60+
- ✅ Firefox 55+
- ✅ Safari 12+
- ✅ Edge 79+
- ✅ Mobile browsers

## Performance Features

- **Lazy Loading**: Images and animations load on scroll
- **Optimized CSS**: Efficient selectors and minimal reflows
- **Smooth Animations**: Hardware-accelerated CSS transitions
- **Responsive Images**: Optimized for different screen sizes

## SEO Features

- **Meta Tags**: Proper title and description
- **Semantic HTML**: Proper heading structure
- **Alt Text**: Descriptive image alt attributes
- **Structured Data**: JSON-LD ready for implementation

## Security Considerations

- **Responsible Gambling**: Prominent disclaimer
- **Data Validation**: Input sanitization
- **HTTPS Ready**: Secure external links
- **Privacy Compliant**: No tracking scripts

## Future Enhancements

### Planned Features
- [ ] Real-time data updates
- [ ] User authentication
- [ ] Prediction history
- [ ] Advanced analytics
- [ ] Push notifications
- [ ] Dark/Light theme toggle

### Technical Improvements
- [ ] Service Worker for offline support
- [ ] Progressive Web App features
- [ ] Advanced caching strategies
- [ ] Performance monitoring

## Support

For technical support or customization requests:
- WhatsApp: +254 700 000 000
- Email: info@mozzartedgepro.com

## License

This project is for educational and demonstration purposes. Please ensure compliance with local gambling regulations.

---

**⚠️ Important**: This application is for entertainment purposes only. Please gamble responsibly and only bet what you can afford to lose.
