# Football Betting Predictions Web Application

A responsive web application for displaying AI-powered football betting predictions with modern UI and comprehensive filtering capabilities.

## Features

### 🎯 Core Functionality
- **JSON Data Parsing**: Dynamically loads and displays match data from JSON format
- **Match Cards**: Beautiful card layout showing team names, match times, and league information
- **AI Predictions**: Comprehensive prediction types including:
  - 1X, X2 predictions
  - Over/Under predictions (Ov1.5, Ov2.5)
  - GG/NG (Both Teams to Score) predictions
  - Home/Away specific over predictions

### 🎨 Visual Design
- **Color Scheme**: Uses #1a2a6c (navy), #b21f1f (red), and #fdbb2d (gold) as primary colors
- **Modern UI**: Clean, professional design with smooth animations and hover effects
- **Responsive Layout**: Fully responsive design that works on desktop, tablet, and mobile devices
- **Confidence Indicators**: Visual confidence levels (high/medium/low) with color-coded badges

### 🔧 Interactive Features
- **Performance Statistics**: Dashboard showing win rate, ROI, winning picks, and total picks
- **Advanced Filtering**: Filter matches by:
  - League (Premier League, La Liga, Bundesliga, etc.)
  - Prediction type (1X, X2, Over/Under, GG/NG)
  - Confidence level (high, medium, low)
- **Betting Integration**: Direct links to Mozzartbet, Betika, and Odibet betting sites

## File Structure

```
├── index.html          # Main HTML structure
├── styles.css          # CSS styling and responsive design
├── script.js           # JavaScript functionality
├── sample-data.json    # Sample JSON data for testing
└── README.md           # This documentation file
```

## Usage

### Basic Usage
1. Open `index.html` in a web browser
2. The application will automatically load with sample data
3. Use the filters to narrow down matches by league, prediction type, or confidence level
4. Click on betting site buttons to open external betting platforms

### Loading External Data
To load your own JSON data, use the provided JavaScript API:

```javascript
// Load external JSON data
const jsonData = `[
  {
    "id": 1,
    "homeTeam": "Team A",
    "awayTeam": "Team B",
    "matchTime": "15:30",
    "league": "Premier League",
    "predictions": {
      "1X": { "value": "1.45", "confidence": "high" },
      "over1.5": { "value": "1.15", "confidence": "high" }
    }
  }
]`;

FootballPredictions.loadMatchesData(jsonData);
```

### JSON Data Format
The application expects JSON data in the following format:

```json
[
  {
    "id": 1,
    "homeTeam": "Home Team Name",
    "awayTeam": "Away Team Name", 
    "matchTime": "HH:MM",
    "league": "League Name",
    "predictions": {
      "1X": { "value": "1.45", "confidence": "high" },
      "X2": { "value": "1.20", "confidence": "medium" },
      "over1.5": { "value": "1.15", "confidence": "high" },
      "over2.5": { "value": "1.85", "confidence": "medium" },
      "gg": { "value": "1.65", "confidence": "high" },
      "ng": { "value": "2.40", "confidence": "low" },
      "homeOver1.5": { "value": "2.10", "confidence": "low" },
      "awayOver1.5": { "value": "1.95", "confidence": "medium" }
    }
  }
]
```

### Prediction Types
- **1X**: Home team win or draw
- **X2**: Draw or away team win
- **over1.5**: Over 1.5 goals
- **over2.5**: Over 2.5 goals
- **gg**: Both teams to score (GG)
- **ng**: No goals (NG)
- **homeOver1.5**: Home team over 1.5 goals
- **awayOver1.5**: Away team over 1.5 goals

### Confidence Levels
- **high**: High confidence prediction (green badge)
- **medium**: Medium confidence prediction (yellow badge)
- **low**: Low confidence prediction (red badge)

## JavaScript API

The application exposes several functions for external integration:

```javascript
// Load new match data
FootballPredictions.loadMatchesData(jsonString);

// Add a single match
FootballPredictions.addMatch(matchObject);

// Update performance statistics
FootballPredictions.updateStats({
  winRate: 85,
  roi: 24.5,
  winningPicks: 127,
  totalPicks: 149
});

// Get current matches
const matches = FootballPredictions.getCurrentMatches();

// Get filtered matches
const filtered = FootballPredictions.getFilteredMatches();
```

## Responsive Design

The application is fully responsive and adapts to different screen sizes:

- **Desktop**: Full grid layout with all features visible
- **Tablet**: Adjusted grid columns and optimized spacing
- **Mobile**: Single column layout with stacked elements

## Browser Compatibility

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## Customization

### Colors
To change the color scheme, modify the CSS variables in `styles.css`:

```css
:root {
  --primary-navy: #1a2a6c;
  --primary-red: #b21f1f;
  --primary-gold: #fdbb2d;
}
```

### Adding New Prediction Types
To add new prediction types, update the `formatPredictionType` function in `script.js`:

```javascript
function formatPredictionType(type) {
  const typeMap = {
    '1X': '1X',
    'X2': 'X2',
    'over1.5': 'Ov1.5',
    'over2.5': 'Ov2.5',
    'gg': 'GG',
    'ng': 'NG',
    'homeOver1.5': 'H Ov1.5',
    'awayOver1.5': 'A Ov1.5',
    'newType': 'New Type'  // Add your new type here
  };
  return typeMap[type] || type;
}
```

## License

This project is open source and available under the MIT License.
