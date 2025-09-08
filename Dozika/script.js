// Global variables for real data
let allMatches = [];
let currentMatches = [];
let filteredMatches = [];

// Performance statistics data
const performanceStats = {
    winRate: 85,
    roi: 24.5,
    winningPicks: 127,
    totalPicks: 149
};

// DOM elements - will be initialized after DOM loads
let matchesGrid, loading, noMatches, leagueFilter, predictionFilter, confidenceFilter, oddsGrid;

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    console.log('Initializing app...');
    
    // Initialize DOM elements
    matchesGrid = document.getElementById('matchesGrid');
    loading = document.getElementById('loading');
    noMatches = document.getElementById('noMatches');
    leagueFilter = document.getElementById('leagueFilter');
    predictionFilter = document.getElementById('predictionFilter');
    confidenceFilter = document.getElementById('confidenceFilter');
    oddsGrid = document.getElementById('oddsGrid');
    
    console.log('DOM elements:', {
        matchesGrid: !!matchesGrid,
        loading: !!loading,
        noMatches: !!noMatches,
        leagueFilter: !!leagueFilter,
        predictionFilter: !!predictionFilter,
        confidenceFilter: !!confidenceFilter,
        oddsGrid: !!oddsGrid
    });
    
    loadMatchesData();
    setupEventListeners();
}

async function loadMatchesData() {
    try {
        console.log('Starting to load matches data...');
        
        if (loading) loading.style.display = 'block';
        if (matchesGrid) matchesGrid.style.display = 'none';
        if (noMatches) noMatches.style.display = 'none';

        console.log('Fetching data.json...');
        const response = await fetch('data.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Data loaded:', data);
        
        allMatches = data.matches || [];
        currentMatches = [...allMatches];
        filteredMatches = [...allMatches];
        
        console.log('Matches loaded:', allMatches.length);
        
        updatePerformanceStats();
        populateLeagueFilter();
        renderMatches(filteredMatches);
        generateBestOdds();
        
        if (loading) loading.style.display = 'none';
        console.log('Data loading completed successfully');
    } catch (error) {
        console.error('Error loading matches data:', error);
        if (loading) {
            loading.innerHTML = `
                <i class="fas fa-exclamation-triangle" style="color: #b21f1f;"></i>
                <p>Error loading predictions data: ${error.message}</p>
                <p>Please check console for details.</p>
            `;
        }
    }
}

function updatePerformanceStats() {
    document.getElementById('winRate').textContent = `${performanceStats.winRate}%`;
    document.getElementById('roi').textContent = `+${performanceStats.roi}%`;
    document.getElementById('winningPicks').textContent = performanceStats.winningPicks;
    document.getElementById('totalPicks').textContent = performanceStats.totalPicks;
}

function populateLeagueFilter() {
    const leagues = [...new Set(currentMatches.map(match => match.competition))];
    leagues.forEach(league => {
        const option = document.createElement('option');
        option.value = league;
        option.textContent = league;
        leagueFilter.appendChild(option);
    });
}

function setupEventListeners() {
    leagueFilter.addEventListener('change', applyFilters);
    predictionFilter.addEventListener('change', applyFilters);
    confidenceFilter.addEventListener('change', applyFilters);
}

function applyFilters() {
    const selectedLeague = leagueFilter.value;
    const selectedPrediction = predictionFilter.value;
    const selectedConfidence = confidenceFilter.value;

    filteredMatches = currentMatches.filter(match => {
        // League filter
        if (selectedLeague !== 'all' && match.competition !== selectedLeague) {
            return false;
        }

        // Prediction type filter
        if (selectedPrediction !== 'all') {
            if (!match.predictions[selectedPrediction]) {
                return false;
            }
        }

        // Confidence filter
        if (selectedConfidence !== 'all') {
            const hasConfidence = Object.values(match.predictions).some(prediction => {
                const confidence = prediction.confidence || prediction.probability;
                if (confidence === undefined) return false;
                
                switch(selectedConfidence) {
                    case 'high': return confidence >= 0.7;
                    case 'medium': return confidence >= 0.5 && confidence < 0.7;
                    case 'low': return confidence < 0.5;
                    default: return false;
                }
            });
            if (!hasConfidence) {
                return false;
            }
        }

        return true;
    });

    renderMatches(filteredMatches);
}

function renderMatches(matches) {
    console.log('Rendering matches:', matches.length);
    
    if (!matchesGrid) {
        console.error('matchesGrid element not found');
        return;
    }
    
    if (matches.length === 0) {
        if (matchesGrid) matchesGrid.style.display = 'none';
        if (loading) loading.style.display = 'none';
        if (noMatches) noMatches.style.display = 'block';
        return;
    }

    if (matchesGrid) matchesGrid.style.display = 'grid';
    if (loading) loading.style.display = 'none';
    if (noMatches) noMatches.style.display = 'none';

    matchesGrid.innerHTML = matches.map(match => createMatchCard(match)).join('');
    console.log('Matches rendered successfully');
}

function createMatchCard(match) {
    const predictionsHtml = Object.entries(match.predictions)
        .map(([type, data]) => createPredictionItem(type, data))
        .join('');

    return `
        <div class="match-card" data-match-id="${match.home}-${match.away}">
            <div class="match-header">
                <div class="match-time">
                    <i class="fas fa-clock"></i>
                    ${match.time}
                </div>
                <div class="league-badge">${match.competition}</div>
            </div>
            
            <div class="teams">
                <div class="team">
                    <div class="team-logo">${match.home.charAt(0)}</div>
                    <div class="team-name">${match.home}</div>
                </div>
                <div class="vs">VS</div>
                <div class="team">
                    <div class="team-logo">${match.away.charAt(0)}</div>
                    <div class="team-name">${match.away}</div>
                </div>
            </div>

            <div class="predictions">
                <div class="predictions-title">
                    <i class="fas fa-brain"></i>
                    AI Predictions
                </div>
                <div class="predictions-grid">
                    ${predictionsHtml}
                </div>
            </div>

            <div class="betting-buttons">
                <a href="#" class="betting-btn mozzartbet" onclick="openBettingSite('mozzartbet', '${match.home}', '${match.away}')">
                    <i class="fas fa-external-link-alt"></i>
                    Mozzartbet
                </a>
                <a href="#" class="betting-btn betika" onclick="openBettingSite('betika', '${match.home}', '${match.away}')">
                    <i class="fas fa-external-link-alt"></i>
                    Betika
                </a>
                <a href="#" class="betting-btn odibet" onclick="openBettingSite('odibet', '${match.home}', '${match.away}')">
                    <i class="fas fa-external-link-alt"></i>
                    Odibet
                </a>
            </div>
        </div>
    `;
}

function createPredictionItem(type, data) {
    let confidence, confidenceClass, confidenceText, predictionValue, predictionText;
    
    if (type === 'double_chance') {
        confidence = data.confidence;
        predictionValue = data.pick;
        predictionText = formatDoubleChance(data.pick);
    } else if (type === 'goals_over_1_5' || type === 'goals_over_2_5') {
        confidence = data.probability;
        predictionValue = data.pick ? 'Yes' : 'No';
        predictionText = formatOverUnder(type, data.pick);
    } else if (type === 'both_teams_to_score') {
        confidence = data.probability;
        predictionValue = data.pick;
        predictionText = formatBothTeamsToScore(data.pick);
    } else if (type === 'team_goals') {
        // Handle team goals - show both home and away
        return Object.entries(data).map(([teamType, teamData]) => {
            confidence = teamData.confidence;
            predictionValue = teamData.pick ? 'Yes' : 'No';
            predictionText = formatTeamGoals(teamType, teamData.pick);
            confidenceClass = getConfidenceClass(confidence);
            confidenceText = getConfidenceText(confidence);
            
            return `
                <div class="prediction-item">
                    <div class="prediction-type">${predictionText}</div>
                    <div class="prediction-value">${predictionValue}</div>
                    <div class="confidence-badge ${confidenceClass}">
                        ${getConfidenceIcon(confidence)} ${confidenceText}
                    </div>
                </div>
            `;
        }).join('');
    }
    
    confidenceClass = getConfidenceClass(confidence);
    confidenceText = getConfidenceText(confidence);
    
    return `
        <div class="prediction-item">
            <div class="prediction-type">${predictionText}</div>
            <div class="prediction-value">${predictionValue}</div>
            <div class="confidence-badge ${confidenceClass}">
                ${getConfidenceIcon(confidence)} ${confidenceText}
            </div>
        </div>
    `;
}

function formatDoubleChance(pick) {
    return pick === '1X' ? '1X (Home/Draw)' : 'X2 (Draw/Away)';
}

function formatOverUnder(type, pick) {
    const goalCount = type === 'goals_over_1_5' ? '1.5' : '2.5';
    return `Over ${goalCount} Goals`;
}

function formatBothTeamsToScore(pick) {
    return pick === 'GG' ? 'Both Teams Score' : 'No Goals';
}

function formatTeamGoals(teamType, pick) {
    const team = teamType === 'home_over_1_5' ? 'Home' : 'Away';
    return `${team} Over 1.5`;
}

function getConfidenceClass(confidence) {
    if (confidence >= 0.7) return 'confidence-high';
    if (confidence >= 0.5) return 'confidence-medium';
    return 'confidence-low';
}

function getConfidenceText(confidence) {
    if (confidence >= 0.7) return 'high';
    if (confidence >= 0.5) return 'medium';
    return 'low';
}

function getConfidenceIcon(confidence) {
    if (confidence >= 0.7) return '<i class="fas fa-check-circle"></i>';
    if (confidence >= 0.5) return '<i class="fas fa-exclamation-circle"></i>';
    return '<i class="fas fa-question-circle"></i>';
}

// Generate best odds based on highest confidence levels
function generateBestOdds() {
    console.log('Generating best odds...');
    
    if (!oddsGrid) {
        console.error('oddsGrid element not found');
        return;
    }
    
    const bestOdds = [];
    
    // Find top picks for each prediction type
    const doubleChancePicks = allMatches
        .filter(match => match.predictions.double_chance && match.predictions.double_chance.confidence >= 0.65)
        .sort((a, b) => b.predictions.double_chance.confidence - a.predictions.double_chance.confidence)
        .slice(0, 5);
    
    const over15Picks = allMatches
        .filter(match => match.predictions.goals_over_1_5 && match.predictions.goals_over_1_5.pick && match.predictions.goals_over_1_5.probability >= 0.6)
        .sort((a, b) => b.predictions.goals_over_1_5.probability - a.predictions.goals_over_1_5.probability)
        .slice(0, 5);
    
    const homeGoalsPicks = allMatches
        .filter(match => match.predictions.team_goals && match.predictions.team_goals.home_over_1_5 && match.predictions.team_goals.home_over_1_5.pick && match.predictions.team_goals.home_over_1_5.confidence >= 0.65)
        .sort((a, b) => b.predictions.team_goals.home_over_1_5.confidence - a.predictions.team_goals.home_over_1_5.confidence)
        .slice(0, 5);
    
    // Combine and sort by confidence
    [...doubleChancePicks, ...over15Picks, ...homeGoalsPicks].forEach(match => {
        const maxConfidence = getMaxConfidence(match);
        bestOdds.push({ match, confidence: maxConfidence });
    });
    
    bestOdds.sort((a, b) => b.confidence - a.confidence);
    
    oddsGrid.innerHTML = bestOdds.slice(0, 8).map(item => createOddsCard(item.match)).join('');
    console.log('Best odds generated:', bestOdds.length);
}

function getMaxConfidence(match) {
    let maxConfidence = 0;
    Object.values(match.predictions).forEach(prediction => {
        const confidence = prediction.confidence || prediction.probability;
        if (confidence !== undefined && confidence > maxConfidence) {
            maxConfidence = confidence;
        }
    });
    return maxConfidence;
}

function createOddsCard(match) {
    const maxConfidence = getMaxConfidence(match);
    const confidenceClass = getConfidenceClass(maxConfidence);
    const confidenceText = getConfidenceText(maxConfidence);
    
    // Find the best prediction for this match
    let bestPrediction = null;
    let bestConfidence = 0;
    
    Object.entries(match.predictions).forEach(([type, data]) => {
        const confidence = data.confidence || data.probability;
        if (confidence !== undefined && confidence > bestConfidence) {
            bestConfidence = confidence;
            bestPrediction = { type, data };
        }
    });
    
    if (!bestPrediction) return '';
    
    const predictionText = formatBestOddsPrediction(bestPrediction.type, bestPrediction.data);
    
    return `
        <div class="odds-card">
            <div class="odds-header">
                <div class="odds-time">${match.time}</div>
                <div class="odds-league">${match.competition}</div>
            </div>
            <div class="odds-teams">
                <span class="odds-home">${match.home}</span>
                <span class="odds-vs">vs</span>
                <span class="odds-away">${match.away}</span>
            </div>
            <div class="odds-prediction">
                <div class="odds-pick">${predictionText}</div>
                <div class="odds-confidence ${confidenceClass}">
                    ${getConfidenceIcon(maxConfidence)} ${confidenceText} (${(maxConfidence * 100).toFixed(0)}%)
                </div>
            </div>
            <div class="odds-actions">
                <button class="odds-btn" onclick="openBettingSite('mozzartbet', '${match.home}', '${match.away}')">
                    <i class="fas fa-external-link-alt"></i>
                    Find Odds
                </button>
            </div>
        </div>
    `;
}

function formatBestOddsPrediction(type, data) {
    switch(type) {
        case 'double_chance':
            return data.pick === '1X' ? '1X (Home/Draw)' : 'X2 (Draw/Away)';
        case 'goals_over_1_5':
            return 'Over 1.5 Goals';
        case 'goals_over_2_5':
            return 'Over 2.5 Goals';
        case 'both_teams_to_score':
            return data.pick === 'GG' ? 'Both Teams Score' : 'No Goals';
        case 'team_goals':
            if (data.home_over_1_5) {
                return data.home_over_1_5.pick ? 'Home Over 1.5' : 'Home Under 1.5';
            } else if (data.away_over_1_5) {
                return data.away_over_1_5.pick ? 'Away Over 1.5' : 'Away Under 1.5';
            }
            return 'Team Goals';
        default:
            return type;
    }
}

function openBettingSite(site, homeTeam, awayTeam) {
    const searchQuery = encodeURIComponent(`${homeTeam} vs ${awayTeam}`);
    let url = '';
    
    switch(site) {
        case 'mozzartbet':
            url = `https://www.mozzartbet.com/search?q=${searchQuery}`;
            break;
        case 'betika':
            url = `https://www.betika.com/search?q=${searchQuery}`;
            break;
        case 'odibet':
            url = `https://www.odibet.com/search?q=${searchQuery}`;
            break;
        default:
            return;
    }
    
    window.open(url, '_blank');
}

// Function to load external JSON data (for future use)
function loadMatchesData(jsonData) {
    try {
        currentMatches = JSON.parse(jsonData);
        filteredMatches = [...currentMatches];
        populateLeagueFilter();
        renderMatches(filteredMatches);
    } catch (error) {
        console.error('Error parsing JSON data:', error);
        alert('Error loading match data. Please check the JSON format.');
    }
}

// Function to add new match data
function addMatch(matchData) {
    currentMatches.push(matchData);
    filteredMatches = [...currentMatches];
    populateLeagueFilter();
    renderMatches(filteredMatches);
}

// Function to update performance statistics
function updateStats(newStats) {
    performanceStats.winRate = newStats.winRate || performanceStats.winRate;
    performanceStats.roi = newStats.roi || performanceStats.roi;
    performanceStats.winningPicks = newStats.winningPicks || performanceStats.winningPicks;
    performanceStats.totalPicks = newStats.totalPicks || performanceStats.totalPicks;
    
    updatePerformanceStats();
}

// Export functions for external use
window.FootballPredictions = {
    loadMatchesData,
    addMatch,
    updateStats,
    getCurrentMatches: () => currentMatches,
    getFilteredMatches: () => filteredMatches
};
