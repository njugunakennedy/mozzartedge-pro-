// Results Page JavaScript

// Sample data for yesterday's results
const yesterdayResults = {
    "mozzartedge": [
        {
            "match": "FC Torino vs London City",
            "prediction": "Over 2.5",
            "odds": 2.15,
            "result": "3-2",
            "status": "won",
            "profit": "+KSh 1,150"
        },
        {
            "match": "Paris United vs Berlin FC",
            "prediction": "GG",
            "odds": 1.85,
            "result": "2-1",
            "status": "won",
            "profit": "+KSh 850"
        },
        {
            "match": "Madrid Stars vs Rome Warriors",
            "prediction": "1 & Over",
            "odds": 2.45,
            "result": "2-0",
            "status": "won",
            "profit": "+KSh 1,450"
        },
        {
            "match": "Amsterdam Lions vs Barcelona Kings",
            "prediction": "Over 1.5",
            "odds": 1.65,
            "result": "1-1",
            "status": "lost",
            "profit": "-KSh 1,000"
        },
        {
            "match": "Milan Giants vs Munich Eagles",
            "prediction": "2 & Over",
            "odds": 2.75,
            "result": "1-3",
            "status": "won",
            "profit": "+KSh 1,750"
        },
        {
            "match": "Liverpool Legends vs Manchester United",
            "prediction": "Over 2.5",
            "odds": 2.10,
            "result": "2-2",
            "status": "lost",
            "profit": "-KSh 1,000"
        },
        {
            "match": "Arsenal Warriors vs Chelsea Kings",
            "prediction": "GG",
            "odds": 1.95,
            "result": "2-1",
            "status": "won",
            "profit": "+KSh 950"
        },
        {
            "match": "Tottenham Stars vs Everton Lions",
            "prediction": "1 & Over",
            "odds": 2.30,
            "result": "3-1",
            "status": "won",
            "profit": "+KSh 1,300"
        }
    ],
    "betika": [
        {
            "match": "Liverpool Legends vs Manchester United",
            "prediction": "Over 2.5",
            "odds": 2.10,
            "result": "2-2",
            "status": "lost",
            "profit": "-KSh 1,000"
        },
        {
            "match": "Arsenal Warriors vs Chelsea Kings",
            "prediction": "GG",
            "odds": 1.95,
            "result": "2-1",
            "status": "won",
            "profit": "+KSh 950"
        },
        {
            "match": "Tottenham Stars vs Everton Lions",
            "prediction": "1 & Over",
            "odds": 2.30,
            "result": "3-1",
            "status": "won",
            "profit": "+KSh 1,300"
        },
        {
            "match": "Leicester City vs Aston Villa",
            "prediction": "Over 1.5",
            "odds": 1.75,
            "result": "2-1",
            "status": "won",
            "profit": "+KSh 750"
        },
        {
            "match": "West Ham vs Crystal Palace",
            "prediction": "2 & Over",
            "odds": 2.60,
            "result": "1-2",
            "status": "won",
            "profit": "+KSh 1,600"
        },
        {
            "match": "Newcastle United vs Brighton",
            "prediction": "Over 2.5",
            "odds": 2.20,
            "result": "3-2",
            "status": "won",
            "profit": "+KSh 1,200"
        },
        {
            "match": "Wolves vs Burnley",
            "prediction": "GG",
            "odds": 1.90,
            "result": "2-1",
            "status": "won",
            "profit": "+KSh 900"
        },
        {
            "match": "Fulham vs Sheffield United",
            "prediction": "1 & Over",
            "odds": 2.40,
            "result": "2-0",
            "status": "won",
            "profit": "+KSh 1,400"
        }
    ],
    "odibet": [
        {
            "match": "Real Madrid vs Barcelona",
            "prediction": "Over 2.5",
            "odds": 2.25,
            "result": "3-2",
            "status": "won",
            "profit": "+KSh 1,250"
        },
        {
            "match": "Bayern Munich vs Borussia Dortmund",
            "prediction": "GG",
            "odds": 1.80,
            "result": "2-1",
            "status": "won",
            "profit": "+KSh 800"
        },
        {
            "match": "PSG vs Marseille",
            "prediction": "1 & Over",
            "odds": 2.35,
            "result": "3-1",
            "status": "won",
            "profit": "+KSh 1,350"
        },
        {
            "match": "Juventus vs Inter Milan",
            "prediction": "Over 1.5",
            "odds": 1.70,
            "result": "2-1",
            "status": "won",
            "profit": "+KSh 700"
        },
        {
            "match": "Ajax vs PSV Eindhoven",
            "prediction": "2 & Over",
            "odds": 2.80,
            "result": "1-3",
            "status": "won",
            "profit": "+KSh 1,800"
        },
        {
            "match": "Porto vs Benfica",
            "prediction": "Over 2.5",
            "odds": 2.15,
            "result": "2-2",
            "status": "won",
            "profit": "+KSh 1,150"
        },
        {
            "match": "Galatasaray vs Fenerbahce",
            "prediction": "GG",
            "odds": 1.88,
            "result": "2-1",
            "status": "won",
            "profit": "+KSh 880"
        },
        {
            "match": "Shakhtar vs Dynamo Kyiv",
            "prediction": "1 & Over",
            "odds": 2.50,
            "result": "2-0",
            "status": "won",
            "profit": "+KSh 1,500"
        }
    ]
};

// Initialize the page
document.addEventListener('DOMContentLoaded', function() {
    // Set yesterday's date
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayFormatted = yesterday.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    document.getElementById('yesterday-date').textContent = yesterdayFormatted;

    // Populate results tables
    populateResultsTable('mozzartedge-results-tbody', yesterdayResults.mozzartedge);
    populateResultsTable('betika-results-tbody', yesterdayResults.betika);
    populateResultsTable('odibet-results-tbody', yesterdayResults.odibet);

    // Initialize tabs
    initializeTabs();
});

// Function to populate results table
function populateResultsTable(tbodyId, data) {
    const tbody = document.getElementById(tbodyId);
    tbody.innerHTML = '';

    data.forEach(match => {
        const row = document.createElement('tr');
        row.className = match.status === 'won' ? 'result-won' : 'result-lost';
        
        row.innerHTML = `
            <td>${match.match}</td>
            <td>${match.prediction}</td>
            <td>${match.odds}</td>
            <td>${match.result}</td>
            <td>
                <span class="status-badge ${match.status}">
                    <i class="fas fa-${match.status === 'won' ? 'check' : 'times'}"></i>
                    ${match.status.toUpperCase()}
                </span>
            </td>
            <td class="${match.status === 'won' ? 'profit-positive' : 'profit-negative'}">
                ${match.profit}
            </td>
        `;
        
        tbody.appendChild(row);
    });
}

// Function to initialize tabs
function initializeTabs() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetTab = button.getAttribute('data-tab');
            
            // Remove active class from all buttons and contents
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));
            
            // Add active class to clicked button and corresponding content
            button.classList.add('active');
            document.getElementById(targetTab + '-content').classList.add('active');
        });
    });
}

// Add smooth scrolling for navigation links
function scrollToSection(sectionId) {
    const element = document.getElementById(sectionId);
    if (element) {
        element.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    }
}

// Add animation on scroll for testimonials
function animateOnScroll() {
    const testimonials = document.querySelectorAll('.testimonial-card');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, { threshold: 0.1 });

    testimonials.forEach(testimonial => {
        testimonial.style.opacity = '0';
        testimonial.style.transform = 'translateY(20px)';
        testimonial.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(testimonial);
    });
}

// Initialize animations when page loads
window.addEventListener('load', animateOnScroll);
