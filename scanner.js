// ========================================
// QR Scanner Configuration & Variables
// ========================================
let html5QrCode;
let isScanning = false;
let lastScannedCode = null;
let scanCooldown = 2000; // 2 second cooldown to prevent duplicate scans

// Valid QR code pattern - EcoSort QR codes should follow specific format
// Format: CATEGORY_ITEM_NUMBER (e.g., PLASTIC_BOTTLE_001)
const QR_CODE_PATTERN = /^[A-Z_]+_\d{3}$/;

// Valid QR code prefixes for EcoSort
const VALID_QR_PREFIXES = ['PLASTIC', 'FOOD', 'BATTERY', 'PAINT', 'PAPER', 'GLASS', 'METAL', 'EWASTE'];

// ========================================
// Validate QR Code Format
// ========================================
function isValidQRCode(qrData) {
    // Check if QR code matches expected pattern
    if (!QR_CODE_PATTERN.test(qrData)) {
        return false;
    }
    
    // Check if it starts with a valid prefix
    const prefix = qrData.split('_')[0];
    if (!VALID_QR_PREFIXES.includes(prefix)) {
        return false;
    }
    
    // Additional validation: ensure it's in our database
    if (wasteDatabase[qrData]) {
        return true;
    }
    
    return false;
}

// Waste database with QR codes and disposal info
const wasteDatabase = {
    'PLASTIC_BOTTLE_001': {
        category: 'dry',
        name: 'Plastic Bottle (PET)',
        icon: 'fa-bottle-water',
        badge: 'RECYCLABLE',
        instructions: [
            'Empty all contents completely',
            'Rinse the bottle with water',
            'Remove the cap and label if possible',
            'Crush the bottle to save space',
            'Place in the blue recycling bin'
        ],
        impact: 'Recycling this PET plastic bottle saves energy equivalent to powering a laptop for 25 hours and prevents 0.5kg of CO2 emissions!'
    },
    'FOOD_WASTE_001': {
        category: 'wet',
        name: 'Food Scraps',
        icon: 'fa-apple-whole',
        badge: 'COMPOSTABLE',
        instructions: [
            'Remove any packaging or non-organic materials',
            'Place in the green compost bin',
            'Ensure the lid is closed to prevent pests',
            'Avoid adding meat, dairy, or oily foods',
            'Compost will be collected twice weekly'
        ],
        impact: 'Composting organic waste reduces methane emissions from landfills and creates nutrient-rich soil for agriculture!'
    },
    'BATTERY_001': {
        category: 'ewaste',
        name: 'Lithium Battery',
        icon: 'fa-battery-full',
        badge: 'E-WASTE',
        instructions: [
            'Do NOT throw in regular trash',
            'Store in a cool, dry place until disposal',
            'Take to designated e-waste collection center',
            'Keep terminals covered with tape to prevent fires',
            'Check local collection dates for e-waste'
        ],
        impact: 'Proper battery disposal prevents toxic chemicals from contaminating soil and groundwater, and recovers valuable metals!'
    },
    'PAINT_CAN_001': {
        category: 'hazardous',
        name: 'Paint Can (Oil-based)',
        icon: 'fa-paint-roller',
        badge: 'HAZARDOUS',
        instructions: [
            'NEVER pour down drain or in regular trash',
            'Keep in original container with lid sealed',
            'Contact hazardous waste facility for pickup',
            'Store away from heat and children',
            'Follow special disposal guidelines'
        ],
        impact: 'Hazardous waste requires special handling to prevent environmental contamination and protect public health!'
    },
    'PAPER_001': {
        category: 'dry',
        name: 'Paper & Cardboard',
        icon: 'fa-newspaper',
        badge: 'RECYCLABLE',
        instructions: [
            'Remove any plastic tape or staples',
            'Flatten cardboard boxes',
            'Keep paper dry and clean',
            'Place in blue recycling bin',
            'Contaminated paper goes to general waste'
        ],
        impact: 'Recycling one ton of paper saves 17 trees, 7,000 gallons of water, and 3 cubic yards of landfill space!'
    },
    'GLASS_BOTTLE_001': {
        category: 'dry',
        name: 'Glass Bottle',
        icon: 'fa-wine-glass',
        badge: 'RECYCLABLE',
        instructions: [
            'Rinse the bottle thoroughly',
            'Remove labels if possible',
            'Check for cracks or sharp edges',
            'Place in clear glass recycling bin',
            'Keep separate from other colors of glass'
        ],
        impact: 'Glass is 100% recyclable and can be reused infinitely without quality loss, saving energy and natural resources!'
    },
    'METAL_CAN_001': {
        category: 'dry',
        name: 'Metal Can (Aluminum)',
        icon: 'fa-can-icon',
        badge: 'RECYCLABLE',
        instructions: [
            'Rinse the can to remove food residue',
            'Crush cans to save space',
            'Remove any sharp edges',
            'Place in metal/aluminum recycling bin',
            'Keep dry before collection'
        ],
        impact: 'Recycling aluminum cans saves 95% of the energy needed to produce new ones and takes only 60 days to return to shelves!'
    }
};


// ========================================
// Initialize Scanner on Page Load
// ========================================
document.addEventListener('DOMContentLoaded', () => {
    initializeScanner();
    loadRecentScans();
    setupEventListeners();
});

// ========================================
// Setup Event Listeners
// ========================================
function setupEventListeners() {
    document.getElementById('startScanBtn').addEventListener('click', startScanning);
    document.getElementById('stopScanBtn').addEventListener('click', stopScanning);
    document.getElementById('uploadBtn').addEventListener('click', () => {
        document.getElementById('imageUploadInput').click();
    });
    document.getElementById('imageUploadInput').addEventListener('change', handleImageUpload);
    document.getElementById('closeResults').addEventListener('click', closeResults);
    document.getElementById('logWasteBtn').addEventListener('click', logWaste);
    document.getElementById('scanAgainBtn').addEventListener('click', scanAgain);
    // Invalid QR modal buttons (if present)
    const invalidClose = document.getElementById('invalidModalClose');
    const invalidOk = document.getElementById('invalidModalOk');
    if (invalidClose) invalidClose.addEventListener('click', hideInvalidPopup);
    if (invalidOk) invalidOk.addEventListener('click', hideInvalidPopup);
}

// ========================================
// Initialize QR Code Scanner
// ========================================
function initializeScanner() {
    html5QrCode = new Html5Qrcode("reader");
    updateStatus('info', 'Click "Start Scanner" to scan with camera or "Upload Image" to scan from file');
}

// ========================================
// Invalid QR Popup Helpers
// ========================================
function showInvalidPopup(message) {
    const modal = document.getElementById('invalidQrModal');
    const msg = document.getElementById('invalidModalMessage');
    if (msg && message) msg.textContent = message;
    if (modal) modal.style.display = 'flex';
}

function hideInvalidPopup() {
    const modal = document.getElementById('invalidQrModal');
    if (modal) modal.style.display = 'none';
}

// ========================================
// Start Scanning
// ========================================
async function startScanning() {
    if (isScanning) return;
    
    try {
        await html5QrCode.start(
            { facingMode: "environment" },
            {
                fps: 10,
                qrbox: { width: 250, height: 250 }
            },
            onScanSuccess,
            onScanFailure
        );
        
        isScanning = true;
        document.getElementById('startScanBtn').style.display = 'none';
        document.getElementById('stopScanBtn').style.display = 'block';
        document.querySelector('.scanner-overlay').style.display = 'block';
        updateStatus('scanning', 'Scanning... Point camera at QR code');
        
    } catch (err) {
        console.error('Camera access error:', err);
        updateStatus('error', 'Camera access denied. Please allow camera permissions.');
    }
}

// ========================================
// Stop Scanning
// ========================================
async function stopScanning() {
    if (!isScanning) return;
    
    try {
        await html5QrCode.stop();
        isScanning = false;
        document.getElementById('startScanBtn').style.display = 'block';
        document.getElementById('stopScanBtn').style.display = 'none';
        document.querySelector('.scanner-overlay').style.display = 'none';
        updateStatus('info', 'Scanner stopped');
    } catch (err) {
        console.error('Stop scanner error:', err);
    }
}

// ========================================
// Handle Successful Scan
// ========================================
function onScanSuccess(decodedText, decodedResult) {
    console.log('Code detected:', decodedText);
    console.log('Decoded result:', decodedResult);
    
    // STRICT VALIDATION: Check if it's actually a QR code (not just text)
    if (!decodedResult || !decodedResult.result) {
        console.warn('Not a valid QR code structure');
        return;
    }
    
    // Check if the QR code format is actually a 2D barcode (QR code)
    const codeFormat = decodedResult.result.format;
    const qrFormat = codeFormat ? codeFormat.toString() : '';
    
    // Only accept actual QR codes, not 1D barcodes or other formats
    if (qrFormat !== 'QR_CODE' && !qrFormat.includes('QR')) {
        console.warn('Not a QR code. Detected format:', qrFormat);
        updateStatus('error', 'Please scan a QR code, not a barcode or image.');
        showInvalidPopup('Please give a valid QR');
        return;
    }
    
    // Validate QR code content
    if (!isValidQRCode(decodedText)) {
        console.warn('Invalid QR code content:', decodedText);
        updateStatus('error', 'This QR code is not a valid EcoSort waste code.');
        showInvalidPopup('Please give a valid QR');
        return;
    }
    
    // Prevent duplicate scans within cooldown period
    if (lastScannedCode === decodedText && Date.now() - (lastScannedCode.timestamp || 0) < scanCooldown) {
        console.log('Duplicate scan ignored (cooldown)');
        return;
    }
    
    // Valid QR code detected
    lastScannedCode = decodedText;
    lastScannedCode.timestamp = Date.now();
    stopScanning();
    processQRCode(decodedText);
}

// ========================================
// Handle Scan Failure (normal during scanning)
// ========================================
function onScanFailure(error) {
    // This is called frequently during scanning when no valid code is detected
    // Silently ignore - only valid QR codes trigger onScanSuccess
}

// ========================================
// Process QR Code Data
// ========================================
function processQRCode(qrData) {
    // Double-check validation
    if (!isValidQRCode(qrData)) {
        updateStatus('error', 'Invalid QR code. This is not a recognized EcoSort QR code.');
        showInvalidPopup('Invalid QR — please provide a valid EcoSort QR');
        return;
    }
    
    const wasteItem = wasteDatabase[qrData];
    
    if (wasteItem) {
        displayResults(wasteItem);
        updateStatus('success', 'Valid QR Code scanned successfully!');
    } else {
        // Should not reach here due to validation, but handle just in case
        updateStatus('error', 'QR code is not in the database. Please contact support.');
        showInvalidPopup('Invalid QR — code not recognized by EcoSort');
    }
}

// ========================================
// Handle Image Upload
// ========================================
async function handleImageUpload(event) {
    const file = event.target.files[0];
    
    if (!file) {
        return;
    }
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
        updateStatus('error', 'Please upload a valid image file.');
        return;
    }
    
    try {
        updateStatus('scanning', 'Processing uploaded image...');
        
        // Read the file as data URL
        const fileReader = new FileReader();
        fileReader.onload = async (e) => {
            const imageDataUrl = e.target.result;
            
            try {
                // Use html5-qrcode library to scan the image
                // The scanFile method is called directly on the Html5Qrcode class
                const decodedText = await Html5Qrcode.scanFile(imageDataUrl, true);
                
                console.log('QR Code from image:', decodedText);
                
                // Apply the same validation as camera scan
                if (!decodedText || decodedText.trim() === '') {
                    updateStatus('error', 'No QR code found in the uploaded image.');
                    showInvalidPopup('Please give a valid QR');
                    return;
                }
                
                // Validate QR code content
                if (!isValidQRCode(decodedText)) {
                    console.warn('Invalid QR code content:', decodedText);
                    updateStatus('error', 'This QR code is not a valid EcoSort waste code. Please use a valid EcoSort QR code.');
                    showInvalidPopup('Please give a valid QR');
                    return;
                }
                
                // Process the valid QR code
                lastScannedCode = decodedText;
                lastScannedCode.timestamp = Date.now();
                processQRCode(decodedText);
                
            } catch (error) {
                console.error('Error decoding QR code from image:', error.message);
                
                // Provide more specific error messages
                const errorMsg = error.message || error.toString();
                
                if (errorMsg.includes('No barcode') || errorMsg.includes('not be decoded')) {
                    updateStatus('error', 'No QR code detected in the image. Please upload a clearer image with a visible QR code.');
                } else if (errorMsg.includes('decode')) {
                    updateStatus('error', 'Unable to decode QR code. Try uploading a clearer image.');
                    showInvalidPopup('Please give a valid QR');
                } else {
                    updateStatus('error', 'Could not read QR code from image. Please try a different image.');
                    showInvalidPopup('Please give a valid QR');
                }
            }
        };
        
        fileReader.readAsDataURL(file);
        
        // Reset the file input
        event.target.value = '';
        
    } catch (err) {
        console.error('Image upload error:', err);
        updateStatus('error', 'Failed to process image. Please try again.');
    }
}

// ========================================
// Display Scan Results
// ========================================
function displayResults(wasteItem) {
    const resultsCard = document.getElementById('resultsCard');
    const wasteCategory = document.getElementById('wasteCategory');
    const categoryIcon = document.getElementById('categoryIcon');
    const categoryName = document.getElementById('categoryName');
    const categoryBadge = document.getElementById('categoryBadge');
    const itemName = document.getElementById('itemName');
    const instructionsList = document.getElementById('instructionsList');
    const impactText = document.getElementById('impactText');
    
    // Update category styling
    wasteCategory.className = `waste-category ${wasteItem.category}`;
    
    // Update icon
    categoryIcon.innerHTML = `<i class="fas ${wasteItem.icon}"></i>`;
    
    // Update text content
    categoryName.textContent = getCategoryFullName(wasteItem.category);
    categoryBadge.textContent = wasteItem.badge;
    itemName.textContent = wasteItem.name;
    impactText.textContent = wasteItem.impact;
    
    // Update instructions list
    instructionsList.innerHTML = '';
    wasteItem.instructions.forEach(instruction => {
        const li = document.createElement('li');
        li.textContent = instruction;
        instructionsList.appendChild(li);
    });
    
    // Show results card with animation
    resultsCard.style.display = 'block';
    resultsCard.style.animation = 'fadeInRight 0.5s ease-out';
    
    // Store current scan data for logging
    resultsCard.dataset.wasteData = JSON.stringify(wasteItem);
}

// ========================================
// Get Full Category Name
// ========================================
function getCategoryFullName(category) {
    const names = {
        'dry': 'Dry Waste',
        'wet': 'Wet Waste',
        'ewaste': 'E-Waste',
        'hazardous': 'Hazardous Waste'
    };
    return names[category] || 'Unknown';
}

// ========================================
// Close Results
// ========================================
function closeResults() {
    const resultsCard = document.getElementById('resultsCard');
    resultsCard.style.animation = 'fadeOutRight 0.3s ease-out';
    setTimeout(() => {
        resultsCard.style.display = 'none';
    }, 300);
}

// ========================================
// Log Waste to History
// ========================================
function logWaste() {
    const resultsCard = document.getElementById('resultsCard');
    const wasteData = JSON.parse(resultsCard.dataset.wasteData);
    
    // Get weight input values
    const wasteWeight = document.getElementById('wasteWeight').value;
    const weightUnit = document.getElementById('weightUnit').value;
    
    // Validate weight input
    if (!wasteWeight || wasteWeight <= 0) {
        updateStatus('error', 'Please enter a valid weight before logging.');
        return;
    }
    
    // Get existing scans from localStorage
    let scans = JSON.parse(localStorage.getItem('wasteScans') || '[]');
    
    // Add new scan with timestamp and weight
    const newScan = {
        ...wasteData,
        weight: parseFloat(wasteWeight),
        unit: weightUnit,
        timestamp: new Date().toISOString(),
        id: Date.now()
    };
    
    scans.unshift(newScan); // Add to beginning
    
    // Keep only last 20 scans
    if (scans.length > 20) {
        scans = scans.slice(0, 20);
    }
    
    // Save to localStorage
    localStorage.setItem('wasteScans', JSON.stringify(scans));
    
    // Update analytics data
    updateAnalyticsData(wasteData.category);
    
    // Reload recent scans display
    loadRecentScans();
    
    // Reset weight input
    document.getElementById('wasteWeight').value = '';
    document.getElementById('weightUnit').value = 'kg';
    
    // Show success message
    updateStatus('success', `Waste logged successfully! ${wasteWeight}${weightUnit} added to history.`);
    
    // Close results after a moment
    setTimeout(() => {
        closeResults();
    }, 1500);
}

// ========================================
// Update Analytics Data in localStorage
// ========================================
function updateAnalyticsData(category) {
    const today = new Date().toISOString().split('T')[0];
    let analytics = JSON.parse(localStorage.getItem('wasteAnalytics') || '{}');
    
    // Initialize if needed
    if (!analytics[today]) {
        analytics[today] = {
            dry: 0,
            wet: 0,
            ewaste: 0,
            hazardous: 0,
            total: 0
        };
    }
    
    // Increment counts
    analytics[today][category]++;
    analytics[today].total++;
    
    // Save back
    localStorage.setItem('wasteAnalytics', JSON.stringify(analytics));
}

// ========================================
// Scan Again
// ========================================
function scanAgain() {
    closeResults();
    startScanning();
}

// ========================================
// Update Status Message
// ========================================
function updateStatus(type, message) {
    const statusElement = document.getElementById('scannerStatus');
    statusElement.className = `scanner-status ${type}`;
    
    const icons = {
        'info': 'fa-info-circle',
        'scanning': 'fa-qrcode',
        'success': 'fa-check-circle',
        'error': 'fa-exclamation-circle'
    };
    
    statusElement.innerHTML = `
        <i class="fas ${icons[type]}"></i>
        <span>${message}</span>
    `;
}

// ========================================
// Load Recent Scans from localStorage
// ========================================
function loadRecentScans() {
    const scansGrid = document.getElementById('scansGrid');
    const scans = JSON.parse(localStorage.getItem('wasteScans') || '[]');
    
    if (scans.length === 0) {
        scansGrid.innerHTML = '<p class="no-scans">No scans yet. Start scanning to see your history!</p>';
        return;
    }
    
    scansGrid.innerHTML = '';
    
    scans.slice(0, 8).forEach(scan => {
        const card = document.createElement('div');
        card.className = 'scan-history-card';
        card.innerHTML = `
            <div class="scan-history-header">
                <span class="scan-category-tag ${scan.category}">${getCategoryFullName(scan.category)}</span>
                <span class="scan-time">${formatTime(scan.timestamp)}</span>
            </div>
            <div class="scan-item-name">${scan.name}</div>
        `;
        
        // Add click handler to view details
        card.addEventListener('click', () => {
            displayResults(scan);
        });
        
        scansGrid.appendChild(card);
    });
}

// ========================================
// Format Timestamp
// ========================================
function formatTime(timestamp) {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
}

// ========================================
// Cleanup on Page Unload
// ========================================
window.addEventListener('beforeunload', () => {
    if (isScanning) {
        html5QrCode.stop();
    }
});

// Add fadeOutRight animation
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeInRight {
        from {
            opacity: 0;
            transform: translateX(20px);
        }
        to {
            opacity: 1;
            transform: translateX(0);
        }
    }
    
    @keyframes fadeOutRight {
        from {
            opacity: 1;
            transform: translateX(0);
        }
        to {
            opacity: 0;
            transform: translateX(20px);
        }
    }
`;
document.head.appendChild(style);
