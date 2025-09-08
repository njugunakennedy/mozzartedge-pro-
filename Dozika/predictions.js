// Global variables
let allMatches = [];
let filteredMatches = [];
let currentSort = 'time';

// DOM elements - will be initialized after DOM loads
let matchesGrid, loading, noMatches, competitionFilter, predictionTypeFilter, confidenceFilter, searchFilter, sortByTime, sortByConfidence, betslipsGrid;

// Statistics elements
const totalMatchesEl = document.getElementById('totalMatches');
const totalCompetitionsEl = document.getElementById('totalCompetitions');
const avgConfidenceEl = document.getElementById('avgConfidence');
const matchesTodayEl = document.getElementById('matchesToday');

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializePredictionsApp();
});

function initializePredictionsApp() {
    console.log('Initializing predictions app...');
    
    // Initialize DOM elements
    matchesGrid = document.getElementById('matchesGrid');
    loading = document.getElementById('loading');
    noMatches = document.getElementById('noMatches');
    competitionFilter = document.getElementById('competitionFilter');
    predictionTypeFilter = document.getElementById('predictionTypeFilter');
    confidenceFilter = document.getElementById('confidenceFilter');
    searchFilter = document.getElementById('searchFilter');
    sortByTime = document.getElementById('sortByTime');
    sortByConfidence = document.getElementById('sortByConfidence');
    betslipsGrid = document.getElementById('betslipsGrid');
    
    console.log('DOM elements initialized:', {
        matchesGrid: !!matchesGrid,
        loading: !!loading,
        noMatches: !!noMatches,
        competitionFilter: !!competitionFilter,
        betslipsGrid: !!betslipsGrid
    });
    
    loadMatchesData();
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
        filteredMatches = [...allMatches];
        
        console.log('Matches loaded:', allMatches.length);
        
        updateStatistics();
        populateFilters();
        renderMatches(filteredMatches);
        generateBetslips();
        
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

function updateStatistics() {
    const competitions = [...new Set(allMatches.map(match => match.competition))];
    const today = new Date().toISOString().split('T')[0];
    
    // Calculate average confidence
    let totalConfidence = 0;
    let confidenceCount = 0;
    
    allMatches.forEach(match => {
        Object.values(match.predictions).forEach(prediction => {
            if (prediction.confidence !== undefined) {
                totalConfidence += prediction.confidence;
                confidenceCount++;
            } else if (prediction.probability !== undefined) {
                totalConfidence += prediction.probability;
                confidenceCount++;
            }
        });
    });
    
    const avgConfidence = confidenceCount > 0 ? (totalConfidence / confidenceCount * 100).toFixed(1) : 0;
    
    totalMatchesEl.textContent = allMatches.length;
    totalCompetitionsEl.textContent = competitions.length;
    avgConfidenceEl.textContent = `${avgConfidence}%`;
    matchesTodayEl.textContent = allMatches.length; // Assuming all matches are for today
}

function populateFilters() {
    // Populate competition filter
    const competitions = [...new Set(allMatches.map(match => match.competition))].sort();
    competitions.forEach(competition => {
        const option = document.createElement('option');
        option.value = competition;
        option.textContent = competition;
        competitionFilter.appendChild(option);
    });
}

function setupEventListeners() {
    competitionFilter.addEventListener('change', applyFilters);
    predictionTypeFilter.addEventListener('change', applyFilters);
    confidenceFilter.addEventListener('change', applyFilters);
    searchFilter.addEventListener('input', debounce(applyFilters, 300));
    sortByTime.addEventListener('click', () => setSort('time'));
    sortByConfidence.addEventListener('click', () => setSort('confidence'));
}

function setSort(sortType) {
    currentSort = sortType;
    
    // Update button states
    document.querySelectorAll('.control-btn').forEach(btn => btn.classList.remove('active'));
    if (sortType === 'time') {
        sortByTime.classList.add('active');
    } else {
        sortByConfidence.classList.add('active');
    }
    
    applyFilters();
}

function applyFilters() {
    const selectedCompetition = competitionFilter.value;
    const selectedPredictionType = predictionTypeFilter.value;
    const selectedConfidence = confidenceFilter.value;
    const searchTerm = searchFilter.value.toLowerCase();

    filteredMatches = allMatches.filter(match => {
        // Competition filter
        if (selectedCompetition !== 'all' && match.competition !== selectedCompetition) {
            return false;
        }

        // Prediction type filter
        if (selectedPredictionType !== 'all') {
            if (!match.predictions[selectedPredictionType]) {
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

        // Search filter
        if (searchTerm && !match.home.toLowerCase().includes(searchTerm) && 
            !match.away.toLowerCase().includes(searchTerm)) {
            return false;
        }

        return true;
    });

    // Sort matches
    filteredMatches.sort((a, b) => {
        if (currentSort === 'time') {
            return a.time.localeCompare(b.time);
        } else {
            // Sort by highest confidence
            const aConfidence = getMaxConfidence(a);
            const bConfidence = getMaxConfidence(b);
            return bConfidence - aConfidence;
        }
    });

    renderMatches(filteredMatches);
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

function renderMatches(matches) {
    if (matches.length === 0) {
        matchesGrid.style.display = 'none';
        loading.style.display = 'none';
        noMatches.style.display = 'block';
        return;
    }

    matchesGrid.style.display = 'grid';
    loading.style.display = 'none';
    noMatches.style.display = 'none';

    matchesGrid.innerHTML = matches.map(match => createMatchCard(match)).join('');
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

// Debounce function for search input
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Generate betslips based on data
function generateBetslips() {
    console.log('Generating betslips...');
    
    if (!betslipsGrid) {
        console.error('betslipsGrid element not found');
        return;
    }
    
    const betslips = [
        {
            title: "Double Chance (1X) - High Confidence",
            description: "Home teams not to lose - safest option",
            type: "double_chance",
            matches: allMatches.filter(match => 
                match.predictions.double_chance && 
                match.predictions.double_chance.pick === '1X' &&
                match.predictions.double_chance.confidence >= 0.65
            ).slice(0, 10)
        },
        {
            title: "Goals Over 1.5 - Consistent Value",
            description: "High-scoring matches with good probability",
            type: "goals_over_1_5",
            matches: allMatches.filter(match => 
                match.predictions.goals_over_1_5 && 
                match.predictions.goals_over_1_5.pick === true &&
                match.predictions.goals_over_1_5.probability >= 0.6
            ).slice(0, 10)
        },
        {
            title: "Home Team Goals Over 1.5 - Home Advantage",
            description: "Home teams scoring multiple goals",
            type: "home_over_1_5",
            matches: allMatches.filter(match => 
                match.predictions.team_goals && 
                match.predictions.team_goals.home_over_1_5 &&
                match.predictions.team_goals.home_over_1_5.pick === true &&
                match.predictions.team_goals.home_over_1_5.confidence >= 0.65
            ).slice(0, 10)
        }
    ];

    betslipsGrid.innerHTML = betslips.map(betslip => createBetslipCard(betslip)).join('');
    console.log('Betslips generated:', betslips.length);
}

function createBetslipCard(betslip) {
    if (betslip.matches.length === 0) return '';

    const avgConfidence = calculateAverageConfidence(betslip.matches, betslip.type);
    const confidenceClass = getConfidenceClass(avgConfidence);
    const confidenceText = getConfidenceText(avgConfidence);

    const matchesHtml = betslip.matches.map(match => `
        <div class="betslip-match">
            <div class="betslip-teams">
                <span class="home-team">${match.home}</span>
                <span class="vs">vs</span>
                <span class="away-team">${match.away}</span>
            </div>
            <div class="betslip-pick">
                ${formatBetslipPick(match, betslip.type)}
            </div>
            <div class="betslip-confidence">
                ${getConfidenceIcon(getMatchConfidence(match, betslip.type))} 
                ${(getMatchConfidence(match, betslip.type) * 100).toFixed(0)}%
            </div>
        </div>
    `).join('');

    return `
        <div class="betslip-card">
            <div class="betslip-header">
                <h3 class="betslip-title">${betslip.title}</h3>
                <p class="betslip-description">${betslip.description}</p>
                <div class="betslip-stats">
                    <span class="betslip-count">${betslip.matches.length} matches</span>
                    <span class="confidence-badge ${confidenceClass}">
                        ${getConfidenceIcon(avgConfidence)} ${confidenceText} (${(avgConfidence * 100).toFixed(0)}%)
                    </span>
                </div>
            </div>
            <div class="betslip-matches">
                ${matchesHtml}
            </div>
            <div class="betslip-actions">
                <button class="betslip-btn primary" onclick="copyBetslip('${betslip.type}')">
                    <i class="fas fa-copy"></i>
                    Copy Betslip
                </button>
                <button class="betslip-btn secondary" onclick="openBettingSites('${betslip.type}')">
                    <i class="fas fa-external-link-alt"></i>
                    Find Odds
                </button>
            </div>
        </div>
    `;
}

function calculateAverageConfidence(matches, type) {
    let totalConfidence = 0;
    let count = 0;

    matches.forEach(match => {
        const confidence = getMatchConfidence(match, type);
        if (confidence !== undefined) {
            totalConfidence += confidence;
            count++;
        }
    });

    return count > 0 ? totalConfidence / count : 0;
}

function getMatchConfidence(match, type) {
    switch(type) {
        case 'double_chance':
            return match.predictions.double_chance?.confidence;
        case 'goals_over_1_5':
            return match.predictions.goals_over_1_5?.probability;
        case 'home_over_1_5':
            return match.predictions.team_goals?.home_over_1_5?.confidence;
        default:
            return 0;
    }
}

function formatBetslipPick(match, type) {
    switch(type) {
        case 'double_chance':
            return match.predictions.double_chance?.pick === '1X' ? '1X (Home/Draw)' : 'X2 (Draw/Away)';
        case 'goals_over_1_5':
            return 'Over 1.5 Goals';
        case 'home_over_1_5':
            return 'Home Over 1.5 Goals';
        default:
            return '';
    }
}

function copyBetslip(type) {
    const betslipCard = document.querySelector(`[data-betslip-type="${type}"]`);
    if (betslipCard) {
        const matches = betslipCard.querySelectorAll('.betslip-match');
        const betslipText = Array.from(matches).map(match => {
            const teams = match.querySelector('.betslip-teams').textContent.trim();
            const pick = match.querySelector('.betslip-pick').textContent.trim();
            return `${teams} - ${pick}`;
        }).join('\n');
        
        navigator.clipboard.writeText(betslipText).then(() => {
            alert('Betslip copied to clipboard!');
        });
    }
}

function openBettingSites(type) {
    const sites = ['mozzartbet', 'betika', 'odibet'];
    sites.forEach(site => {
        window.open(`https://www.${site}.com`, '_blank');
    });
}

// Setup event listeners after DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    setupEventListeners();
});
