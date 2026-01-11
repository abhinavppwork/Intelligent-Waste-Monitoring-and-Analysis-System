// ========================================
// Global Variables & Configuration
// ========================================
let dailyWasteChart, categoryChart, recyclingChart;
let currentAnalyticsData = {}; // Store fetched data directly instead of localStorage
const MOCK_DATA_ENABLED = false; // Disable mock data - only show real data from server

// ========================================
// Initialize Dashboard on Page Load
// ========================================
document.addEventListener('DOMContentLoaded', () => {
    console.log('Analytics page loaded, fetching data...');
    setupEventListeners();
    loadAnalyticsData();
});

// Auto-refresh when page becomes visible (user returns to tab)
document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
        console.log('Page became visible, refreshing analytics...');
        loadAnalyticsData();
    }
});

// ========================================
// Setup Event Listeners
// ========================================
function setupEventListeners() {
    console.log('setupEventListeners called');
    const exportBtn = document.getElementById('exportBtn');
    console.log('Export button found:', exportBtn);
    if (exportBtn) {
        console.log('Attaching click listener to export button');
        exportBtn.addEventListener('click', () => {
            console.log('EXPORT BUTTON CLICKED!!!');
            exportData();
        });
    } else {
        console.error('Export button not found in DOM');
    }
    
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
// Load Analytics Data from Backend
// ========================================
function loadAnalyticsData() {
    // If user is logged in, fetch analytics from backend per-user; otherwise show empty
    const user = (typeof getCurrentUser === 'function') ? getCurrentUser() : null;
    if (user) {
        console.log('User logged in:', user.email, '- Fetching analytics from backend...');
        // Fetch analytics for this user
        fetch(`http://localhost:5000/api/waste/analytics?userId=${encodeURIComponent(user.email)}&days=30`)
            .then(res => res.json())
            .then(result => {
                console.log('Raw analytics response:', result);
                currentAnalyticsData = result.data || {}; // Store in global variable
                console.log('Current analytics data stored:', JSON.stringify(currentAnalyticsData, null, 2));
                
                // Use analyticsData to update UI
                const totals = calculateTotals(currentAnalyticsData);
                console.log('Totals calculated:', totals);
                updateStatCards(totals);
                
                // Initialize charts with fresh data (will destroy old ones internally)
                initializeCharts();
                calculateEnvironmentalImpact();
                updateAchievements();
                setupEventListeners();
                console.log('Charts initialized successfully');
            })
            .catch(err => {
                console.error('Failed to fetch analytics from server:', err);
                // Show empty state
                currentAnalyticsData = {};
                const totals = calculateTotals({});
                updateStatCards(totals);
                
                initializeCharts();
                calculateEnvironmentalImpact();
                updateAchievements();
                setupEventListeners();
            });
    } else {
        console.log('No user logged in - showing empty analytics');
        // Not logged in - show empty state
        currentAnalyticsData = {};
        const totals = calculateTotals({});
        updateStatCards(totals);
        initializeCharts();
        calculateEnvironmentalImpact();
        updateAchievements();
        setupEventListeners();
    }
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
        hazardous: 0,
        dryWeight: 0,
        wetWeight: 0,
        ewasteWeight: 0,
        hazardousWeight: 0,
        totalWeight: 0
    };
    
    Object.values(analyticsData).forEach(day => {
        totals.total += day.total || 0;
        totals.dry += day.dry || 0;
        totals.wet += day.wet || 0;
        totals.ewaste += day.ewaste || 0;
        totals.hazardous += day.hazardous || 0;
        totals.dryWeight += day.dryWeight || 0;
        totals.wetWeight += day.wetWeight || 0;
        totals.ewasteWeight += day.ewasteWeight || 0;
        totals.hazardousWeight += day.hazardousWeight || 0;
        totals.totalWeight += day.totalWeight || 0;
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
    // Destroy all existing charts
    if (dailyWasteChart) {
        dailyWasteChart.destroy();
        dailyWasteChart = null;
    }
    if (categoryChart) {
        categoryChart.destroy();
        categoryChart = null;
    }
    if (recyclingChart) {
        recyclingChart.destroy();
        recyclingChart = null;
    }
    
    // Reset canvas elements by recreating them
    const dailyWasteContainer = document.getElementById('dailyWasteChart')?.parentElement;
    const categoryContainer = document.getElementById('categoryChart')?.parentElement;
    const recyclingContainer = document.getElementById('recyclingChart')?.parentElement;
    
    if (dailyWasteContainer) {
        dailyWasteContainer.innerHTML = '<canvas id="dailyWasteChart"></canvas>';
    }
    if (categoryContainer) {
        categoryContainer.innerHTML = '<canvas id="categoryChart"></canvas>';
    }
    if (recyclingContainer) {
        recyclingContainer.innerHTML = '<canvas id="recyclingChart"></canvas>';
    }
    
    // Create new charts
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
    
    dailyWasteChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: data.labels,
            datasets: [
                {
                    label: 'Dry Waste (kg)',
                    data: data.dry,
                    borderColor: '#3b82f6',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    tension: 0.4,
                    fill: true
                },
                {
                    label: 'Wet Waste (kg)',
                    data: data.wet,
                    borderColor: '#10b981',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    tension: 0.4,
                    fill: true
                },
                {
                    label: 'E-Waste (kg)',
                    data: data.ewaste,
                    borderColor: '#8b5cf6',
                    backgroundColor: 'rgba(139, 92, 246, 0.1)',
                    tension: 0.4,
                    fill: true
                },
                {
                    label: 'Hazardous (kg)',
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
                            return `${context.dataset.label}: ${context.parsed.y.toFixed(2)} kg`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true
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
    console.log('getDailyWasteData called with days:', days);
    console.log('currentAnalyticsData:', currentAnalyticsData);
    
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
        
        const dayData = currentAnalyticsData[dateStr] || { dry: 0, wet: 0, ewaste: 0, hazardous: 0, dryWeight: 0, wetWeight: 0, ewasteWeight: 0, hazardousWeight: 0 };
        console.log(`Date ${dateStr}:`, dayData);
        
        dry.push(dayData.dryWeight || 0);
        wet.push(dayData.wetWeight || 0);
        ewaste.push(dayData.ewasteWeight || 0);
        hazardous.push(dayData.hazardousWeight || 0);
    }
    
    console.log('Final chart data:', { labels, dry, wet, ewaste, hazardous });
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
    const totals = calculateTotals(currentAnalyticsData);
    
    categoryChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Dry Waste', 'Wet Waste', 'E-Waste', 'Hazardous'],
            datasets: [{
                data: [totals.dryWeight, totals.wetWeight, totals.ewasteWeight, totals.hazardousWeight],
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
                            const percentage = total > 0 ? ((context.parsed / total) * 100).toFixed(1) : 0;
                            return `${context.label}: ${context.parsed.toFixed(2)} kg (${percentage}%)`;
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
    const totals = calculateTotals(currentAnalyticsData);
    
    // Dry and E-waste are recyclable, Wet is compostable, Hazardous needs special handling
    const recycled = totals.dryWeight + totals.ewasteWeight;
    const composted = totals.wetWeight;
    const landfill = totals.hazardousWeight;
    
    // Update text values
    document.getElementById('recycledAmount').textContent = `${recycled.toFixed(2)} kg`;
    document.getElementById('landfillAmount').textContent = `${(landfill + composted).toFixed(2)} kg`;
    
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
                            return `${context.parsed.y.toFixed(2)} kg`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true
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
    const totals = calculateTotals(currentAnalyticsData);
    
    // Environmental impact calculations (simplified estimates)
    // Based on average recycling impact studies
    
    // CO2 saved: 0.7kg per kg of waste recycled
    const co2Saved = (totals.dryWeight + totals.ewasteWeight) * 0.7;
    const treesEquivalent = Math.round(co2Saved / 21); // 1 tree absorbs ~21kg CO2/year
    
    // Energy saved: 2.5 kWh per kg of waste recycled
    const energySaved = (totals.dryWeight + totals.ewasteWeight) * 2.5;
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
    
    // Destroy old charts if they exist
    if (dailyWasteChart) dailyWasteChart.destroy();
    if (categoryChart) categoryChart.destroy();
    if (recyclingChart) recyclingChart.destroy();
    
    // Reload all data from backend
    loadAnalyticsData();
    
    setTimeout(() => {
        icon.style.animation = '';
    }, 1000);
}

// ========================================
// Export Data
// ========================================
function exportData() {
    console.log('=== EXPORT DATA CALLED ===');
    console.log('XLSX library available:', typeof XLSX !== 'undefined');
    
    try {
        // Fetch all scans from backend
        const user = (typeof getCurrentUser === 'function') ? getCurrentUser() : null;
        console.log('Current user:', user);
        if (!user) {
            console.error('No user logged in');
            alert('Please log in to export data');
            return;
        }

        console.log('Fetching scans from backend...');
        fetch(`http://localhost:5000/api/waste?userId=${encodeURIComponent(user.email)}`)
        .then(res => res.json())
        .then(scans => {
            const totals = calculateTotals(currentAnalyticsData);
            
            // Check if SheetJS library is loaded
            if (typeof XLSX === 'undefined') {
                console.warn('XLSX not available, falling back to JSON');
                // Fallback to JSON if library not available
                const dataStr = JSON.stringify({ totals, scans }, null, 2);
                const dataBlob = new Blob([dataStr], { type: 'application/json' });
                const url = URL.createObjectURL(dataBlob);
                const link = document.createElement('a');
                link.href = url;
                link.download = `ecosort-data-${new Date().toISOString().split('T')[0]}.json`;
                link.click();
                URL.revokeObjectURL(url);
                return;
            }

            console.log('Creating Excel workbook...');
            // Create Excel workbook
            const wb = XLSX.utils.book_new();

            // ========== SUMMARY SHEET ==========
            const summaryData = [
                ['EcoSort Analytics Report'],
                [`Generated: ${new Date().toLocaleString()}`],
                [`User: ${user.email}`],
                [],
                ['WASTE SUMMARY'],
                ['Total Items Scanned', totals.total],
                ['Total Weight (kg)', totals.totalWeight.toFixed(2)],
                [],
                ['BY CATEGORY'],
                ['Category', 'Count', 'Weight (kg)', 'Percentage'],
                ['Dry Waste', totals.dry, totals.dryWeight.toFixed(2), `${((totals.dryWeight / totals.totalWeight) * 100).toFixed(1)}%`],
                ['Wet Waste', totals.wet, totals.wetWeight.toFixed(2), `${((totals.wetWeight / totals.totalWeight) * 100).toFixed(1)}%`],
                ['E-Waste', totals.ewaste, totals.ewasteWeight.toFixed(2), `${((totals.ewasteWeight / totals.totalWeight) * 100).toFixed(1)}%`],
                ['Hazardous', totals.hazardous, totals.hazardousWeight.toFixed(2), `${((totals.hazardousWeight / totals.totalWeight) * 100).toFixed(1)}%`],
                [],
                ['ENVIRONMENTAL IMPACT'],
                ['CO₂ Prevented (kg)', (totals.dryWeight * 0.7).toFixed(2)],
                ['Energy Saved (kWh)', (totals.dryWeight * 2.5).toFixed(2)],
                ['Trees Equivalent', Math.round((totals.dryWeight * 0.7) / 21)],
            ];

            const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
            summarySheet['!cols'] = [{ wch: 25 }, { wch: 15 }, { wch: 15 }, { wch: 15 }];
            XLSX.utils.book_append_sheet(wb, summarySheet, 'Summary');

            // ========== DAILY BREAKDOWN SHEET ==========
            const dailyData = [
                ['Daily Waste Breakdown'],
                [],
                ['Date', 'Dry (kg)', 'Wet (kg)', 'E-Waste (kg)', 'Hazardous (kg)', 'Total (kg)']
            ];

            Object.entries(currentAnalyticsData)
                .sort(([dateA], [dateB]) => dateA.localeCompare(dateB))
                .forEach(([date, dayData]) => {
                    dailyData.push([
                        date,
                        (dayData.dryWeight || 0).toFixed(2),
                        (dayData.wetWeight || 0).toFixed(2),
                        (dayData.ewasteWeight || 0).toFixed(2),
                        (dayData.hazardousWeight || 0).toFixed(2),
                        ((dayData.dryWeight || 0) + (dayData.wetWeight || 0) + (dayData.ewasteWeight || 0) + (dayData.hazardousWeight || 0)).toFixed(2)
                    ]);
                });

            const dailySheet = XLSX.utils.aoa_to_sheet(dailyData);
            dailySheet['!cols'] = [{ wch: 15 }, { wch: 12 }, { wch: 12 }, { wch: 14 }, { wch: 15 }, { wch: 12 }];
            XLSX.utils.book_append_sheet(wb, dailySheet, 'Daily Breakdown');

            // ========== DETAILED SCANS SHEET ==========
            const scansData = [
                ['Detailed Waste Scans'],
                [],
                ['Date & Time', 'Item Name', 'Category', 'Weight (kg)', 'Unit', 'QR Code']
            ];

            scans
                .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
                .forEach(scan => {
                    const date = new Date(scan.timestamp).toLocaleString();
                    scansData.push([
                        date,
                        scan.itemName,
                        scan.category.charAt(0).toUpperCase() + scan.category.slice(1),
                        scan.weight || 0,
                        scan.unit || 'kg',
                        scan.qrCode
                    ]);
                });

            const scansSheet = XLSX.utils.aoa_to_sheet(scansData);
            scansSheet['!cols'] = [{ wch: 20 }, { wch: 25 }, { wch: 12 }, { wch: 12 }, { wch: 10 }, { wch: 20 }];
            XLSX.utils.book_append_sheet(wb, scansSheet, 'Detailed Scans');

            // Write and download
            console.log('Writing Excel file...');
            XLSX.writeFile(wb, `EcoSort-Analytics-${new Date().toISOString().split('T')[0]}.xlsx`);
            console.log('Export complete!');
        })
        .catch(err => {
            console.error('Fetch error in exportData:', err);
            alert('Failed to fetch data. Please try again.');
        });
    } catch (error) {
        console.error('Error in exportData:', error);
        alert('An error occurred while exporting data.');
    }
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
