# Swiss Working Days Lump Sum Calculator

A simple, modern web-based tool to calculate monthly lump sums based on working days in Switzerland.

## Features

- 📅 Calculate lump sums for multiple months
- 🇨🇭 Accounts for Swiss public holidays (federal holidays)
- 📊 Monthly breakdown with working days count
- 💰 Clear summary of total working days and total lump sum
- 📱 Responsive design for mobile and desktop
- 🎨 Modern, clean UI

## Swiss Public Holidays Included

The calculator automatically accounts for the following Swiss federal public holidays:

- New Year's Day (January 1)
- Berchtold's Day (January 2)
- Good Friday (movable)
- Easter Monday (movable)
- Ascension Day (movable)
- Whit Monday (movable)
- Swiss National Day (August 1)
- Christmas Day (December 25)
- St. Stephen's Day (December 26)

Weekend days (Saturday and Sunday) are also excluded from the working days calculation.

## How to Use

1. **Open the Application**: Open `index.html` in a web browser
2. **Enter Daily Rate**: Input your daily rate in Swiss Francs (CHF)
3. **Select Start Month**: Choose the month to start the calculation
4. **Enter Duration**: Specify how many months to calculate (1-120 months)
5. **Calculate**: Click the "Calculate" button to see results

The tool will display:
- Total working days across all months
- Total lump sum amount
- Month-by-month breakdown showing working days and lump sum for each month

## Technical Details

- **Pure HTML/CSS/JavaScript**: No external dependencies required
- **Client-side Calculation**: All calculations happen in your browser
- **Responsive Design**: Works on all screen sizes
- **Modern UI**: Built with contemporary design principles

## Files

- `index.html` - Main HTML structure
- `styles.css` - Modern CSS styling
- `calculator.js` - Calculation logic including working days and Swiss holiday handling

## Running Locally

Simply open the `index.html` file in any modern web browser:

```bash
# Using Python's built-in server (optional)
python -m http.server 8000

# Then navigate to http://localhost:8000
```

Or just double-click `index.html` to open it directly in your browser.

## Example Usage

**Scenario**: Calculate lump sum for 12 months starting January 2025 with a daily rate of CHF 500

1. Daily Rate: `500`
2. Start Month: `2025-01`
3. Duration: `12`

The calculator will show working days for each month (typically 20-23 days) and calculate the monthly lump sum accordingly.

## Browser Compatibility

Works in all modern browsers:
- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)

## License

MIT License - Feel free to use and modify as needed.
