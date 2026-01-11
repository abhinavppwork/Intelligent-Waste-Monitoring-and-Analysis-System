// Utility to clear frontend localStorage data
function clearLocalStorage() {
    localStorage.removeItem('wasteScans');
    localStorage.removeItem('wasteAnalytics');
    console.log('✓ Cleared wasteScans and wasteAnalytics from localStorage');
    alert('Frontend data cleared! Refresh the page to see empty state.');
}

// Alternative: Clear ALL localStorage (including auth)
function clearAllLocalStorage() {
    localStorage.clear();
    console.log('✓ Cleared all localStorage');
    alert('All frontend data cleared! Refresh the page.');
}

// Run in browser console to clear:
// clearLocalStorage();  // clears only waste data
// clearAllLocalStorage();  // clears everything including login
