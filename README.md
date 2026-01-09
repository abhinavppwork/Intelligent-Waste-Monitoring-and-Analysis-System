# 🌱 EcoSort - Smart Waste Management System

A modern, responsive web application for intelligent waste segregation using QR code scanning and data analytics. Perfect for engineering mini-projects, hackathons, and smart city demonstrations.

## 🎯 Features

### 1. **Home Page** (`index.html`)
- **Hero Section**: Eye-catching introduction with animated icons
- **Problem Statement**: Visual cards explaining the global waste crisis
- **Solution Overview**: Step-by-step feature showcase
- **Call-to-Action**: Clear navigation to scanner and analytics

### 2. **QR Scanner Page** (`scanner.html`)
- **Real-time Camera Scanning**: Uses device camera to scan QR codes
- **Instant Waste Classification**: Automatic categorization into:
  - 🔵 Dry Waste (Recyclable)
  - 🟢 Wet Waste (Compostable)
  - 🟣 E-Waste (Electronic)
  - 🔴 Hazardous Waste
- **Detailed Instructions**: Step-by-step disposal guidelines
- **Environmental Impact**: Shows the positive impact of proper disposal
- **Scan History**: Stores and displays recent scans
- **Test Mode**: Demo functionality without actual QR codes

### 3. **Analytics Dashboard** (`analytics.html`)
- **Statistics Cards**: Real-time waste tracking
- **Interactive Charts**: 
  - Daily waste generation (line chart)
  - Category distribution (doughnut chart)
  - Recycling vs landfill comparison (bar chart)
- **Environmental Impact Metrics**:
  - CO₂ prevented
  - Energy saved
  - Water conserved
  - Landfill diverted
- **Achievements System**: Gamification with unlockable badges
- **Smart Tips**: Educational waste management guidance

## 🛠️ Technologies Used

- **HTML5**: Semantic markup
- **CSS3**: 
  - Flexbox & Grid layouts
  - CSS animations & transitions
  - CSS variables for theming
  - Responsive design
- **Vanilla JavaScript**: 
  - localStorage for data persistence
  - Event handling
  - Chart.js integration
- **External Libraries**:
  - [html5-qrcode](https://github.com/mebjas/html5-qrcode): QR code scanning
  - [Chart.js](https://www.chartjs.org/): Data visualization
  - [Font Awesome](https://fontawesome.com/): Icons

## 📁 Project Structure

```
ecosort/
├── index.html          # Home page with problem statement
├── scanner.html        # QR code scanner interface
├── analytics.html      # Data analytics dashboard
├── style.css          # Global styles and layout
├── scanner.css        # Scanner-specific styles
├── analytics.css      # Dashboard-specific styles
├── script.js          # Home page interactions
├── scanner.js         # QR scanning logic
├── analytics.js       # Charts and analytics
└── README.md          # Documentation
```

## 🚀 Getting Started

### Prerequisites
- A modern web browser (Chrome, Firefox, Safari, Edge)
- A web server (for camera access) - can use:
  - Python: `python -m http.server 8000`
  - Node.js: `npx serve`
  - VS Code: Live Server extension

### Installation

1. **Clone or Download** the project files
2. **Open in Browser** (with web server for camera features):
   ```bash
   # Using Python
   python -m http.server 8000
   # Then open http://localhost:8000
   ```
3. **Start Exploring**:
   - View the home page to understand the problem
   - Test the scanner with "Test with Sample" button
   - Check analytics dashboard with mock data

## 🎮 How to Use

### Testing the Scanner (Without Real QR Codes)

1. Navigate to the **Scanner** page
2. Click **"Test with Sample"** button
3. View the scan results and disposal instructions
4. Click **"Log This Waste"** to add to analytics
5. Scan multiple items to build up data

### Using Real QR Codes

1. Click **"Start Scanner"** (allow camera access)
2. Point camera at QR code containing waste identifiers:
   - `PLASTIC_BOTTLE_001`
   - `FOOD_WASTE_001`
   - `BATTERY_001`
   - `PAINT_CAN_001`
   - `PAPER_001`
3. Results appear automatically after detection
4. Log the scan to save to history

### Viewing Analytics

1. Go to **Analytics** page
2. View real-time statistics from your scans
3. Toggle between 7, 14, or 30-day views
4. Check your environmental impact
5. Export data as JSON file

## 💾 Data Storage

The application uses `localStorage` to persist data:

- **wasteScans**: Array of all scanned items
- **wasteAnalytics**: Daily aggregated waste data

Data persists across browser sessions but is device-specific.

## 🎨 Customization

### Color Scheme
Edit CSS variables in `style.css`:
```css
:root {
    --primary-green: #10b981;
    --primary-dark: #059669;
    --secondary-blue: #3b82f6;
    --accent-orange: #f59e0b;
    /* ... */
}
```

### Waste Database
Add items in `scanner.js`:
```javascript
const wasteDatabase = {
    'YOUR_QR_CODE': {
        category: 'dry',
        name: 'Item Name',
        icon: 'fa-icon-name',
        badge: 'RECYCLABLE',
        instructions: ['Step 1', 'Step 2'],
        impact: 'Environmental impact text'
    }
};
```

## 📱 Responsive Design

Fully responsive across devices:
- **Desktop**: Full featured experience
- **Tablet**: Optimized layouts
- **Mobile**: Touch-friendly interface

## 🌟 Key Features for Presentations

### For Engineering Projects:
- **Real-world Problem**: Addresses global waste crisis
- **Technology Integration**: QR codes, camera, data analytics
- **User-friendly**: Clean, modern interface
- **Data Visualization**: Professional charts and metrics

### For Hackathons:
- **Complete Solution**: End-to-end waste management
- **Scalable**: Can integrate with IoT sensors
- **Social Impact**: Environmental sustainability focus
- **Extensible**: Easy to add features

### For Smart City Demos:
- **Citizen Engagement**: Gamification with achievements
- **Data-Driven**: Analytics for policy decisions
- **Educational**: Tips and impact metrics
- **Practical**: Real-world application

## 🔧 Browser Compatibility

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+

**Note**: Camera access requires HTTPS or localhost.

## 📊 Mock Data

The analytics page includes mock data generation for demonstration:
- 30 days of waste data
- Realistic distribution patterns
- Random variations for authenticity

Set `MOCK_DATA_ENABLED = false` in `analytics.js` to use only real scan data.

## 🚀 Future Enhancements

Potential features to add:
- [ ] Backend integration for multi-user data
- [ ] AI-powered image recognition (no QR needed)
- [ ] Social sharing of achievements
- [ ] Community leaderboards
- [ ] Integration with municipal waste systems
- [ ] Real-time notifications
- [ ] Multi-language support
- [ ] Offline PWA functionality

## 🤝 Contributing

Ideas for improvements:
1. Add more waste categories
2. Improve accessibility features
3. Add more chart types
4. Create mobile apps
5. Integrate with smart bins

## 📄 License

This project is open source and available for educational purposes.

## 👨‍💻 Credits

Developed as a demonstration project for:
- Engineering mini projects
- Hackathon submissions
- Smart city initiatives
- Sustainability education

## 📞 Support

For questions or issues:
- Check browser console for errors
- Ensure camera permissions are granted
- Use HTTPS or localhost for camera access
- Clear localStorage if data issues occur

## 🎓 Learning Resources

To understand the code better:
- **HTML/CSS**: MDN Web Docs
- **JavaScript**: JavaScript.info
- **Chart.js**: Official documentation
- **QR Scanning**: html5-qrcode GitHub

---

**Made with 💚 for a sustainable future**

Start scanning, start saving the planet! 🌍♻️
