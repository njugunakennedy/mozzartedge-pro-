// Mozzartedge Virtual Leagues SPA - Main JavaScript with Routing
class Router {
    constructor() {
        this.routes = {
            '/': 'index.html',
            '/index': 'index.html',
            '/results': 'results.html',
            '/blog': 'blog.html'
        };
        this.currentPage = null;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.handleInitialRoute();
    }

    setupEventListeners() {
        // Handle browser back/forward buttons
        window.addEventListener('popstate', (e) => {
            this.navigateToPage(window.location.pathname, false);
        });

        // Intercept all navigation links
        document.addEventListener('click', (e) => {
            const link = e.target.closest('a');
            if (link && this.isInternalLink(link.href)) {
                e.preventDefault();
                const path = this.getPathFromUrl(link.href);
                this.navigateToPage(path);
            }
        });

        // Handle form submissions that should trigger navigation
        document.addEventListener('submit', (e) => {
            const form = e.target;
            if (form.dataset.navigate) {
                e.preventDefault();
                this.navigateToPage(form.dataset.navigate);
            }
        });
    }

    isInternalLink(url) {
        const currentOrigin = window.location.origin;
        return url.startsWith(currentOrigin) || url.startsWith('/');
    }

    getPathFromUrl(url) {
        try {
            const urlObj = new URL(url, window.location.origin);
            return urlObj.pathname;
        } catch {
            // Handle relative URLs
            return url.startsWith('/') ? url : '/' + url;
        }
    }

    async navigateToPage(path, updateHistory = true) {
        const targetFile = this.routes[path] || this.routes['/'];
        
        if (updateHistory) {
            window.history.pushState({ path }, '', path);
        }

        try {
            await this.loadPage(targetFile);
            this.currentPage = path;
            this.updateActiveNavigation(path);
            this.scrollToTop();
        } catch (error) {
            console.error('Navigation error:', error);
            this.showErrorPage();
        }
    }

    async loadPage(filename) {
        const response = await fetch(filename);
        if (!response.ok) {
            throw new Error(`Failed to load ${filename}`);
        }

        const html = await response.text();
        const parser = new DOMParser();
        const newDoc = parser.parseFromString(html, 'text/html');

        // Update the document title
        document.title = newDoc.title;

        // Update the main content
        const newBody = newDoc.body;
        const currentBody = document.body;

        // Preserve the navbar and mobile nav
        const navbar = currentBody.querySelector('.navbar');
        const mobileNav = currentBody.querySelector('.mobile-nav');
        const footer = currentBody.querySelector('.footer');

        // Clear current body
        currentBody.innerHTML = '';

        // Add back the preserved elements
        if (navbar) currentBody.appendChild(navbar);
        if (mobileNav) currentBody.appendChild(mobileNav);
        if (footer) currentBody.appendChild(footer);

        // Add the new content
        const newContent = newBody.querySelector('main') || newBody;
        currentBody.appendChild(newContent);

        // Reinitialize the app for the new page
        this.reinitializePage();
    }

    reinitializePage() {
        // Reinitialize the main app
        if (window.mozzartedgeApp) {
            window.mozzartedgeApp.destroy();
        }
        window.mozzartedgeApp = new MozzartedgeApp();

        // Reinitialize page-specific functionality
        this.initializePageSpecificFeatures();
    }

    initializePageSpecificFeatures() {
        const currentPath = window.location.pathname;
        
        if (currentPath === '/results' || currentPath === '/results.html') {
            this.initializeResultsPage();
        } else if (currentPath === '/blog' || currentPath === '/blog.html') {
            this.initializeBlogPage();
        } else {
            this.initializeHomePage();
        }
    }

    initializeResultsPage() {
        // Results page specific initialization
        this.loadResultsData();
        this.setupResultsFilters();
    }

    initializeBlogPage() {
        // Blog page specific initialization
        this.loadBlogPosts();
        this.setupBlogSearch();
    }

    initializeHomePage() {
        // Home page specific initialization
        this.setupHomePageAnimations();
    }

    async loadResultsData() {
        try {
            const response = await fetch('data.json');
            const data = await response.json();
            this.renderResultsTable(data.results || []);
        } catch (error) {
            console.error('Error loading results data:', error);
            this.renderResultsTable(this.getFallbackResultsData());
        }
    }

    getFallbackResultsData() {
        return [
            {
                date: '2024-01-15',
                match: 'FC Torino vs London City',
                prediction: 'Over 2.5',
                result: '3-2',
                status: 'won',
                profit: '+115'
            },
            {
                date: '2024-01-14',
                match: 'Paris United vs Berlin FC',
                prediction: 'GG',
                result: '2-1',
                status: 'won',
                profit: '+85'
            },
            {
                date: '2024-01-13',
                match: 'Madrid Stars vs Rome Warriors',
                prediction: '1 & Over',
                result: '0-1',
                status: 'lost',
                profit: '-100'
            }
        ];
    }

    renderResultsTable(results) {
        const tbody = document.querySelector('#results-tbody');
        if (!tbody) return;

        tbody.innerHTML = '';
        results.forEach(result => {
            const row = this.createResultRow(result);
            tbody.appendChild(row);
        });
    }

    createResultRow(result) {
        const row = document.createElement('tr');
        const statusClass = result.status === 'won' ? 'result-won' : 'result-lost';
        const profitClass = result.profit.startsWith('+') ? 'profit-positive' : 'profit-negative';
        
        row.className = statusClass;
        row.innerHTML = `
            <td>${result.date}</td>
            <td class="match-cell">${result.match}</td>
            <td>${result.prediction}</td>
            <td>${result.result}</td>
            <td>
                <span class="status-badge ${result.status}">
                    ${result.status === 'won' ? '✅ WON' : '❌ LOST'}
                </span>
            </td>
            <td class="${profitClass}">${result.profit}</td>
        `;
        
        return row;
    }

    async loadBlogPosts() {
        try {
            const response = await fetch('data.json');
            const data = await response.json();
            this.renderBlogPosts(data.blog || []);
        } catch (error) {
            console.error('Error loading blog posts:', error);
            this.renderBlogPosts(this.getFallbackBlogData());
        }
    }

    getFallbackBlogData() {
        return [
            {
                title: 'How to Maximize Your Virtual League Winnings',
                excerpt: 'Learn the strategies that top players use to consistently win in virtual leagues...',
                category: 'Strategy',
                date: '2024-01-15',
                author: 'Mozzartedge Pro',
                tags: ['strategy', 'winning', 'tips']
            },
            {
                title: 'Understanding Virtual League Patterns',
                excerpt: 'Discover the hidden patterns in virtual league matches that can help you predict outcomes...',
                category: 'Analysis',
                date: '2024-01-14',
                author: 'Mozzartedge Pro',
                tags: ['analysis', 'patterns', 'prediction']
            }
        ];
    }

    renderBlogPosts(posts) {
        const container = document.querySelector('.blog-articles');
        if (!container) return;

        container.innerHTML = '';
        posts.forEach(post => {
            const article = this.createBlogArticle(post);
            container.appendChild(article);
        });
    }

    createBlogArticle(post) {
        const article = document.createElement('article');
        article.className = 'blog-article';
        article.innerHTML = `
            <div class="article-content">
                <div class="article-category">${post.category}</div>
                <h2 class="article-title">${post.title}</h2>
                <div class="article-meta">
                    <span><i class="fas fa-calendar"></i> ${post.date}</span>
                    <span><i class="fas fa-user"></i> ${post.author}</span>
                </div>
                <p class="article-excerpt">${post.excerpt}</p>
                <div class="article-tags">
                    ${post.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                </div>
            </div>
        `;
        
        return article;
    }

    setupResultsFilters() {
        const filterButtons = document.querySelectorAll('.filter-btn');
        filterButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const filter = e.target.dataset.filter;
                this.filterResults(filter);
            });
        });
    }

    filterResults(filter) {
        const rows = document.querySelectorAll('#results-tbody tr');
        rows.forEach(row => {
            const status = row.querySelector('.status-badge').textContent.includes('WON') ? 'won' : 'lost';
            if (filter === 'all' || status === filter) {
                row.style.display = '';
            } else {
                row.style.display = 'none';
            }
        });
    }

    setupBlogSearch() {
        const searchInput = document.querySelector('.search-box input');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.searchBlogPosts(e.target.value);
            });
        }
    }

    searchBlogPosts(query) {
        const articles = document.querySelectorAll('.blog-article');
        articles.forEach(article => {
            const title = article.querySelector('.article-title').textContent.toLowerCase();
            const excerpt = article.querySelector('.article-excerpt').textContent.toLowerCase();
            const tags = Array.from(article.querySelectorAll('.tag')).map(tag => tag.textContent.toLowerCase());
            
            const matches = title.includes(query.toLowerCase()) || 
                           excerpt.includes(query.toLowerCase()) ||
                           tags.some(tag => tag.includes(query.toLowerCase()));
            
            article.style.display = matches ? '' : 'none';
        });
    }

    setupHomePageAnimations() {
        // Reinitialize animations for home page
        if (window.mozzartedgeApp) {
            window.mozzartedgeApp.setupAnimations();
        }
    }

    updateActiveNavigation(path) {
        // Update navigation active states
        const navLinks = document.querySelectorAll('.nav-link, .mobile-nav-link');
        navLinks.forEach(link => {
            const linkPath = this.getPathFromUrl(link.href);
            if (linkPath === path) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
    }

    scrollToTop() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    }

    showErrorPage() {
        document.body.innerHTML = `
            <div style="display: flex; justify-content: center; align-items: center; height: 100vh; flex-direction: column;">
                <h1>Page Not Found</h1>
                <p>The page you're looking for doesn't exist.</p>
                <button onclick="window.router.navigateToPage('/')" class="btn btn-primary">Go Home</button>
            </div>
        `;
    }

    handleInitialRoute() {
        const path = window.location.pathname;
        if (path !== '/' && !this.routes[path]) {
            this.navigateToPage('/');
        } else {
            this.initializePageSpecificFeatures();
        }
    }
}

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

    destroy() {
        // Clean up event listeners and resources
        this.removeEventListeners();
    }

    removeEventListeners() {
        // Remove all event listeners to prevent memory leaks
        const tabButtons = document.querySelectorAll('.tab-btn');
        tabButtons.forEach(button => {
            button.removeEventListener('click', this.switchTab);
        });
    }

    setCurrentDate() {
        const dateElement = document.getElementById('current-date');
        if (!dateElement) return;
        
        const today = new Date();
        const options = { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        };
        const dateString = today.toLocaleDateString('en-US', options);
        dateElement.textContent = dateString;
    }

    async loadPredictionsData() {
        try {
            // Use the data shuffler to get daily shuffled predictions
            this.predictionsData = await getDailyShuffledData();
            if (!this.predictionsData) {
                throw new Error('Failed to load shuffled data');
            }
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

// Initialize the router and app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.router = new Router();
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
