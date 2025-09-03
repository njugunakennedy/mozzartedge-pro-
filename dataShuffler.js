// Data Shuffler for Daily Predictions
// This script shuffles the prediction data based on the current date
// to ensure different predictions are shown each day

class DataShuffler {
    constructor() {
        this.originalData = null;
        this.shuffledData = null;
        this.currentDate = new Date().toDateString();
    }

    // Load original data
    async loadOriginalData() {
        try {
            const response = await fetch('data.json');
            this.originalData = await response.json();
            return this.originalData;
        } catch (error) {
            console.error('Error loading data:', error);
            return null;
        }
    }

    // Shuffle array using Fisher-Yates algorithm with date-based seed
    shuffleArray(array, seed) {
        const shuffled = [...array];
        let currentSeed = seed;
        
        for (let i = shuffled.length - 1; i > 0; i--) {
            // Generate pseudo-random number based on seed
            currentSeed = (currentSeed * 9301 + 49297) % 233280;
            const j = Math.floor((currentSeed / 233280) * (i + 1));
            
            // Swap elements
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        
        return shuffled;
    }

    // Generate seed from date
    generateDateSeed(date) {
        const dateStr = date.toDateString();
        let hash = 0;
        for (let i = 0; i < dateStr.length; i++) {
            const char = dateStr.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        return Math.abs(hash);
    }

    // Shuffle predictions for a specific platform
    shufflePredictions(predictions, date) {
        const seed = this.generateDateSeed(date);
        return this.shuffleArray(predictions, seed);
    }

    // Get shuffled data for today
    getShuffledData() {
        if (!this.originalData) {
            console.error('Original data not loaded');
            return null;
        }

        const today = new Date();
        const seed = this.generateDateSeed(today);

        // Create shuffled copy of original data
        this.shuffledData = {
            mozzartedge: this.shufflePredictions(this.originalData.mozzartedge, today),
            betika: this.shufflePredictions(this.originalData.betika, today),
            odibet: this.shufflePredictions(this.originalData.odibet, today),
            results: this.originalData.results, // Results don't need shuffling
            blog: this.originalData.blog // Blog posts don't need shuffling
        };

        return this.shuffledData;
    }

    // Get data for a specific date (for testing)
    getDataForDate(date) {
        if (!this.originalData) {
            console.error('Original data not loaded');
            return null;
        }

        return {
            mozzartedge: this.shufflePredictions(this.originalData.mozzartedge, date),
            betika: this.shufflePredictions(this.originalData.betika, date),
            odibet: this.shufflePredictions(this.originalData.odibet, date),
            results: this.originalData.results,
            blog: this.originalData.blog
        };
    }

    // Update kickoff times based on shuffled order
    updateKickoffTimes(predictions, baseTime = '7:15 PM') {
        const timeIncrement = 5; // 5 minutes between matches
        const baseTimeMinutes = this.timeToMinutes(baseTime);
        
        return predictions.map((prediction, index) => ({
            ...prediction,
            kickoff: this.minutesToTime(baseTimeMinutes + (index * timeIncrement))
        }));
    }

    // Helper: Convert time string to minutes
    timeToMinutes(timeStr) {
        const [time, period] = timeStr.split(' ');
        const [hours, minutes] = time.split(':').map(Number);
        let totalMinutes = hours * 60 + minutes;
        
        if (period === 'PM' && hours !== 12) {
            totalMinutes += 12 * 60;
        } else if (period === 'AM' && hours === 12) {
            totalMinutes -= 12 * 60;
        }
        
        return totalMinutes;
    }

    // Helper: Convert minutes to time string
    minutesToTime(minutes) {
        let hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        const period = hours >= 12 ? 'PM' : 'AM';
        
        if (hours > 12) {
            hours -= 12;
        } else if (hours === 0) {
            hours = 12;
        }
        
        return `${hours}:${mins.toString().padStart(2, '0')} ${period}`;
    }

    // Get final shuffled data with updated times
    getFinalShuffledData() {
        const shuffled = this.getShuffledData();
        if (!shuffled) return null;

        return {
            mozzartedge: this.updateKickoffTimes(shuffled.mozzartedge, '7:15 PM'),
            betika: this.updateKickoffTimes(shuffled.betika, '8:00 PM'),
            odibet: this.updateKickoffTimes(shuffled.odibet, '8:40 PM'),
            results: shuffled.results,
            blog: shuffled.blog
        };
    }
}

// Global instance
const dataShuffler = new DataShuffler();

// Function to get shuffled data (to be used in other scripts)
async function getDailyShuffledData() {
    await dataShuffler.loadOriginalData();
    return dataShuffler.getFinalShuffledData();
}

// Function to get data for a specific date (for testing)
async function getDataForSpecificDate(date) {
    await dataShuffler.loadOriginalData();
    const data = dataShuffler.getDataForDate(date);
    
    if (data) {
        return {
            mozzartedge: dataShuffler.updateKickoffTimes(data.mozzartedge, '7:15 PM'),
            betika: dataShuffler.updateKickoffTimes(data.betika, '8:00 PM'),
            odibet: dataShuffler.updateKickoffTimes(data.odibet, '8:40 PM'),
            results: data.results,
            blog: data.blog
        };
    }
    
    return null;
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { DataShuffler, getDailyShuffledData, getDataForSpecificDate };
}
