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
 * Get the last working day of a specific month
 * @param {number} year - The year
 * @param {number} month - The month (0-11)
 * @returns {Date} - Last working day of the month
 */
function getLastWorkingDayOfMonth(year, month) {
    const holidays = getSwissHolidays(year);
    const lastDay = new Date(year, month + 1, 0);
    const currentDate = new Date(lastDay);
    
    // Start from the last day of the month and go backwards
    // Safety check: stop if we go back more than 31 days
    let daysChecked = 0;
    while (currentDate.getMonth() === month && daysChecked < 31) {
        if (!isWeekend(currentDate) && !isHoliday(currentDate, holidays)) {
            return new Date(currentDate);
        }
        currentDate.setDate(currentDate.getDate() - 1);
        daysChecked++;
    }
    
    // Fallback: return last day of month (should never reach here in practice)
    return lastDay;
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
 * Get week number in month for a given date
 * @param {Date} date - The date
 * @returns {number} - Week number in month (1-based)
 */
function getWeekOfMonth(date) {
    const firstDayOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
    const dayOfMonth = date.getDate();
    return Math.ceil((dayOfMonth + firstDayOfMonth.getDay()) / 7);
}

/**
 * Generate work plan breakdown for results
 * @param {Array} results - Monthly calculation results
 */
function displayWorkPlanBreakdown(results) {
    const workPlanContainer = document.getElementById('workPlanBreakdown');
    workPlanContainer.innerHTML = '';
    
    // Create table
    const table = document.createElement('table');
    table.className = 'work-plan-table';
    
    // Create table header
    const thead = document.createElement('thead');
    thead.innerHTML = `
        <tr>
            <th style="width: 15%;">Week</th>
            <th style="width: 42.5%;">Supplier Activities</th>
            <th style="width: 42.5%;">Client Obligations</th>
        </tr>
    `;
    table.appendChild(thead);
    
    // Create table body
    const tbody = document.createElement('tbody');
    
    results.forEach((result, milestoneIndex) => {
        // Add milestone header row
        const milestoneRow = document.createElement('tr');
        milestoneRow.className = 'milestone-row';
        milestoneRow.innerHTML = `
            <td colspan="3"><strong>Milestone ${milestoneIndex + 1} - ${result.monthName}</strong></td>
        `;
        tbody.appendChild(milestoneRow);
        
        // Get the date range for this month
        const monthDate = new Date(result.milestoneDate.getFullYear(), result.milestoneDate.getMonth(), 1);
        const lastDay = new Date(result.milestoneDate.getFullYear(), result.milestoneDate.getMonth() + 1, 0);
        
        // Calculate approximate number of weeks in this month
        const weeksInMonth = Math.ceil(lastDay.getDate() / 7);
        
        // Create rows for each week in the month
        for (let week = 1; week <= weeksInMonth; week++) {
            const weekRow = document.createElement('tr');
            
            // Calculate approximate week dates
            const weekStartDay = (week - 1) * 7 + 1;
            const weekEndDay = Math.min(week * 7, lastDay.getDate());
            const weekLabel = `Week ${weekStartDay}-${weekEndDay}`;
            
            weekRow.innerHTML = `
                <td>${weekLabel}</td>
                <td>
                    <textarea 
                        placeholder="Enter supplier activities..."
                        data-milestone="${milestoneIndex}"
                        data-week="${week}"
                        data-type="supplier"
                        class="work-plan-input"
                    ></textarea>
                </td>
                <td>
                    <textarea 
                        placeholder="Enter client obligations..."
                        data-milestone="${milestoneIndex}"
                        data-week="${week}"
                        data-type="client"
                        class="work-plan-input"
                    ></textarea>
                </td>
            `;
            
            tbody.appendChild(weekRow);
        }
    });
    
    table.appendChild(tbody);
    workPlanContainer.appendChild(table);
    
    // Add event listeners to work plan inputs
    document.querySelectorAll('.work-plan-input').forEach(input => {
        input.addEventListener('input', function() {
            const milestoneIndex = parseInt(this.dataset.milestone);
            const week = parseInt(this.dataset.week);
            const type = this.dataset.type;
            
            if (!currentResults[milestoneIndex].workPlan) {
                currentResults[milestoneIndex].workPlan = {};
            }
            if (!currentResults[milestoneIndex].workPlan[week]) {
                currentResults[milestoneIndex].workPlan[week] = {};
            }
            currentResults[milestoneIndex].workPlan[week][type] = this.value;
        });
    });
}

/**
 * Format date
 * @param {Date} date - The date
 * @returns {string} - Formatted date string (DD.MM.YYYY)
 */
function formatDate(date) {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}.${month}.${year}`;
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
let currentResults = []; // Store current results globally for export

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
        const milestoneDate = getLastWorkingDayOfMonth(currentYear, currentMonth);
        
        results.push({
            monthName: formatMonth(currentYear, currentMonth),
            workingDays: workingDays,
            lumpSum: lumpSum,
            milestoneDate: milestoneDate,
            deliverables: '', // Initialize empty deliverables
            workPlan: {} // Initialize empty work plan
        });
        
        totalWorkingDays += workingDays;
        totalLumpSum += lumpSum;
    }
    
    // Display results
    currentResults = results; // Store results globally
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
    
    results.forEach((result, index) => {
        const monthCard = document.createElement('div');
        monthCard.className = 'month-card';
        
        monthCard.innerHTML = `
            <div class="month-name">${result.monthName}</div>
            <div class="month-milestone">${formatDate(result.milestoneDate)}</div>
            <div class="month-days">${result.workingDays} working days</div>
            <div class="month-sum">${formatCurrency(result.lumpSum)}</div>
            <div class="month-deliverables">
                <input 
                    type="text" 
                    placeholder="Enter deliverables..." 
                    data-month-index="${index}"
                    value="${result.deliverables}"
                    class="deliverables-input"
                >
            </div>
        `;
        
        breakdownContainer.appendChild(monthCard);
    });
    
    // Add event listeners to deliverables inputs
    document.querySelectorAll('.deliverables-input').forEach(input => {
        input.addEventListener('input', function() {
            const monthIndex = parseInt(this.dataset.monthIndex);
            currentResults[monthIndex].deliverables = this.value;
        });
    });
    
    // Generate and display work plan breakdown
    displayWorkPlanBreakdown(results);
    
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
    
    // Add event listener for export button
    document.getElementById('exportExcel').addEventListener('click', exportToExcel);
});

/**
 * Export results to Excel (CSV format)
 */
function exportToExcel() {
    if (!currentResults || currentResults.length === 0) {
        alert('No results to export. Please calculate first.');
        return;
    }
    
    // Prepare CSV data - Start with Monthly Breakdown
    let csvContent = '=== MONTHLY BREAKDOWN ===\n';
    csvContent += 'Month,Milestone,Working Days,Lump Sum (CHF),Deliverables\n';
    
    let totalWorkingDays = 0;
    let totalLumpSum = 0;
    
    currentResults.forEach(result => {
        const deliverables = (result.deliverables || '').replace(/,/g, ';'); // Replace commas to avoid CSV issues
        const milestone = formatDate(result.milestoneDate);
        csvContent += `"${result.monthName}","${milestone}",${result.workingDays},${result.lumpSum.toFixed(2)},"${deliverables}"\n`;
        totalWorkingDays += result.workingDays;
        totalLumpSum += result.lumpSum;
    });
    
    // Add totals row
    csvContent += `"TOTAL","",${totalWorkingDays},${totalLumpSum.toFixed(2)},""\n`;
    
    // Add Work Plan Breakdown
    csvContent += '\n=== WORK PLAN BREAKDOWN ===\n';
    csvContent += 'Milestone,Week,Supplier Activities,Client Obligations\n';
    
    currentResults.forEach((result, milestoneIndex) => {
        // Add milestone header
        csvContent += `"Milestone ${milestoneIndex + 1} - ${result.monthName}","","",""\n`;
        
        // Get the last day of month to determine weeks
        const lastDay = new Date(result.milestoneDate.getFullYear(), result.milestoneDate.getMonth() + 1, 0);
        const weeksInMonth = Math.ceil(lastDay.getDate() / 7);
        
        // Export each week's data
        for (let week = 1; week <= weeksInMonth; week++) {
            const weekStartDay = (week - 1) * 7 + 1;
            const weekEndDay = Math.min(week * 7, lastDay.getDate());
            const weekLabel = `Week ${weekStartDay}-${weekEndDay}`;
            
            const workPlan = result.workPlan || {};
            const weekData = workPlan[week] || {};
            const supplierActivities = (weekData.supplier || '').replace(/,/g, ';').replace(/\n/g, ' ');
            const clientObligations = (weekData.client || '').replace(/,/g, ';').replace(/\n/g, ' ');
            
            csvContent += `"","${weekLabel}","${supplierActivities}","${clientObligations}"\n`;
        }
    });
    
    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    
    // Generate filename with current date
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const filename = `lumpsum-calculation-${dateStr}.csv`;
    
    // Create download link
    if (navigator.msSaveBlob) { // IE 10+
        navigator.msSaveBlob(blob, filename);
    } else {
        link.href = URL.createObjectURL(blob);
        link.download = filename;
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
}
