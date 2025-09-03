// Mozzartedge Virtual Leagues SPA - Main JavaScript
class MozzartedgeApp {
    constructor() {
        this.currentTab = 'mozzartedge';
        this.predictionsData = null;
        this.init();
    }

    async init() {
        this.setCurrentDate();
        await this.loadPredictionsData();
        this.setupEventListeners();
        this.renderPredictions();
        this.setupSmoothScrolling();
        this.setupAnimations();
    }

    setCurrentDate() {
        const today = new Date();
        const options = { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        };
        const dateString = today.toLocaleDateString('en-US', options);
        document.getElementById('current-date').textContent = dateString;
    }

    async loadPredictionsData() {
        try {
            const response = await fetch('data.json');
            this.predictionsData = await response.json();
        } catch (error) {
            console.error('Error loading predictions data:', error);
            // Fallback data if JSON file is not available
            this.predictionsData = this.getFallbackData();
        }
    }

    getFallbackData() {
        return {
            "mozzartedge": [
                {
                    "match": "FC Torino vs London City",
                    "kickoff": "7:15 PM",
                    "prediction": "Over 2.5",
                    "odds": 2.15,
                    "confidence": 85,
                    "status": "upcoming"
                },
                {
                    "match": "Paris United vs Berlin FC",
                    "kickoff": "7:20 PM",
                    "prediction": "GG",
                    "odds": 1.85,
                    "confidence": 78,
                    "status": "upcoming"
                },
                {
                    "match": "Madrid Stars vs Rome Warriors",
                    "kickoff": "7:25 PM",
                    "prediction": "1 & Over",
                    "odds": 2.45,
                    "confidence": 72,
                    "status": "upcoming"
                },
                {
                    "match": "Amsterdam Lions vs Barcelona Kings",
                    "kickoff": "7:30 PM",
                    "prediction": "Over 1.5",
                    "odds": 1.65,
                    "confidence": 91,
                    "status": "upcoming"
                },
                {
                    "match": "Milan Giants vs Munich Eagles",
                    "kickoff": "7:35 PM",
                    "prediction": "2 & Over",
                    "odds": 2.75,
                    "confidence": 68,
                    "status": "upcoming"
                }
            ],
            "betika": [
                {
                    "match": "Liverpool Legends vs Manchester United",
                    "kickoff": "8:00 PM",
                    "prediction": "Over 2.5",
                    "odds": 2.10,
                    "confidence": 82,
                    "status": "upcoming"
                },
                {
                    "match": "Arsenal Warriors vs Chelsea Kings",
                    "kickoff": "8:05 PM",
                    "prediction": "GG",
                    "odds": 1.95,
                    "confidence": 76,
                    "status": "upcoming"
                },
                {
                    "match": "Tottenham Stars vs Everton Lions",
                    "kickoff": "8:10 PM",
                    "prediction": "1 & Over",
                    "odds": 2.30,
                    "confidence": 79,
                    "status": "upcoming"
                },
                {
                    "match": "Leicester City vs Aston Villa",
                    "kickoff": "8:15 PM",
                    "prediction": "Over 1.5",
                    "odds": 1.75,
                    "confidence": 88,
                    "status": "upcoming"
                },
                {
                    "match": "West Ham vs Crystal Palace",
                    "kickoff": "8:20 PM",
                    "prediction": "2 & Over",
                    "odds": 2.60,
                    "confidence": 71,
                    "status": "upcoming"
                }
            ],
            "odibet": [
                {
                    "match": "Real Madrid vs Barcelona",
                    "kickoff": "8:40 PM",
                    "prediction": "Over 2.5",
                    "odds": 2.25,
                    "confidence": 87,
                    "status": "upcoming"
                },
                {
                    "match": "Bayern Munich vs Borussia Dortmund",
                    "kickoff": "8:45 PM",
                    "prediction": "GG",
                    "odds": 1.80,
                    "confidence": 81,
                    "status": "upcoming"
                },
                {
                    "match": "PSG vs Marseille",
                    "kickoff": "8:50 PM",
                    "prediction": "1 & Over",
                    "odds": 2.35,
                    "confidence": 74,
                    "status": "upcoming"
                },
                {
                    "match": "Juventus vs Inter Milan",
                    "kickoff": "8:55 PM",
                    "prediction": "Over 1.5",
                    "odds": 1.70,
                    "confidence": 89,
                    "status": "upcoming"
                },
                {
                    "match": "Ajax vs PSV Eindhoven",
                    "kickoff": "9:00 PM",
                    "prediction": "2 & Over",
                    "odds": 2.80,
                    "confidence": 69,
                    "status": "upcoming"
                }
            ]
        };
    }

    setupEventListeners() {
        // Tab switching
        const tabButtons = document.querySelectorAll('.tab-btn');
        tabButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                this.switchTab(e.target.dataset.tab);
            });
        });

        // Smooth scrolling for navigation links
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = link.getAttribute('href').substring(1);
                this.scrollToSection(targetId);
            });
        });

        // Premium subscription buttons
        const subscribeButtons = document.querySelectorAll('.pricing-card .btn');
        subscribeButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                this.handleSubscription(e);
            });
        });

        // WhatsApp contact buttons
        const whatsappButtons = document.querySelectorAll('.btn i.fab.fa-whatsapp');
        whatsappButtons.forEach(button => {
            button.parentElement.addEventListener('click', (e) => {
                this.openWhatsApp(e);
            });
        });
    }

    switchTab(tabName) {
        // Update active tab button
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

        // Update active tab content
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(`${tabName}-content`).classList.add('active');

        this.currentTab = tabName;
        this.renderPredictions();
    }

    renderPredictions() {
        if (!this.predictionsData) return;

        const leagueData = this.predictionsData[this.currentTab];
        const tbodyId = `${this.currentTab}-tbody`;
        const tbody = document.getElementById(tbodyId);

        if (!tbody || !leagueData) return;

        tbody.innerHTML = '';

        leagueData.forEach(match => {
            const row = this.createPredictionRow(match);
            tbody.appendChild(row);
        });
    }

    createPredictionRow(match) {
        const row = document.createElement('tr');
        
        const confidenceClass = this.getConfidenceClass(match.confidence);
        const statusClass = this.getStatusClass(match.status);
        const statusText = this.getStatusText(match.status);

        row.innerHTML = `
            <td class="match-cell">${match.match}</td>
            <td>${match.kickoff}</td>
            <td>${match.prediction}</td>
            <td class="odds-cell">${match.odds}</td>
            <td>
                <div class="confidence-bar">
                    <div class="confidence-fill ${confidenceClass}" style="width: ${match.confidence}%"></div>
                </div>
                <small>${match.confidence}%</small>
            </td>
            <td class="${statusClass}">${statusText}</td>
        `;

        return row;
    }

    getConfidenceClass(confidence) {
        if (confidence >= 80) return 'confidence-high';
        if (confidence >= 60) return 'confidence-medium';
        return 'confidence-low';
    }

    getStatusClass(status) {
        switch (status) {
            case 'win': return 'status-win';
            case 'loss': return 'status-loss';
            case 'upcoming': return 'status-upcoming';
            default: return 'status-upcoming';
        }
    }

    getStatusText(status) {
        switch (status) {
            case 'win': return '✅ WIN';
            case 'loss': return '❌ LOSS';
            case 'upcoming': return '⏳ UPCOMING';
            default: return '⏳ UPCOMING';
        }
    }

    scrollToSection(sectionId) {
        const element = document.getElementById(sectionId);
        if (element) {
            const navbarHeight = document.querySelector('.navbar').offsetHeight;
            const targetPosition = element.offsetTop - navbarHeight - 20;
            
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        }
    }

    setupSmoothScrolling() {
        // Add smooth scrolling for all internal links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const targetId = this.getAttribute('href').substring(1);
                const targetElement = document.getElementById(targetId);
                
                if (targetElement) {
                    const navbarHeight = document.querySelector('.navbar').offsetHeight;
                    const targetPosition = targetElement.offsetTop - navbarHeight - 20;
                    
                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                }
            });
        });
    }

    setupAnimations() {
        // Intersection Observer for fade-in animations
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }
            });
        }, observerOptions);

        // Observe elements for animation
        const animatedElements = document.querySelectorAll('.card, .pricing-card, .section-title');
        animatedElements.forEach(el => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(30px)';
            el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            observer.observe(el);
        });
    }

    handleSubscription(event) {
        event.preventDefault();
        const plan = event.target.closest('.pricing-card').querySelector('h3').textContent;
        const message = `Hi! I'm interested in subscribing to the ${plan} for Mozzartedge Pro predictions.`;
        this.openWhatsAppWithMessage(message);
    }

    openWhatsApp(event) {
        event.preventDefault();
        const message = "Hi! I'm interested in Mozzartedge Pro predictions. Can you help me get started?";
        this.openWhatsAppWithMessage(message);
    }

    openWhatsAppWithMessage(message) {
        const phoneNumber = '+254700000000';
        const encodedMessage = encodeURIComponent(message);
        const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
        window.open(whatsappUrl, '_blank');
    }

    // Utility method for external use
    static scrollToSection(sectionId) {
        const app = window.mozzartedgeApp;
        if (app) {
            app.scrollToSection(sectionId);
        }
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.mozzartedgeApp = new MozzartedgeApp();
});

// Global function for button onclick handlers
function scrollToSection(sectionId) {
    MozzartedgeApp.scrollToSection(sectionId);
}

// Add some interactive features
document.addEventListener('DOMContentLoaded', () => {
    // Add loading states to buttons
    const buttons = document.querySelectorAll('.btn');
    buttons.forEach(button => {
        button.addEventListener('click', function() {
            if (!this.classList.contains('btn-secondary')) {
                const originalText = this.innerHTML;
                this.innerHTML = '<span class="loading"></span> Loading...';
                this.disabled = true;
                
                setTimeout(() => {
                    this.innerHTML = originalText;
                    this.disabled = false;
                }, 2000);
            }
        });
    });

    // Add hover effects to table rows
    const tableRows = document.querySelectorAll('.predictions-table tbody tr');
    tableRows.forEach(row => {
        row.addEventListener('mouseenter', function() {
            this.style.transform = 'scale(1.02)';
            this.style.transition = 'transform 0.2s ease';
        });
        
        row.addEventListener('mouseleave', function() {
            this.style.transform = 'scale(1)';
        });
    });

    // Add countdown timer for upcoming matches
    function updateCountdowns() {
        const upcomingCells = document.querySelectorAll('.status-upcoming');
        upcomingCells.forEach(cell => {
            const matchRow = cell.closest('tr');
            const kickoffCell = matchRow.querySelector('td:nth-child(2)');
            const kickoffTime = kickoffCell.textContent;
            
            // Simple countdown logic (you can enhance this)
            const now = new Date();
            const [time, period] = kickoffTime.split(' ');
            const [hours, minutes] = time.split(':');
            
            let targetHours = parseInt(hours);
            if (period === 'PM' && targetHours !== 12) targetHours += 12;
            if (period === 'AM' && targetHours === 12) targetHours = 0;
            
            const targetTime = new Date();
            targetTime.setHours(targetHours, parseInt(minutes), 0);
            
            if (targetTime < now) {
                targetTime.setDate(targetTime.getDate() + 1);
            }
            
            const diff = targetTime - now;
            const hoursLeft = Math.floor(diff / (1000 * 60 * 60));
            const minutesLeft = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            
            if (hoursLeft > 0 || minutesLeft > 0) {
                kickoffCell.innerHTML = `${kickoffTime}<br><small style="color: var(--accent-color);">${hoursLeft}h ${minutesLeft}m</small>`;
            }
        });
    }

    // Update countdown every minute
    setInterval(updateCountdowns, 60000);
    updateCountdowns(); // Initial call
});
