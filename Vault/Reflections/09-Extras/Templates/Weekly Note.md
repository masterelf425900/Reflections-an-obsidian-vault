---
Date: <% tp.date.now("YYYY-MM-DD", undefined, tp.file.title, "YYYY MMM Do ([W]ww)") %>
creation date: <% tp.file.creation_date("YYYY MMM Do ddd LT", 0) %>
modification date: <% tp.file.last_modified_date("YYYY MMM Do ddd LT", 0) %>
obsidianUIMode: 
cssclasses: 
Reflections: ""
Patterns_and_Trends: 
Future_Considerations: 
Laundry_status: false
Cleaning_status: false
Car_status: false
Gardening_status: false
Finance_status: false
---

<< [[<% tp.date.weekday("YYYY MMM Do ddd", -5, tp.file.title, "YYYY MMM Do ([W]ww)") %>|Sun]] | [[<% tp.date.weekday("YYYY MMM Do ddd", -4, tp.file.title, "YYYY MMM Do ([W]ww)") %>|Mon]] | [[<% tp.date.weekday("YYYY MMM Do ddd", -3, tp.file.title, "YYYY MMM Do ([W]ww)") %>|Tue]] | [[<% tp.date.weekday("YYYY MMM Do ddd", -2, tp.file.title, "YYYY MMM Do ([W]ww)") %>|Wed]] | [[<% tp.date.weekday("YYYY MMM Do ddd", -1, tp.file.title, "YYYY MMM Do ([W]ww)") %>|Thu]] | [[<% tp.date.weekday("YYYY MMM Do ddd", 0, tp.file.title, "YYYY MMM Do ([W]ww)") %>|Fri]] | [[<% tp.date.weekday("YYYY MMM Do ddd", -6, tp.file.title, "YYYY MMM Do ([W]ww)") %>|Sat]] >> | << [[<% tp.date.weekday("YYYY MMM Do ([W]ww)", -7, tp.file.title, "YYYY MMM Do ([W]ww)") %>|Last Weekday]] | [[<% tp.date.weekday("YYYY MMM Do ([W]ww)", 7, tp.file.title, "YYYY MMM Do ([W]ww)") %>|Next Weekday]] | [[<% tp.date.now("YYYY MMM", undefined, tp.file.title, "YYYY MMM Do ([W]ww)") %>|Monthly]]  >>  `BUTTON[Refresh]`
```meta-bind-embed
[[Movies Embeds]]
```

---

## <span style="color:rgb(74, 144, 226)">Reflections</span> ![[feather.svg|30]]

`INPUT[textArea(class(reflection-text)):Reflections]`
<span style="color:rgb(74, 144, 226); font-weight: bold;">Key Takeouts</span> ![[Highlight.svg|24]]

```dataviewjs
// Function to parse YAML date string
const parseDate = (dateString) => {
    const [year, month, day] = dateString.split('-').map(Number);
    return dv.date(`${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`);
};

// Get the current note's date from YAML frontmatter
const currentDate = parseDate(dv.current().file.frontmatter.Date);

// Calculate the start date (7 days before the current note's date)
const startDate = currentDate.minus({days: 7});

// Get all notes within the 7-day range
const recentNotes = dv.pages()
    .where(p => p.file.frontmatter.Date && 
               parseDate(p.file.frontmatter.Date) >= startDate && 
               parseDate(p.file.frontmatter.Date) <= currentDate);

// Extract and flatten Key_Takeouts
const keyTakeouts = recentNotes
    .flatMap(page => page.file.frontmatter.Key_Takeouts || [])
    .filter(takeout => takeout);

// Create the cell content
const cellContent = keyTakeouts.length > 0 
    ? `<ul style="list-style-type: none; padding-left: 0; margin: 0; color: inherit;">
        ${keyTakeouts.map(takeout => `<li style="margin-bottom: 15px; color: inherit;">${takeout.replace(/^[-•]\s*/, '')}</li>`).join("")}
      </ul>`
    : "No key takeouts found in the last 7 days.";

// Render the table
dv.table([], [[cellContent]]);
```

<span style="color:rgb(74, 144, 226); font-weight: bold;">Upcoming Events</span> ![[Calendar-time.svg|24]]
```dataviewjs
// Function to extract reminders from a page
function extractReminders(page) {
  let reminders = [];
  let i = 0;

  // Loop through reminders until no more valid keys are found
  while (true) {
    let found = false;
    for (let j = i; j <= i + 1; j++) {  // Check both i and i+1
      const reminderTextKey = `Reminder_Text_${j}`;
      const reminderDateKey = `Reminder_Date_${j}`;

      // Check if both the text and date keys exist
      if (page.file.frontmatter[reminderTextKey] !== undefined && page.file.frontmatter[reminderDateKey] !== undefined) {
        reminders.push({
          reminder_text: page.file.frontmatter[reminderTextKey],
          reminder_date: moment(page.file.frontmatter[reminderDateKey]),
          note_date: moment(page.file.frontmatter.Date)
        });
        found = true;
        i = j;  // Update i to the found index
        break;
      }
    }
    
    if (!found) {
      break; // Exit the loop if no more reminders are found
    }

    i++;
  }

  return reminders;
}



// Get all notes
let allNotes = dv.pages();

// Get the current note's date
let currentNoteDate = moment(dv.current().file.frontmatter.Date).startOf('day');

// Define the start date for filtering (7 days before the current note's date)
const sevenDaysAgo = moment(currentNoteDate).subtract(7, 'days').startOf('day');

// Extract all reminders from notes in the "01-Daily Notes" folder
let allReminders = allNotes.flatMap(page => {
  if (page.file.path.startsWith("01-Daily Notes/")) {
    const extractedReminders = extractReminders(page);
    console.log(`Extracted from ${page.file.name}:`, extractedReminders);
    return extractedReminders;
  }
  return [];
});

// Filter and process reminders based on the new conditions
let processedReminders = allReminders.map(reminder => {
  const reminderDate = reminder.reminder_date.startOf('day');
  const noteDate = reminder.note_date.startOf('day');
  const daysSinceNote = currentNoteDate.diff(noteDate, 'days');

  let symbol;
  let display = false;

  if (reminderDate.isAfter(currentNoteDate)) {
    symbol = '![[circle-ellipsis.svg|25]]';
    display = true; // Always display future reminders
  } else if (reminderDate.isBefore(currentNoteDate)) {
    symbol = '![[Check.svg|25]]';
    display = daysSinceNote <= 7; // Display if note is 7 days old or newer
  } else { // reminderDate is same as currentNoteDate
    symbol = '![[circle-alert.svg|25]]';
    display = daysSinceNote <= 7; // Display if note is 7 days old or newer
  }

  return { ...reminder, symbol, display };
}).filter(reminder => reminder.display);

// Sort reminders by date
processedReminders.sort((a, b) => a.reminder_date.diff(b.reminder_date));

// Check if there are any eligible reminders
if (processedReminders.length === 0) {
  dv.paragraph("No eligible reminders found.");
} else {
  console.log(`Displaying reminders: ${JSON.stringify(processedReminders)}`);
  // Loop through the reminders and create styled output
  for (let reminder of processedReminders) {
    let reminderDate = reminder.reminder_date.format('YYYY-MM-DD');
    dv.paragraph(`<span style="color:rgb(91, 97, 117); font-weight: bold; margin-left: 13px;">•</span> <span style="display: inline-flex; align-items: center;">
      <input type="text" value="${reminder.reminder_text}" style="background: transparent; border: 1px solid #282e42; border-radius: 4px; color: inherit; font-weight: 15px; margin-left: 0px; width: 207px;">
      <span style="margin-left: 15px;"></span>
      <input type="date" value="${reminderDate}" style="background: #272935; border: 1px solid #282e42; color: #4a90e2; font-size: 13; border-radius: 4px; align-items: center; font-weight: 10px; width: 117px; margin-left: 10px;">
      <span style="margin-left: 10px;">${reminder.symbol}</span>
    </span>`);
  }
}

```

## <span style="color:rgb(220, 86, 151)">Entertainment</span> ![[Mask.svg|30]]‎
#### <span style="color:rgb(220, 86, 151)">Media</span> ![[tv.svg|24]]

```dataviewjs
// Define chart size (modify these values as needed)
const chartSize = { width: 800, height: 800 }; // Adjust width and height

// Access the current note's YAML frontmatter date
const yamlDate = dv.current().date;
const currentDate = yamlDate ? dv.date(yamlDate) : dv.date();

// Calculate the date 7 days ago
const sevenDaysAgo = currentDate.minus({ days: 7 });

// Define the folder path
const folderPath = '"01-Daily Notes"';

// Retrieve pages from the past 7 days
const pages = dv.pages(folderPath)
    .where(page => page.date && page.date >= sevenDaysAgo && page.date <= currentDate)
    .sort(page => page.date, 'asc');

// Initialize counts for topics
const topicCounts = {
    Games: 0,
    Movies: 0,
    TV_Shows: 0,
    Others: 0
};

// Check presence of data for each topic
pages.forEach(page => {
    Object.keys(topicCounts).forEach(topic => {
        if (page[topic] && Array.isArray(page[topic]) && page[topic].length > 0) {
            topicCounts[topic] += page[topic].length;
        }
    });
});

// Generate Pie Chart Data
const topicLabels = Object.keys(topicCounts);
const topicData = topicLabels.map(label => topicCounts[label]);
const pieChartData = {
    type: 'doughnut',
    data: {
        labels: topicLabels,
        datasets: [{
            label: 'Interaction by Topic',
            data: topicData,
            backgroundColor: ['rgba(255, 99, 132, 0.2)', 'rgba(54, 162, 235, 0.2)', 'rgba(255, 206, 86, 0.2)', 'rgba(75, 192, 192, 0.2)', 'rgba(153, 102, 255, 0.2)'],
            borderColor: ['rgba(255, 99, 132, 1)', 'rgba(54, 162, 235, 1)', 'rgba(255, 206, 86, 1)', 'rgba(75, 192, 192, 1)', 'rgba(153, 102, 255, 1)'],
            borderWidth: 1
        }]
    },
    options: {
        responsive: true,
        maintainAspectRatio: false, // Allows resizing
        width: chartSize.width, // Set custom width
        height: chartSize.height, // Set custom height
        plugins: {
            legend: {
                position: 'right',
                labels: {
                    boxWidth: 24,
                    font: { size: 20 }
                }
            },
            tooltip: {
                callbacks: {
                    label: function(tooltipItem) {
                        return `${tooltipItem.label}: ${tooltipItem.raw}`;
                    }
                }
            }
        }
    }
};

// Render the Pie Chart
try {
    window.renderChart(pieChartData, this.container);
} catch (error) {
    dv.paragraph(`Error rendering pie chart: ${error.message}`);
}

```

```dataviewjs
// Access the current note's YAML frontmatter Date
const yamlDate = dv.current().Date;
const currentDate = yamlDate ? dv.date(yamlDate) : dv.date();

// Calculate the date 7 days ago
const sevenDaysAgo = currentDate.minus({ days: 7 });

// Define the folder path
const folderPath = '"01-Daily Notes"';

// Retrieve pages from the past 7 days
const pages = dv.pages(folderPath)
    .where(page => page.Date && page.Date >= sevenDaysAgo && page.Date <= currentDate)
    .sort(page => page.Date, 'asc');

// Initialize counts for topics
const topicDataCounts = {
    Games: {},
    Movies: {},
    TV_Shows: {},
    Other: {}
};

// Define custom colors for specific entries
const customColors = {
    "Dota 2": "rgba(255, 0, 0, 0.6)", // Bright red for Dota 2
    // Add more custom colors here as needed
    // "Entry Name": "rgba(r, g, b, alpha)",
};

// Helper function to clean and truncate data, and make it case-insensitive
function cleanData(item) {
    if (typeof item !== 'string') {
        return '';
    }
    return item.split('-')[0].trim().toLowerCase(); // Truncate at the dash and convert to lowercase
}

// Function to convert a string to title case
function toTitleCase(str) {
    return str.replace(/\w\S*/g, function(txt) {
        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    });
}

// Aggregate data for each topic
pages.forEach(page => {
    Object.keys(topicDataCounts).forEach(topic => {
        if (page[topic]) {
            // Ensure we're working with a string
            const topicContent = String(page[topic]);
            if (topicContent.trim()) {
                // Split the data by comma, clean, convert to lowercase, and count occurrences
                topicContent.split(',').forEach(item => {
                    const cleanedItem = cleanData(item);
                    if (cleanedItem) {
                        topicDataCounts[topic][cleanedItem] = (topicDataCounts[topic][cleanedItem] || 0) + 1;
                    }
                });
            }
        }
    });
});

// Prepare data for the Bar Chart
const allLabels = [];
const allData = [];
const colors = {
    Games: 'rgba(255, 99, 132, 0.6)',   // Red
    Movies: 'rgba(54, 162, 235, 0.6)',  // Blue
    TV_Shows: 'rgba(255, 206, 86, 0.6)',// Yellow
    Apps: 'rgba(75, 192, 192, 0.6)',    // Cyan
    Other: 'rgba(153, 102, 255, 0.6)'   // Purple
};

// Collect all labels and data for the chart
Object.keys(topicDataCounts).forEach(topic => {
    Object.keys(topicDataCounts[topic]).forEach(item => {
        // Convert label to title case for display
        const titleCasedLabel = toTitleCase(item);
        allLabels.push(titleCasedLabel);
        allData.push(topicDataCounts[topic][item]);
    });
});

// Add this helper function for text wrapping
function wrapText(text, maxWidth) {
    const words = text.split(' ');
    const lines = [];
    let currentLine = '';

    words.forEach(word => {
        if (currentLine.length + word.length <= maxWidth) {
            currentLine += (currentLine ? ' ' : '') + word;
        } else {
            lines.push(currentLine);
            currentLine = word;
        }
    });
    lines.push(currentLine);

    return lines;
}

const barChartData = {
    type: 'bar',
    data: {
        labels: allLabels,
        datasets: [{
            label: 'Contents',
            data: allData,
            backgroundColor: allLabels.map(label => {
                // Check if there's a custom color for this label
                if (customColors[label]) {
                    return customColors[label];
                }
                // If no custom color, use the default topic color
                const topic = Object.keys(topicDataCounts).find(t => topicDataCounts[t][label.toLowerCase()] !== undefined);
                return colors[topic] || 'rgba(0, 0, 0, 0.6)';
            }),
            borderColor: allLabels.map(label => {
                // Use a darker version of the background color for the border
                const bgColor = customColors[label] || colors[Object.keys(topicDataCounts).find(t => topicDataCounts[t][label.toLowerCase()] !== undefined)] || 'rgba(0, 0, 0, 0.6)';
                return bgColor.replace('0.6', '1');
            }),
            borderWidth: 1
        }]
    },
    options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            x: {
                title: { display: true, text: 'Contents' },
                ticks: { 
                    autoSkip: false, 
                    maxRotation: 0,
                    minRotation: 0,
                    callback: function(value) {
                        const label = this.getLabelForValue(value);
                        return wrapText(label, 15);  // Wrap text with max width of 15 characters
                    }
                }
            },
            y: { title: { display: true, text: 'Count' }, beginAtZero: true }
        },
        plugins: {
            legend: { display: true },
            tooltip: {
                callbacks: {
                    title: function(context) {
                        return context[0].label;
                    }
                }
            }
        },
        layout: {
            padding: {
                bottom: 30 // Add some padding at the bottom for wrapped labels
            }
        }
    }
};

// Render the Bar Chart
try {
    this.container.style.height = '500px'; // Set a fixed height for the chart
    window.renderChart(barChartData, this.container);
} catch (error) {
    dv.paragraph(`Error rendering bar chart: ${error.message}`);
}
```

#### <span style="color:rgb(220, 86, 151)">Content Highlight</span> ![[pin.svg|24]]

```dataviewjs
// Function to parse YAML date string
const parseDate = (dateString) => {
    const [year, month, day] = dateString.split('-').map(Number);
    return dv.date(`${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`);
};

// Get the current note's date from YAML frontmatter
const currentDate = parseDate(dv.current().file.frontmatter.Date);

// Calculate the start date (7 days before the current note's date)
const startDate = currentDate.minus({days: 7});

// Get all notes within the 7-day range
const recentNotes = dv.pages('"01-Daily Notes"')
    .where(p => p.file.frontmatter.Date && 
               parseDate(p.file.frontmatter.Date) >= startDate && 
               parseDate(p.file.frontmatter.Date) <= currentDate);

// Extract and flatten Content_Highlights
const contentHighlights = recentNotes
    .flatMap(page => page.file.frontmatter.Content_Highlight || [])
    .filter(highlight => highlight);

// Function to convert text with URLs to clickable HTML links
function convertToLink(text) {
    const urlRegex = /(\[([^\]]+)\]\((https?:\/\/[^\s]+)\))/g;
    return text.replace(urlRegex, (match, p1, p2, p3) => {
        return `<a href="${p3}" target="_blank" style="color: ; text-decoration: underline;">${p2}</a>`;
    });
}

// Create the cell content
const cellContent = contentHighlights.length > 0 
    ? `<ul style="list-style-type: none; padding-left: 0; margin: 0; color: inherit;">
        ${contentHighlights.map(highlight => `<li style="margin-bottom: 15px; color: inherit;">${convertToLink(highlight.replace(/^[-•]\s*/, ''))}</li>`).join("")}
      </ul>`
    : "No content highlights found in the last 7 days.";

// Render the table
dv.table([], [[cellContent]]);
```

## <span style="color:rgb(26, 188, 156)">Lifestyles</span> ![[Growing.svg|30]]‎
### <span style="color:rgb(26, 188, 156)">Habits</span> ![[sun.svg|26]]
###### <span style="color:rgb(26, 188, 156)">Weekly Habit</span> ![[haze-moon.svg|34]]

```dataviewjs
// Get the current note's YAML data
const data = dv.current().file.frontmatter;

// Create an array of activities with their corresponding YAML toggle fields
const activities = [
    { name: "Big Laundry", toggle: "Laundry_status" },
    { name: "Home Cleaning", toggle: "Cleaning_status" },
    { name: "Car Maintenance ", toggle: "Car_status" },
    { name: "Gardening ", toggle: "Gardening_status" },
    { name: "Finance Budgeting", toggle: "Finance_status" }
];

// Create a container to hold the table
const tableContainer = dv.el("div", "");

// Create the table element with inline CSS to center content
const table = document.createElement("table");
table.style.width = "100%";
table.style.textAlign = "center";

// Build the header row with activity names as column headers
const headerRow = document.createElement("tr");
activities.forEach(activity => {
    const th = document.createElement("th");
    th.textContent = activity.name;
    th.style.padding = "10px";  // Add some padding for better appearance
    th.style.textAlign = "center";  // Center the text in the headers
    headerRow.appendChild(th);
});
table.appendChild(headerRow);

// Create the row for the INPUT toggles
const statusRow = document.createElement("tr");
activities.forEach((activity) => {
    const td = document.createElement("td");

    // Use Dataview's rendering for INPUT toggle
    const toggleElement = dv.el("span", `\`INPUT[toggle:${activity.toggle}]\``);

    td.appendChild(toggleElement);
    td.style.textAlign = "center";  // Center the toggles
    td.style.padding = "10px";  // Add padding for spacing
    statusRow.appendChild(td);
});

// Append the status row to the table
table.appendChild(statusRow);

// Append the table to the container
tableContainer.appendChild(table);

```

###### <span style="color:rgb(26, 188, 156)">Daily Habit</span> ![[sunset-2.svg|34]]

```dataviewjs
// Parse the current note's date from YAML
const currentDate = dv.date(dv.current().Date);

// Function to get the date 7 days ago
function getSevenDaysAgo(date) {
    return date.minus({ days: 6 });
}

// Get the date 7 days ago
const sevenDaysAgo = getSevenDaysAgo(currentDate);

// Define the activities and their corresponding YAML toggle fields
const activities = [
    { name: "Exercise", toggle: "Exercise_Status", color: "#FFD700", points: 3 },
    { name: "Meal", toggle: "Meal_Status", color: "#FF6347", points: 3 },
    { name: "Shower", toggle: "Shower_Status", color: "#87CEEB", points: 2 },
    { name: "Entertainment", toggle: "Entertainment_Status", color: "#9370DB", points: 2 },
    { name: "Productive", toggle: "Productive_Work", color: "#4682B4", points: 5 },
    { name: "Academic", toggle: "Academics_Studied", color: "#00FFFF", points: 5 }
];

// Calculate the total possible points for one day
const maxDailyPoints = activities.reduce((total, activity) => total + activity.points, 0);

// Total possible points for the week (7 days)
const maxWeeklyPoints = maxDailyPoints * 7;

// Get the pages for the last 7 days
const pages = dv.pages('"01-Daily Notes"')
    .where(p => {
        const pageDate = dv.date(p.Date);
        return pageDate >= sevenDaysAgo && pageDate <= currentDate;
    })
    .sort(p => dv.date(p.Date));

// Create the table container
const tableContainer = dv.el("div", "");
const table = document.createElement("table");
table.style.width = "100%";
table.style.textAlign = "center";
table.style.borderCollapse = "collapse";

// Create header row
const headerRow = document.createElement("tr");
headerRow.appendChild(document.createElement("th")); // Empty cell for date column
activities.forEach(activity => {
    const th = document.createElement("th");
    th.textContent = activity.name;
    th.style.padding = "10px";
    th.style.textAlign = "center";
    th.style.borderBottom = "1px solid #444";
    headerRow.appendChild(th);
});
const ratingHeader = document.createElement("th");
ratingHeader.textContent = "Rating";
ratingHeader.style.padding = "10px";
ratingHeader.style.textAlign = "center";
ratingHeader.style.borderBottom = "1px solid #444";
headerRow.appendChild(ratingHeader); // Add rating column to the header
table.appendChild(headerRow);

// Function to get the correct image path based on the percentage score
function getRatingImage(percentage) {
    if (percentage < 50) {
        return "![[weak.webp|50]]";
    } else if (percentage < 75) {
        return "![[fair.webp|50]]";
    } else if (percentage < 100) {
        return "![[strong.webp|50]]";
    } else {
        return "![[mighty.webp|50]]";
    }
}


// Create rows for each day
pages.forEach(page => {
    const row = document.createElement("tr");
    
    // Add date cell
    const dateCell = document.createElement("td");
    dateCell.appendChild(dv.el("span", page.file.link));
    dateCell.style.padding = "10px";
    dateCell.style.borderBottom = "1px solid #444";
    row.appendChild(dateCell);
    
    // Initialize points for the current day
    let totalPoints = 0;
    
    // Add toggle cells for each activity and calculate points
    activities.forEach(activity => {
        const td = document.createElement("td");
        const status = page[activity.toggle];
        const toggleElement = document.createElement("div");
        toggleElement.style.width = "25px";
        toggleElement.style.height = "25px";
        toggleElement.style.borderRadius = "50%";
        toggleElement.style.margin = "0 auto";
        toggleElement.style.border = "2px solid #4f526b";
        toggleElement.style.backgroundColor = status ? activity.color : "transparent";
        td.appendChild(toggleElement);
        td.style.textAlign = "center";
        td.style.padding = "10px";
        td.style.borderBottom = "1px solid #444";
        row.appendChild(td);
        
        // Add points if the activity was completed
        if (status) totalPoints += activity.points;
    });

    // Calculate percentage score for the current day
    const percentage = (totalPoints / maxDailyPoints) * 100;

    // Add rating cell with the correct image
    const ratingCell = document.createElement("td");
    const ratingImage = getRatingImage(percentage);
    ratingCell.appendChild(dv.el("span", ratingImage)); // Render image
    ratingCell.style.padding = "10px";
    ratingCell.style.borderBottom = "1px solid #444";
    row.appendChild(ratingCell);
    
    table.appendChild(row);
});

// Append the table to the container
tableContainer.appendChild(table);

// Render the table
dv.paragraph(tableContainer);

```
### <span style="color:rgb(26, 188, 156)">Health</span> ![[life.svg|28]]
#### <span style="color:rgb(26, 188, 156)">Sleep Schedule</span> ![[Moon-Stars.svg|24]]‎
```dataviewjs
// Access the current note's YAML frontmatter date
const yamlDate = dv.current().date;
// Check if the YAML date is valid, otherwise use today's date
const currentDate = yamlDate ? dv.date(yamlDate) : dv.date();

// Calculate the date range: past 7 days (including current date)
const startDate = currentDate.minus({ days: 6 });
const endDate = currentDate;

// Define the folder path
const folderPath = '"01-Daily Notes"';

// Function to convert time string (HH:MM) into 12-hour format
function convertTo12HourFormat(timeStr) {
    if (!timeStr || typeof timeStr !== 'string') return 'N/A';
    const [hourStr, minuteStr] = timeStr.split(':');
    let hour = parseInt(hourStr, 10);
    const minute = parseInt(minuteStr, 10);
    const period = hour >= 12 ? 'PM' : 'AM';
    hour = hour % 12 || 12; // Convert to 12-hour format
    return `${hour}:${minute.toString().padStart(2, '0')} ${period}`;
}

// Function to format date as a readable string
function formatDate(date) {
    return date.toFormat("MMM dd, yyyy");
}

// Retrieve pages from the specified date range
const pages = dv.pages(folderPath)
    .where(page => page.date && page.date >= startDate && page.date <= endDate)
    .sort(page => page.date);

// Debug logging
console.log('Pages found:', pages.length);
console.log('Date range:', formatDate(startDate), 'to', formatDate(endDate));

if (pages.length === 0) {
    dv.paragraph("No pages found for the specified date range.");
}

// Build an array of labels for each of the past 7 days
const daysLabels = [];
for (let i = 0; i < 7; i++) {
    daysLabels.push(startDate.plus({ days: i }).toFormat("EEE"));
}

// Initialize arrays for sleep data and tooltip info
const sleepHoursData = new Array(7).fill(null);
const sleepInfoForTooltips = new Array(7).fill(null).map(() => ({
    date: 'N/A',
    start: 'N/A',
    end: 'N/A',
    time: 'N/A'
}));

// Extract sleep data and map each page to its corresponding day in the 7-day range
pages.forEach(page => {
    if (page.date) {
        // Calculate the day index relative to startDate (0 = startDate, 6 = currentDate)
        const dayIndex = Math.floor(page.date.diff(startDate, 'days').days);
        if (dayIndex >= 0 && dayIndex < 7 && page.Sleep_Time) {
            const totalSleepHours = parseFloat(page.Sleep_Time);
            sleepHoursData[dayIndex] = totalSleepHours;
            sleepInfoForTooltips[dayIndex] = {
                date: formatDate(page.date),
                start: convertTo12HourFormat(page.Sleep_Start),
                end: convertTo12HourFormat(page.Sleep_End),
                time: page.Sleep_Time
            };
        }
    }
});

// Check if we have any data to display
if (sleepHoursData.every(d => d === null)) {
    dv.paragraph("No valid sleep data found for the specified date range.");
} else {
    // Chart data configuration
    const chartData = {
        type: 'line',
        data: {
            labels: daysLabels,
            datasets: [
                {
                    label: 'Sleep Time',
                    data: sleepHoursData,
                    borderColor: 'rgb(34, 190, 193)',
                    backgroundColor: 'rgba(34, 190, 193, 0.2)',
                    fill: false,
                    spanGaps: true // Connect lines across missing data points
                }
            ]
        },
        options: {
            responsive: true,
            scales: {
                x: { 
                    title: { display: true, text: 'Date' },
                    grid: {
                        display: true
                    }
                },
                y: { 
                    title: { display: true, text: 'Sleep Time (hours)' },
                    beginAtZero: true,
                    min: 0,
                    max: 16,
                    ticks: {
                        stepSize: 2,
                    }
                }
            },
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function(tooltipItem) {
                            const index = tooltipItem.dataIndex;
                            const info = sleepInfoForTooltips[index];
                            return [
                                `Date: ${info.date}`,
                                `Sleep Start: ${info.start}`,
                                `Sleep End: ${info.end}`,
                                `Sleep Time: ${info.time}`
                            ];
                        }
                    }
                }
            }
        }
    };

    // Try rendering the chart
    try {
        window.renderChart(chartData, this.container);
    } catch (error) {
        dv.paragraph(`Error rendering chart: ${error.message}`);
    }
}

```
#### <span style="color:rgb(26, 188, 156)">Moods</span> ![[mood-plus.svg|38]]
```dataviewjs
// Access the current note's YAML frontmatter date
const yamlDate = dv.current().date;
const currentDate = yamlDate ? dv.date(yamlDate) : dv.date();

// Calculate the date range: past 7 days (including current date)
const startDate = currentDate.minus({ days: 6 });
const endDate = currentDate;

// Define the folder path
const folderPath = '"01-Daily Notes"';

// Retrieve pages from the specified date range
const pages = dv.pages(folderPath)
    .where(page => page.date && page.date >= startDate && page.date <= endDate)
    .sort(page => page.date, 'asc');

// Define moods and their corresponding colors
const moods = [
    "Content", "Happy", "Excited", "Nostalgic", 
    "Downcast", "Somber", "Heartbroken", "Pensive", 
    "Irritated", "Frustrated", "Furious", 
    "Anxious", "Worried", "Dread", "Distracted",   
    "Jaded", "Resigned",
    "Apathetic", "Melancholic", "Despair", "Nihilistic"
];

const moodColors = {
    "Content": "rgb(144, 238, 144)",      // Light Green
    "Happy": "rgb(255, 223, 0)",          // Bright Gold
    "Excited": "rgb(255, 165, 0)",        // Bright Orange
    "Nostalgic": "rgb(186, 85, 211)",     // Medium Orchid
    "Downcast": "rgb(100, 149, 237)",     // Cornflower Blue
    "Somber": "rgb(70, 130, 180)",        // Steel Blue
    "Heartbroken": "rgb(30, 144, 255)",   // Dodger Blue
    "Pensive": "rgb(173, 216, 230)",      // Light Blue
    "Irritated": "rgb(255, 105, 180)",    // Hot Pink
    "Frustrated": "rgb(220, 20, 60)",     // Crimson Red
    "Furious": "rgb(230, 0, 73)",          // Bright Red
    "Anxious": "rgb(255, 228, 196)",      // Bisque
    "Worried": "rgb(255, 182, 193)",      // Light Pink
    "Dread": "rgb(139, 0, 0)",            // Dark Red
    "Distracted": "rgb(255, 248, 220)",   // Cream
    "Apathetic": "rgb(169, 169, 169)",    // Dark Gray
    "Melancholic": "rgb(119, 136, 153)",  // Light Slate Gray
    "Despair": "rgb(47, 79, 79)",         // Dark Slate Gray
    "Nihilistic": "rgb(121, 53, 176)",    // Dim Gray
    "Jaded": "rgb(112, 128, 144)",        // Slate Gray
    "Resigned": "rgb(200, 200, 200)"      // Silver
};

// Initialize mood counts
const moodCounts = {};
moods.forEach(m => moodCounts[m] = 0);

// Extract mood data from pages
pages.forEach(page => {
    if (page.Mood) {
        const pageMoods = page.Mood; // Assuming Mood is an array
        pageMoods.forEach(mood => {
            if (moods.includes(mood)) {
                moodCounts[mood]++;
            }
        });
    }
});

// Filter out moods with zero occurrences
const filteredMoods = moods.filter(m => moodCounts[m] > 0);

// Chart data configuration
const chartData = {
    type: 'bar',
    data: {
        labels: filteredMoods,
        datasets: [{
            label: 'Mood Occurrences',
            data: filteredMoods.map(m => moodCounts[m]),
            backgroundColor: filteredMoods.map(m => moodColors[m]),
            borderColor: 'rgba(0, 0, 0, 0.2)',
            borderWidth: 1
        }]
    },
    options: {
        responsive: true,
        scales: {
            y: {
                beginAtZero: true,
                title: {
                    display: true,
                    text: 'Number of Occurrences'
                },
                ticks: {
                    stepSize: 1,
                    precision: 0
                }
            },
            x: {
                title: {
                    display: true,
                    text: 'Moods'
                },
                ticks: {
                    autoSkip: false,
                    maxRotation: 0,
                    minRotation: 0,
                    callback: function(value) {
                        const label = this.getLabelForValue(value);
                        return wrapText(label, 15);  // Wrap text with max width of 15 characters
                    }
                }
            }
        },
        plugins: {
            title: {
                display: true,
                text: `Mood Frequency`
            },
            legend: {
                display: false
            },
            tooltip: {
                callbacks: {
                    title: function(context) {
                        return context[0].label;
                    },
                    label: function(context) {
                        return `Occurrences: ${context.raw}`;
                    }
                }
            }
        },
        afterFit: function(scale) {
            scale.height = 100;  // Adjust this value as needed
        }
    }
};

// Helper function for text wrapping
function wrapText(text, maxWidth) {
    const words = text.split(' ');
    const lines = [];
    let currentLine = '';

    words.forEach(word => {
        if (currentLine.length + word.length <= maxWidth) {
            currentLine += (currentLine ? ' ' : '') + word;
        } else {
            lines.push(currentLine);
            currentLine = word;
        }
    });
    lines.push(currentLine);

    return lines;
}

// Try rendering the chart
try {
    window.renderChart(chartData, this.container);
} catch (error) {
    dv.paragraph(`Error rendering mood chart: ${error.message}`);
}

```
#### <span style="color:rgb(26, 188, 156)">Shower Frequency</span> ![[Shower-03.svg|34]]‎
```dataviewjs
// Access the current note's YAML frontmatter date
const yamlDate = dv.current().date;
const currentDate = yamlDate ? dv.date(yamlDate) : dv.date();

// Calculate the date range: past 7 days (including current date)
const startDate = currentDate.minus({ days: 6 });
const endDate = currentDate;

// Define the folder path
const folderPath = '"01-Daily Notes"';

// Retrieve pages from the specified date range
const pages = dv.pages(folderPath)
    .where(page => page.date && page.date >= startDate && page.date <= endDate)
    .sort(page => page.date, 'asc');

// Define shower times and their corresponding colors
const showerTimes = [
    "Dawn", "Morning", "Noon", 
    "Afternoon", "Evening", 
    "Night", "Midnight"
];

const showerColors = {
    "Dawn": "rgb(171, 191, 226)",   // Light Blue
    "Morning": "rgb(74, 144, 226)",  // Sky Blue
    "Noon": "rgb(223, 196, 150)",    // Beige
    "Afternoon": "rgb(220, 133, 86)", // Orange
    "Evening": "rgb(220, 86, 86)",   // Red
    "Night": "rgb(164, 100, 206)",    // Purple
    "Midnight": "rgb(88, 86, 220)"   // Dark Blue
};

// Initialize shower time counts
const showerCounts = {};
showerTimes.forEach(t => showerCounts[t] = 0);

// Extract shower time data from pages
pages.forEach(page => {
    if (page.Shower_Time) {
        const pageShowers = page.Shower_Time; // No need to split since it's an array
        pageShowers.forEach(shower => {
            if (showerTimes.includes(shower)) {
                showerCounts[shower]++;
            }
        });
    }
});

// Filter out shower times with zero occurrences
const filteredShowerTimes = showerTimes.filter(t => showerCounts[t] > 0);

// Chart data configuration
const chartData = {
    type: 'bar',
    data: {
        labels: filteredShowerTimes,
        datasets: [{
            label: 'Shower Time Occurrences',
            data: filteredShowerTimes.map(t => showerCounts[t]),
            backgroundColor: filteredShowerTimes.map(t => showerColors[t]),
            borderColor: 'rgba(0, 0, 0, 0.2)',
            borderWidth: 1
        }]
    },
    options: {
        responsive: true,
        scales: {
            y: {
                beginAtZero: true,
                title: {
                    display: true,
                    text: 'Number of Occurrences'
                },
                ticks: {
                    stepSize: 1,
                    precision: 0
                }
            },
            x: {
                title: {
                    display: true,
                    text: 'Shower Times'
                },
                ticks: {
                    autoSkip: false,
                    maxRotation: 0,
                    minRotation: 0,
                    callback: function(value) {
                        const label = this.getLabelForValue(value);
                        return wrapText(label, 15);  // Wrap text with max width of 15 characters
                    }
                }
            }
        },
        plugins: {
            title: {
                display: true,
                text: `Shower Time Frequency`
            },
            legend: {
                display: false
            },
            tooltip: {
                callbacks: {
                    title: function(context) {
                        return context[0].label;
                    },
                    label: function(context) {
                        return `Occurrences: ${context.raw}`;
                    }
                }
            }
        },
        afterFit: function(scale) {
            scale.height = 100;  // Adjust this value as needed
        }
    }
};

// Helper function for text wrapping
function wrapText(text, maxWidth) {
    const words = text.split(' ');
    const lines = [];
    let currentLine = '';

    words.forEach(word => {
        if (currentLine.length + word.length <= maxWidth) {
            currentLine += (currentLine ? ' ' : '') + word;
        } else {
            lines.push(currentLine);
            currentLine = word;
        }
    });
    lines.push(currentLine);

    return lines;
}

// Try rendering the chart
try {
    window.renderChart(chartData, this.container);
} catch (error) {
    dv.paragraph(`Error rendering shower time chart: ${error.message}`);
}

```
## <span style="color:rgb(223, 196, 150)">Interactions</span> ![[Handshake.svg|35]]

```dataviewjs
// Access the current note's YAML frontmatter date
const yamlDate = dv.current().date;

// Check if the YAML date is valid, otherwise use today's date
const currentDate = yamlDate ? dv.date(yamlDate) : dv.date(new Date());
const sevenDaysAgo = currentDate.minus({ days: 7 });

// Define the folder path
const folderPath = '"01-Daily Notes"';

// Retrieve pages from the last 7 days
const pages = dv.pages(folderPath)
    .where(page => page.file.day && dv.date(page.file.day) >= sevenDaysAgo && dv.date(page.file.day) <= currentDate)
    .sort(page => page.file.day, 'desc');

// List of categories to check
const categories = [
    'Family', 'Relatives', 'Friends', 'Casual Acquaintances', 
    'Academic Contacts', 'Professional Contacts', 'Service Providers', 
    'Strangers'
];

// Function to extract category data from note content
function extractCategoryData(content, category) {
    if (typeof content !== 'string') {
        return [];
    }
    // Use regex to match the category and extract its content
    const regex = new RegExp(`<span style="color:rgb\\(223, 196, 150\\); font-weight: bold;">${category}::</span>(.+?)(?=<span|$)`, 'is');
    const match = content.match(regex);
    if (match && match[1]) {
        // Split the content and filter out invalid entries like "##"
        const entries = match[1].trim().split(/\s*\|\s*/).filter(entry => entry.trim() !== '' && !/^##$/.test(entry.trim()));
        return entries;
    }
    return [];
}

// Load content asynchronously
async function processPageContent(page) {
    try {
        const pageContent = await dv.io.load(page.file.path);
        return typeof pageContent === 'string' ? pageContent : '';
    } catch (error) {
        return '';
    }
}

// Iterate through each category and display its entries
categories.forEach(async (category) => {
    const entryDetails = [];
    
    // Collect and process entries for the current category
    for (const page of pages) {
        const pageContent = await processPageContent(page);
        if (pageContent) {
            const entries = extractCategoryData(pageContent, category);
            entries.forEach(entry => {
                const mainEntry = entry.trim();
                if (mainEntry !== '') {
                    entryDetails.push(mainEntry);
                }
            });
        }
    }
    
    // Debugging output
    console.log(`Category: ${category}, Entries: ${entryDetails.length}`);
    console.log(entryDetails);
    
    // Only display categories with non-empty entries
    if (entryDetails.length > 0) {
        dv.paragraph(`<span style="color:rgb(223, 196, 150); font-weight: bold;">${category}::</span>`);
        entryDetails.forEach(detail => {
            if (detail.trim() !== '') {
                dv.paragraph(`- ${detail.replace(/\[\[([^\]]+)\]\]/g, '[[$1]]').replace(/^([^:]+):/, '**$1**:')}`);
            }
        });
    }
});

```


## <span style="color:rgb(171, 191, 226)">Insights</span> ![[lightbulb.svg|30]]

```dataviewjs
// Function to parse YAML date string
const parseDate = (dateString) => {
    const [year, month, day] = dateString.split('-').map(Number);
    return dv.date(`${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`);
};

// Get the current note's date from YAML frontmatter
const currentDate = parseDate(dv.current().file.frontmatter.Date);

// Calculate the start date (7 days before the current note's date)
const startDate = currentDate.minus({days: 7});

// Get all notes within the 7-day range
const recentNotes = dv.pages()
    .where(p => p.file.frontmatter.Date && 
               parseDate(p.file.frontmatter.Date) >= startDate && 
               parseDate(p.file.frontmatter.Date) <= currentDate);

// Extract Principles content from each note
const principlesContent = recentNotes
    .map(page => ({
        filename: page.file.name,
        path: page.file.path,
        principles: page.file.frontmatter.Principles
    }))
    .filter(item => item.principles)
    .sort((a, b) => b.path.localeCompare(a.path));

// Create the cell content with custom formatting for links and a line break
const cellContent = principlesContent.length > 0 
    ? principlesContent.map(item => 
        `* **[[${item.filename}]]**\n\n${item.principles.split('\n\n').map(line => `    ${line}`).join('\n\n')}`
      ).join('\n\n')
    : "    No principles Discovered.";

// Render using markdown
dv.paragraph(cellContent);
```

## <span style="color:rgb(220, 133, 86)">Milestones</span> ![[milestone.svg|30]]

```dataviewjs
const { update } = this.app.plugins.plugins["metaedit"].api;

// Access the current YAML frontmatter date
const yamlDate = dv.current().Date;

// Get today's date
const currentDate = yamlDate ? dv.date(yamlDate) : new Date();

// Define the start date (7 days ago)
const sevenDaysAgo = dv.date(currentDate).minus({ days: 7 });

// Define the folder path
const folderPath = '"01-Daily Notes"';

// Retrieve pages from the specified date range
const pages = dv.pages(folderPath)
    .where(page => page.Date && page.Date >= sevenDaysAgo && page.Date <= currentDate)
    .sort(page => page.Date, 'asc');

// Map to store tasks by category
const categoryTasks = new Map();

// Function to extract completed tasks by category
function extractCategoryTasks(page) {
    const tasks = page.file.tasks || [];

    for (const task of tasks) {
        // Only process completed tasks
        if (!task.completed) continue;

        const match = task.text.match(/\(([\w\s]+)::\)/);  // Match the category in parentheses
        if (match) {
            const category = match[1];
            if (!categoryTasks.has(category)) {
                categoryTasks.set(category, new Map());
            }

            const taskText = task.text.trim();
            const dateMatch = taskText.match(/\[\[(.*?)\]\]/);  // Check if the task has a completion date
            let taskDate = dateMatch ? dv.date(dateMatch[1]) : null;

            // If the task has a date, check if it's within the last 7 days
            if (taskDate) {
                if (taskDate >= sevenDaysAgo) {
                    categoryTasks.get(category).set(taskText, {
                        taskObject: task,
                        filePath: page.file.path,
                        noteTitle: page.file.name
                    });
                }
            } else {
                // If the task has no date, check the note's Date
                let noteDate = dv.date(page.Date);
                if (noteDate >= sevenDaysAgo) {
                    categoryTasks.get(category).set(taskText, {
                        taskObject: task,
                        filePath: page.file.path,
                        noteTitle: page.file.name
                    });
                }
            }
        }
    }
}

// Extract tasks from each page
pages.forEach(page => extractCategoryTasks(page));

// Function to render all completed tasks
function renderTasks() {
    if (categoryTasks.size === 0) {
        dv.paragraph('<span style="color:rgb(220, 133, 86); font-weight: bold;">-- No Milestones Reached --</span>');
    } else {
        for (const [category, tasks] of categoryTasks.entries()) {
            if (tasks.size > 0) {
                // Display the category header
                dv.paragraph(`<span style="color:rgb(220, 133, 86); font-weight: bold;">${category}</span>`);
                
                // Display each completed task
                for (const [taskText, { taskObject, filePath, noteTitle }] of tasks.entries()) {
                    dv.paragraph(`   - [x] ${taskText}`);
                }
            }
        }
    }
}

// Initial render
renderTasks();

```

## <span style="color:rgb(88, 86, 220)">Targets </span> ![[crosshair.svg|24]]

```dataviewjs
// Access the current YAML frontmatter date
const yamlDate = dv.current().Date;

// Get today's date
const currentDate = yamlDate ? dv.date(yamlDate) : new Date();

// Define the start date (2024-10-05)
const startDate = dv.date("2025-01-01");

// Define the folder path
const folderPath = '"01-Daily Notes"';

// Retrieve pages from the specified date range
const pages = dv.pages(folderPath)
    .where(page => page.Date && page.Date >= startDate && page.Date <= currentDate)
    .sort(page => page.Date, 'asc');

// Map to store tasks by category
const categoryTasks = new Map();

// Function to extract incomplete tasks by category
function extractCategoryTasks(page) {
    const tasks = page.file.tasks || [];

    for (const task of tasks) {
        // Only process incomplete tasks
        if (task.completed) continue;

        const match = task.text.match(/\(([\w\s]+)::\)/);  // Match the category in parentheses
        if (match) {
            const category = match[1];
            if (!categoryTasks.has(category)) {
                categoryTasks.set(category, new Map());
            }

            const taskText = task.text.trim();
            
            // Add task to the category
            categoryTasks.get(category).set(taskText, {
                taskObject: task,
                filePath: page.file.path,
                noteTitle: page.file.name
            });
        }
    }
}

// Extract tasks from each page
pages.forEach(page => extractCategoryTasks(page));

// Function to render all incomplete tasks
function renderTasks() {
    if (categoryTasks.size === 0) {
        dv.paragraph('<span style="color:rgb(88, 86, 220); font-weight: bold;">-- No Targets Found --</span>');
    } else {
        for (const [category, tasks] of categoryTasks.entries()) {
            if (tasks.size > 0) {
                // Display the category header
                dv.paragraph(`<span style="color:rgb(88, 86, 220); font-weight: bold;">${category}</span>`);
                
                // Display each incomplete task
                for (const [taskText, { taskObject, filePath, noteTitle }] of tasks.entries()) {
                    dv.paragraph(`   - [ ] ${taskText}`);
                }
            }
        }
    }
}

// Initial render
renderTasks();

```
