// ========================================
// Global Variables & Configuration
// ========================================
let dailyWasteChart, categoryChart, recyclingChart;
const MOCK_DATA_ENABLED = true; // Set to false when real data is available

// ========================================
// Initialize Dashboard on Page Load
// ========================================
document.addEventListener('DOMContentLoaded', () => {
    loadAnalyticsData();
    initializeCharts();
    calculateEnvironmentalImpact();
    updateAchievements();
    setupEventListeners();
});

// ========================================
// Setup Event Listeners
// ========================================
function setupEventListeners() {
    document.getElementById('refreshBtn').addEventListener('click', refreshDashboard);
    document.getElementById('exportBtn').addEventListener('click', exportData);
    
    // Period selection buttons
    document.querySelectorAll('.period-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.period-btn').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            const period = parseInt(e.target.dataset.period);
            updateDailyChart(period);
        });
    });
}

// ========================================
// Load Analytics Data from localStorage
// ========================================
function loadAnalyticsData() {
    let analyticsData = JSON.parse(localStorage.getItem('wasteAnalytics') || '{}');
    
    // Add mock data if enabled or no data exists
    if (MOCK_DATA_ENABLED || Object.keys(analyticsData).length === 0) {
        analyticsData = generateMockData();
        localStorage.setItem('wasteAnalytics', JSON.stringify(analyticsData));
    }
    
    // Calculate totals
    const totals = calculateTotals(analyticsData);
    updateStatCards(totals);
}

// ========================================
// Generate Mock Data (for demonstration)
// ========================================
function generateMockData() {
    const mockData = {};
    const today = new Date();
    
    for (let i = 30; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        
        // Random waste generation with realistic distribution
        const dryCount = Math.floor(Math.random() * 8) + 2;
        const wetCount = Math.floor(Math.random() * 6) + 3;
        const ewasteCount = Math.random() > 0.7 ? Math.floor(Math.random() * 2) + 1 : 0;
        const hazardousCount = Math.random() > 0.85 ? 1 : 0;
        
        mockData[dateStr] = {
            dry: dryCount,
            wet: wetCount,
            ewaste: ewasteCount,
            hazardous: hazardousCount,
            total: dryCount + wetCount + ewasteCount + hazardousCount
        };
    }
    
    return mockData;
}

// ========================================
// Calculate Totals from Analytics Data
// ========================================
function calculateTotals(analyticsData) {
    const totals = {
        total: 0,
        dry: 0,
        wet: 0,
        ewaste: 0,
        hazardous: 0
    };
    
    Object.values(analyticsData).forEach(day => {
        totals.total += day.total || 0;
        totals.dry += day.dry || 0;
        totals.wet += day.wet || 0;
        totals.ewaste += day.ewaste || 0;
        totals.hazardous += day.hazardous || 0;
    });
    
    return totals;
}

// ========================================
// Update Statistic Cards
// ========================================
function updateStatCards(totals) {
    // Animate count-up effect
    animateValue('totalWaste', 0, totals.total, 1000);
    animateValue('dryWaste', 0, totals.dry, 1000);
    animateValue('wetWaste', 0, totals.wet, 1000);
    animateValue('ewasteCount', 0, totals.ewaste, 1000);
    animateValue('hazardousWaste', 0, totals.hazardous, 1000);
    
    // Calculate percentages
    if (totals.total > 0) {
        document.getElementById('dryPercentage').textContent = 
            `${Math.round((totals.dry / totals.total) * 100)}%`;
        document.getElementById('wetPercentage').textContent = 
            `${Math.round((totals.wet / totals.total) * 100)}%`;
        document.getElementById('ewastePercentage').textContent = 
            `${Math.round((totals.ewaste / totals.total) * 100)}%`;
        document.getElementById('hazardousPercentage').textContent = 
            `${Math.round((totals.hazardous / totals.total) * 100)}%`;
        
        // Recycling rate (dry waste + ewaste are recyclable)
        const recyclingRate = Math.round(((totals.dry + totals.ewaste) / totals.total) * 100);
        document.getElementById('recyclingRate').textContent = `${recyclingRate}%`;
    }
}

// ========================================
// Animate Number Count-Up
// ========================================
function animateValue(id, start, end, duration) {
    const element = document.getElementById(id);
    const range = end - start;
    const increment = range / (duration / 16);
    let current = start;
    
    const timer = setInterval(() => {
        current += increment;
        if (current >= end) {
            element.textContent = Math.round(end);
            clearInterval(timer);
        } else {
            element.textContent = Math.round(current);
        }
    }, 16);
}

// ========================================
// Initialize All Charts
// ========================================
function initializeCharts() {
    createDailyWasteChart(7);
    createCategoryChart();
    createRecyclingChart();
}

// ========================================
// Daily Waste Generation Chart
// ========================================
function createDailyWasteChart(days = 7) {
    const ctx = document.getElementById('dailyWasteChart').getContext('2d');
    const data = getDailyWasteData(days);
    
    if (dailyWasteChart) {
        dailyWasteChart.destroy();
    }
    
    dailyWasteChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: data.labels,
            datasets: [
                {
                    label: 'Dry Waste',
                    data: data.dry,
                    borderColor: '#3b82f6',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    tension: 0.4,
                    fill: true
                },
                {
                    label: 'Wet Waste',
                    data: data.wet,
                    borderColor: '#10b981',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    tension: 0.4,
                    fill: true
                },
                {
                    label: 'E-Waste',
                    data: data.ewaste,
                    borderColor: '#8b5cf6',
                    backgroundColor: 'rgba(139, 92, 246, 0.1)',
                    tension: 0.4,
                    fill: true
                },
                {
                    label: 'Hazardous',
                    data: data.hazardous,
                    borderColor: '#ef4444',
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    tension: 0.4,
                    fill: true
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                    labels: {
                        usePointStyle: true,
                        padding: 15
                    }
                },
                tooltip: {
                    mode: 'index',
                    intersect: false,
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    padding: 12,
                    titleFont: { size: 14, weight: 'bold' },
                    bodyFont: { size: 13 },
                    callbacks: {
                        label: function(context) {
                            return `${context.dataset.label}: ${context.parsed.y} items`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1
                    }
                },
                x: {
                    grid: {
                        display: false
                    }
                }
            },
            interaction: {
                mode: 'nearest',
                axis: 'x',
                intersect: false
            }
        }
    });
}

// ========================================
// Get Daily Waste Data
// ========================================
function getDailyWasteData(days) {
    const analyticsData = JSON.parse(localStorage.getItem('wasteAnalytics') || '{}');
    const labels = [];
    const dry = [];
    const wet = [];
    const ewaste = [];
    const hazardous = [];
    
    const today = new Date();
    
    for (let i = days - 1; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        
        labels.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
        
        const dayData = analyticsData[dateStr] || { dry: 0, wet: 0, ewaste: 0, hazardous: 0 };
        dry.push(dayData.dry);
        wet.push(dayData.wet);
        ewaste.push(dayData.ewaste);
        hazardous.push(dayData.hazardous);
    }
    
    return { labels, dry, wet, ewaste, hazardous };
}

// ========================================
// Update Daily Chart with New Period
// ========================================
function updateDailyChart(days) {
    createDailyWasteChart(days);
}

// ========================================
// Category Distribution Pie Chart
// ========================================
function createCategoryChart() {
    const ctx = document.getElementById('categoryChart').getContext('2d');
    const analyticsData = JSON.parse(localStorage.getItem('wasteAnalytics') || '{}');
    const totals = calculateTotals(analyticsData);
    
    categoryChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Dry Waste', 'Wet Waste', 'E-Waste', 'Hazardous'],
            datasets: [{
                data: [totals.dry, totals.wet, totals.ewaste, totals.hazardous],
                backgroundColor: [
                    '#3b82f6',
                    '#10b981',
                    '#8b5cf6',
                    '#ef4444'
                ],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    padding: 12,
                    titleFont: { size: 14, weight: 'bold' },
                    bodyFont: { size: 13 },
                    callbacks: {
                        label: function(context) {
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = ((context.parsed / total) * 100).toFixed(1);
                            return `${context.label}: ${context.parsed} items (${percentage}%)`;
                        }
                    }
                }
            }
        }
    });
}

// ========================================
// Recycling vs Landfill Chart
// ========================================
function createRecyclingChart() {
    const ctx = document.getElementById('recyclingChart').getContext('2d');
    const analyticsData = JSON.parse(localStorage.getItem('wasteAnalytics') || '{}');
    const totals = calculateTotals(analyticsData);
    
    // Dry and E-waste are recyclable, Wet is compostable, Hazardous needs special handling
    const recycled = totals.dry + totals.ewaste;
    const composted = totals.wet;
    const landfill = totals.hazardous;
    
    // Update text values
    document.getElementById('recycledAmount').textContent = `${recycled} items`;
    document.getElementById('landfillAmount').textContent = `${landfill + composted} items`;
    
    recyclingChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Recycled', 'Composted', 'Landfill'],
            datasets: [{
                data: [recycled, composted, landfill],
                backgroundColor: [
                    '#10b981',
                    '#3b82f6',
                    '#94a3b8'
                ],
                borderRadius: 8,
                barThickness: 60
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    padding: 12,
                    titleFont: { size: 14, weight: 'bold' },
                    bodyFont: { size: 13 },
                    callbacks: {
                        label: function(context) {
                            return `${context.parsed.y} items`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1
                    }
                },
                x: {
                    grid: {
                        display: false
                    }
                }
            }
        }
    });
}

// ========================================
// Calculate Environmental Impact
// ========================================
function calculateEnvironmentalImpact() {
    const analyticsData = JSON.parse(localStorage.getItem('wasteAnalytics') || '{}');
    const totals = calculateTotals(analyticsData);
    
    // Environmental impact calculations (simplified estimates)
    // Based on average recycling impact studies
    
    // CO2 saved: 0.7kg per recycled item (average)
    const co2Saved = Math.round((totals.dry + totals.ewaste) * 0.7);
    const treesEquivalent = Math.round(co2Saved / 21); // 1 tree absorbs ~21kg CO2/year
    
    // Energy saved: 2.5 kWh per recycled item
    const energySaved = Math.round((totals.dry + totals.ewaste) * 2.5);
    const daysEquivalent = Math.round(energySaved / 30); // Average home uses 30 kWh/day
    
    // Water saved: 50L per recycled item
    const waterSaved = Math.round((totals.dry + totals.ewaste) * 50);
    const showersEquivalent = Math.round(waterSaved / 65); // Average shower uses 65L
    
    // Landfill diverted: average 0.5kg per item
    const landfillDiverted = Math.round((totals.dry + totals.ewaste + totals.wet) * 0.5);
    const bagEquivalent = Math.round(landfillDiverted / 5); // Average garbage bag ~5kg
    
    // Update display with animation
    animateValue('co2Saved', 0, co2Saved, 1500);
    animateValue('treesEquivalent', 0, treesEquivalent, 1500);
    animateValue('energySaved', 0, energySaved, 1500);
    animateValue('daysEquivalent', 0, daysEquivalent, 1500);
    animateValue('waterSaved', 0, waterSaved, 1500);
    animateValue('showersEquivalent', 0, showersEquivalent, 1500);
    animateValue('landfillDiverted', 0, landfillDiverted, 1500);
    animateValue('bagEquivalent', 0, bagEquivalent, 1500);
    
    // Add units after animation
    setTimeout(() => {
        document.getElementById('co2Saved').textContent = `${co2Saved} kg`;
        document.getElementById('energySaved').textContent = `${energySaved} kWh`;
        document.getElementById('waterSaved').textContent = `${waterSaved} L`;
        document.getElementById('landfillDiverted').textContent = `${landfillDiverted} kg`;
    }, 1600);
}

// ========================================
// Update Achievements
// ========================================
function updateAchievements() {
    const scans = JSON.parse(localStorage.getItem('wasteScans') || '[]');
    const analyticsData = JSON.parse(localStorage.getItem('wasteAnalytics') || '{}');
    const totals = calculateTotals(analyticsData);
    
    // Achievement 1: First Scan
    if (scans.length >= 1) {
        unlockAchievement('achievement1');
    }
    
    // Achievement 2: Week Streak (simplified - just check if scans exist for 7+ days)
    if (Object.keys(analyticsData).length >= 7) {
        unlockAchievement('achievement2');
    }
    
    // Achievement 3: 50 recycled items
    if ((totals.dry + totals.ewaste) >= 50) {
        unlockAchievement('achievement3');
    }
    
    // Achievement 4: 100kg CO2 prevented
    const co2Saved = (totals.dry + totals.ewaste) * 0.7;
    if (co2Saved >= 100) {
        unlockAchievement('achievement4');
    }
}

// ========================================
// Unlock Achievement
// ========================================
function unlockAchievement(achievementId) {
    const achievement = document.getElementById(achievementId);
    if (achievement && achievement.classList.contains('locked')) {
        achievement.classList.remove('locked');
        achievement.classList.add('unlocked');
        
        // Add celebration animation
        achievement.style.animation = 'celebrate 0.6s ease-out';
    }
}

// ========================================
// Refresh Dashboard
// ========================================
function refreshDashboard() {
    const btn = document.getElementById('refreshBtn');
    const icon = btn.querySelector('i');
    
    // Rotate icon
    icon.style.animation = 'spin 1s linear';
    
    // Reload data
    loadAnalyticsData();
    
    // Update charts
    dailyWasteChart.destroy();
    categoryChart.destroy();
    recyclingChart.destroy();
    initializeCharts();
    
    // Recalculate impact
    calculateEnvironmentalImpact();
    updateAchievements();
    
    setTimeout(() => {
        icon.style.animation = '';
    }, 1000);
}

// ========================================
// Export Data
// ========================================
function exportData() {
    const analyticsData = JSON.parse(localStorage.getItem('wasteAnalytics') || '{}');
    const scans = JSON.parse(localStorage.getItem('wasteScans') || '[]');
    
    const exportObj = {
        analytics: analyticsData,
        scans: scans,
        exportDate: new Date().toISOString()
    };
    
    const dataStr = JSON.stringify(exportObj, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `ecosort-data-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    
    URL.revokeObjectURL(url);
}

// ========================================
// Add Celebration Animation CSS
// ========================================
const style = document.createElement('style');
style.textContent = `
    @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
    }
    
    @keyframes celebrate {
        0%, 100% {
            transform: scale(1);
        }
        25% {
            transform: scale(1.1) rotate(-5deg);
        }
        75% {
            transform: scale(1.1) rotate(5deg);
        }
    }
`;
document.head.appendChild(style);
