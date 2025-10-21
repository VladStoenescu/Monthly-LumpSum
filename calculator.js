// Swiss public holidays (fixed dates and movable holidays)
// For simplicity, we'll focus on the most common federal holidays
const swissFixedHolidays = [
    { month: 0, day: 1 },   // New Year's Day
    { month: 0, day: 2 },   // Berchtold's Day (some cantons)
    { month: 7, day: 1 },   // Swiss National Day
    { month: 11, day: 25 }, // Christmas Day
    { month: 11, day: 26 }, // St. Stephen's Day
];

/**
 * Calculate Easter date for a given year using Computus algorithm
 * @param {number} year - The year
 * @returns {Date} - Easter Sunday date
 */
function calculateEaster(year) {
    const a = year % 19;
    const b = Math.floor(year / 100);
    const c = year % 100;
    const d = Math.floor(b / 4);
    const e = b % 4;
    const f = Math.floor((b + 8) / 25);
    const g = Math.floor((b - f + 1) / 3);
    const h = (19 * a + b - d - g + 15) % 30;
    const i = Math.floor(c / 4);
    const k = c % 4;
    const l = (32 + 2 * e + 2 * i - h - k) % 7;
    const m = Math.floor((a + 11 * h + 22 * l) / 451);
    const month = Math.floor((h + l - 7 * m + 114) / 31) - 1;
    const day = ((h + l - 7 * m + 114) % 31) + 1;
    return new Date(year, month, day);
}

/**
 * Get Swiss public holidays for a given year
 * @param {number} year - The year
 * @returns {Date[]} - Array of holiday dates
 */
function getSwissHolidays(year) {
    const holidays = [];
    
    // Add fixed holidays
    swissFixedHolidays.forEach(holiday => {
        holidays.push(new Date(year, holiday.month, holiday.day));
    });
    
    // Add movable holidays based on Easter
    const easter = calculateEaster(year);
    
    // Good Friday (2 days before Easter)
    const goodFriday = new Date(easter);
    goodFriday.setDate(easter.getDate() - 2);
    holidays.push(goodFriday);
    
    // Easter Monday (1 day after Easter)
    const easterMonday = new Date(easter);
    easterMonday.setDate(easter.getDate() + 1);
    holidays.push(easterMonday);
    
    // Ascension Day (39 days after Easter)
    const ascension = new Date(easter);
    ascension.setDate(easter.getDate() + 39);
    holidays.push(ascension);
    
    // Whit Monday (50 days after Easter)
    const whitMonday = new Date(easter);
    whitMonday.setDate(easter.getDate() + 50);
    holidays.push(whitMonday);
    
    return holidays;
}

/**
 * Check if a date is a weekend
 * @param {Date} date - The date to check
 * @returns {boolean} - True if weekend, false otherwise
 */
function isWeekend(date) {
    const day = date.getDay();
    return day === 0 || day === 6; // Sunday or Saturday
}

/**
 * Check if a date is a Swiss public holiday
 * @param {Date} date - The date to check
 * @param {Date[]} holidays - Array of holiday dates
 * @returns {boolean} - True if holiday, false otherwise
 */
function isHoliday(date, holidays) {
    return holidays.some(holiday => 
        holiday.getFullYear() === date.getFullYear() &&
        holiday.getMonth() === date.getMonth() &&
        holiday.getDate() === date.getDate()
    );
}

/**
 * Calculate working days in a specific month
 * @param {number} year - The year
 * @param {number} month - The month (0-11)
 * @returns {number} - Number of working days
 */
function getWorkingDaysInMonth(year, month) {
    const holidays = getSwissHolidays(year);
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    let workingDays = 0;
    const currentDate = new Date(firstDay);
    
    while (currentDate <= lastDay) {
        if (!isWeekend(currentDate) && !isHoliday(currentDate, holidays)) {
            workingDays++;
        }
        currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return workingDays;
}

/**
 * Format month name
 * @param {number} year - The year
 * @param {number} month - The month (0-11)
 * @returns {string} - Formatted month name
 */
function formatMonth(year, month) {
    const date = new Date(year, month, 1);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
}

/**
 * Format currency
 * @param {number} amount - The amount
 * @returns {string} - Formatted currency string
 */
function formatCurrency(amount) {
    return `CHF ${amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
}

/**
 * Handle form submission
 */
document.getElementById('calculatorForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    // Get form values
    const rate = parseFloat(document.getElementById('rate').value);
    const startMonth = document.getElementById('startMonth').value;
    const duration = parseInt(document.getElementById('duration').value);
    
    // Parse start month
    const [year, month] = startMonth.split('-').map(Number);
    const startYear = year;
    const startMonthIndex = month - 1; // Convert to 0-based index
    
    // Calculate results
    const results = [];
    let totalWorkingDays = 0;
    let totalLumpSum = 0;
    
    for (let i = 0; i < duration; i++) {
        const currentDate = new Date(startYear, startMonthIndex + i, 1);
        const currentYear = currentDate.getFullYear();
        const currentMonth = currentDate.getMonth();
        
        const workingDays = getWorkingDaysInMonth(currentYear, currentMonth);
        const lumpSum = workingDays * rate;
        
        results.push({
            monthName: formatMonth(currentYear, currentMonth),
            workingDays: workingDays,
            lumpSum: lumpSum
        });
        
        totalWorkingDays += workingDays;
        totalLumpSum += lumpSum;
    }
    
    // Display results
    displayResults(results, totalWorkingDays, totalLumpSum);
});

/**
 * Display calculation results
 * @param {Array} results - Monthly calculation results
 * @param {number} totalWorkingDays - Total working days
 * @param {number} totalLumpSum - Total lump sum
 */
function displayResults(results, totalWorkingDays, totalLumpSum) {
    // Update summary
    document.getElementById('totalDays').textContent = totalWorkingDays;
    document.getElementById('totalSum').textContent = formatCurrency(totalLumpSum);
    
    // Clear and populate monthly breakdown
    const breakdownContainer = document.getElementById('monthlyBreakdown');
    breakdownContainer.innerHTML = '';
    
    results.forEach(result => {
        const monthCard = document.createElement('div');
        monthCard.className = 'month-card';
        
        monthCard.innerHTML = `
            <div class="month-name">${result.monthName}</div>
            <div class="month-days">${result.workingDays} working days</div>
            <div class="month-sum">${formatCurrency(result.lumpSum)}</div>
        `;
        
        breakdownContainer.appendChild(monthCard);
    });
    
    // Show results container
    document.getElementById('results').style.display = 'block';
    
    // Scroll to results
    document.getElementById('results').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// Set default start month to current month
document.addEventListener('DOMContentLoaded', function() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    document.getElementById('startMonth').value = `${year}-${month}`;
});
