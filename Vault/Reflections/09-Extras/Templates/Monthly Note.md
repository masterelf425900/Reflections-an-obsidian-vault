---
Date: <%* tR += moment().endOf("month").format("YYYY-MM-DD") %>
creation date: <% tp.file.creation_date("YYYY MMM Do ddd LT") %>
modification date: <% tp.file.last_modified_date("YYYY MMM Do ddd LT") %>
obsidianUIMode: 
cssclasses:
  - table-box
  - task-color
Reflections: ""
Patterns_and_Trends: 
Future_Considerations:
---

<%*
// Use current date directly instead of reading from frontmatter
const parsedDate = moment(tp.date.now("YYYY-MM-DD"));

const year = parsedDate.format("YYYY");
const month = parsedDate.format("MM");
// Calculate the number of days in the specified month
const daysInMonth = parsedDate.daysInMonth();
let fridays = [];
// Generate Fridays for the month
for (let day = 1; day <= daysInMonth; day++) {
    let date = moment(`${year}-${month}-${String(day).padStart(2, '0')}`, "YYYY-MM-DD");
    if (date.day() === 6) { // 5 corresponds to Friday
        fridays.push(`[[${date.format("YYYY MMM Do ([W]ww)")}|${date.format("[W]ww")}]]`);
    }
}
// Calculate the last days of the previous and next months
const previousMonthEnd = parsedDate.clone().subtract(1, 'month').endOf('month');
const nextMonthEnd = parsedDate.clone().add(1, 'month').endOf('month');
// Generate links for the last days of previous and next months
const previousMonthLink = `[[${previousMonthEnd.format("YYYY MMM")}|Last Monthly]]`;
const nextMonthLink = `[[${nextMonthEnd.format("YYYY MMM")}|Next Monthly]]`;
// Generate links for the current quarter and year
const quarterLink = `[[${year} [Q]${Math.ceil(parseInt(month) / 3)}|Quarterly]]`;
const yearlyLink = `[[${year}|Yearly]]`;
// Combine all outputs into a single line
tR += `<< ${fridays.join(" | ")} >> | << ${previousMonthLink} | ${nextMonthLink} >>`;
%> `BUTTON[Refresh]`

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

// Calculate the start and end of the current month
const startDate = currentDate.startOf('month');
const endDate = currentDate.endOf('month');

// Get all notes within the 7-day range
const recentNotes = dv.pages()
    .where(p => p.file.frontmatter.Date && 
               parseDate(p.file.frontmatter.Date) >= startDate && 
               parseDate(p.file.frontmatter.Date) <= currentDate)
    .sort(p => parseDate(p.file.frontmatter.Date), 'asc'); // Sorting from earliest to latest

// Extract and flatten Key_Takeouts with note references
const keyTakeouts = recentNotes
    .flatMap(page => 
        (page.file.frontmatter.Key_Takeouts || []).map(takeout => ({
            text: takeout.replace(/^[-•]\s*/, ''),  // Remove any leading bullet symbols
            noteTitle: page.file.name // Store the note title for linking
        }))
    )
    .filter(takeout => takeout.text.trim() !== '');

// Render the results properly in Obsidian
if (keyTakeouts.length > 0) {
    dv.list(keyTakeouts.map(({ text, noteTitle }) => `${text} [[${noteTitle}|🔗]]`));
} else {
    dv.paragraph("No key takeouts found in the last 7 days.");
}

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
                    note_date: moment(page.file.frontmatter.Date),
                    note_title: page.file.name // Store the note title for linking
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

// Calculate the start and end of the current month
const startOfMonth = currentNoteDate.clone().startOf('month');
const endOfMonth = currentNoteDate.clone().endOf('month');

// Extract all reminders from notes in the "01-Daily Notes" folder
let allReminders = allNotes.flatMap(page => {
    if (page.file.path.startsWith("01-Daily Notes/")) {
        const extractedReminders = extractReminders(page);
        return extractedReminders;
    }
    return [];
});

// Process reminders based on the new conditions
let processedReminders = allReminders.map(reminder => {
    const reminderDate = reminder.reminder_date.startOf('day');
    const noteDate = reminder.note_date.startOf('day');

    // Check if the note that created this reminder is from the future compared to current note
    if (noteDate.isAfter(currentNoteDate)) {
        // Skip reminders from future notes
        return { ...reminder, display: false };
    }

    let symbol;
    let display = false;

    // Case 1: Always display future reminders (e.g., reminders from February with a reminder date in May)
    if (reminderDate.isAfter(currentNoteDate)) {
        symbol = '![[circle-ellipsis.svg|25]]';
        display = true;
    }
    // Case 2: Include checked reminders (past reminders) only if reminder was created within the current month
    else if (reminderDate.isBefore(currentNoteDate)) {
        symbol = '![[Check.svg|25]]';
        display = reminderDate.isSameOrBefore(endOfMonth);  // Only display if the reminder is in the current month or earlier
    }
    // Case 3: Today's reminder
    else { // reminderDate is same as currentNoteDate
        symbol = '![[circle-alert.svg|25]]';
        display = true; // Always display today's reminders
    }

    return { ...reminder, symbol, display };
}).filter(reminder => reminder.display);

// Filter for reminders that are within the current month or later
processedReminders = processedReminders
    .filter(reminder => reminder.reminder_date.isSameOrAfter(startOfMonth)) // Show reminders from the start of the month or later
    .sort((a, b) => a.reminder_date.diff(b.reminder_date)); // Sort by reminder date

// Check if there are any eligible reminders
if (processedReminders.length === 0) {
    dv.paragraph("No eligible reminders found for the current month.");
} else {
    // Loop through the reminders and create styled output
    for (let reminder of processedReminders) {
        let reminderDate = reminder.reminder_date.format('YYYY-MM-DD');
        dv.paragraph(`<span style="color:rgb(91, 97, 117); font-weight: bold; margin-left: 13px;">•</span> <span style="display: inline-flex; align-items: center;">
          <input type="text" value="${reminder.reminder_text}" style="background: transparent; border: 1px solid #282e42; border-radius: 4px; color: inherit; font-weight: 15px; margin-left: 0px; width: 207px;">
          <span style="margin-left: 15px;"></span>
          <input type="date" value="${reminderDate}" style="background: #272935; border: 1px solid #282e42; color: #4a90e2; font-size: 13; border-radius: 4px; align-items: center; font-weight: 10px; width: 117px; margin-left: 10px;">
          <span style="margin-left: 10px;">${reminder.symbol}</span>
          <span style="white-space: nowrap;">[[${reminder.note_title}|🔗]]</span>
        </span>`);
    }
}
```

## <span style="color:rgb(220, 86, 151)">Entertainment</span> ![[Mask.svg|30]]
‎ 
#### <span style="color:rgb(220, 86, 151)">Media</span> ![[tv.svg|24]]

```dataviewjs
const chartSize = { width: 800, height: 800 }; // Adjust width and height

// Access the current note's YAML frontmatter date
const yamlDate = dv.current().date;
const currentDate = yamlDate ? dv.date(yamlDate) : dv.date();

// Calculate the start and end of the current month
const startOfMonth = currentDate.startOf('month');
const endOfMonth = currentDate.endOf('month');

// Define the folder path
const folderPath = '"01-Daily Notes"';

// Retrieve pages from the start to the end of the current month
const pages = dv.pages(folderPath)
    .where(page => page.date && page.date >= startOfMonth && page.date <= endOfMonth)
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
            backgroundColor: [
                'rgba(255, 99, 132, 0.2)', 
                'rgba(54, 162, 235, 0.2)', 
                'rgba(255, 206, 86, 0.2)', 
                'rgba(75, 192, 192, 0.2)', 
                'rgba(153, 102, 255, 0.2)'
            ],
            borderColor: [
                'rgba(255, 99, 132, 1)', 
                'rgba(54, 162, 235, 1)', 
                'rgba(255, 206, 86, 1)', 
                'rgba(75, 192, 192, 1)', 
                'rgba(153, 102, 255, 1)'
            ],
            borderWidth: 1
        }]
    },
    options: {
        responsive: true,
        maintainAspectRatio: false,
        width: chartSize.width,
        height: chartSize.height,
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

// Calculate the start and end of the current month
const startOfMonth = currentDate.startOf('month');
const endOfMonth = currentDate.endOf('month');

// Define the folder path
const folderPath = '"01-Daily Notes"';

// Retrieve pages from the start of the month to the end
const pages = dv.pages(folderPath)
    .where(page => page.Date && page.Date >= startOfMonth && page.Date <= endOfMonth)
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
const startDate = currentDate.startOf('month');
const endDate = currentDate.endOf('month');

// Get all notes within the 7-day range
const recentNotes = dv.pages('"01-Daily Notes"')
    .where(p => p.file.frontmatter.Date && 
               parseDate(p.file.frontmatter.Date) >= startDate && 
               parseDate(p.file.frontmatter.Date) <= currentDate);

// Extract and flatten Content_Highlights
const contentHighlights = recentNotes
    .flatMap(page => page.file.frontmatter.Content_Highlight || [])
    .filter(highlight => highlight);

// Function to convert text with URLs to clickable markdown links
function convertToLink(text) {
    const urlRegex = /(\[([^\]]+)\]\((https?:\/\/[^\s]+)\))/g;
    return text.replace(urlRegex, (match, p1, p2, p3) => {
        // Returns markdown link
        return `[${p2}](${p3})`;
    });
}

// Build an array of markdown strings for each content highlight
const listItems = contentHighlights.map(highlight => {
    const formattedHighlight = convertToLink(highlight.replace(/^[-•]\s*/, ''));
    const noteTitle = recentNotes.find(page => 
        page.file.frontmatter.Content_Highlight && 
        page.file.frontmatter.Content_Highlight.includes(highlight)
    )?.file.name;
    
    // Use native markdown wikilink syntax so ctrl+click works
    const link = noteTitle ? `[[${noteTitle}|🔗]]` : '';
    return `${formattedHighlight} ${link}`.trim();
});

// Render the list using dv.list, ensuring Obsidian processes wikilinks
if (listItems.length > 0) {
    dv.list(listItems);
} else {
    dv.paragraph("No content highlights found in the last 7 days.");
}

```

## <span style="color:rgb(26, 188, 156)">Lifestyles</span> ![[Growing.svg|30]]
‎ 
### <span style="color:rgb(26, 188, 156)">Habits</span> ![[sun.svg|26]]

###### <span style="color:rgb(26, 188, 156)">Weekly Habit</span> ![[haze-moon.svg|34]]

```dataviewjs
// Parse the current note's date from YAML
const currentDate = dv.date(dv.current().Date);

// Calculate the start and end of the current month
const startDate = currentDate.startOf('month');
const endDate = currentDate.endOf('month');

// Define the activities and their corresponding YAML toggle fields
const activities = [
    { name: "Big Laundry", toggle: "Laundry_status", points: 3, color: "#abbfe2" },
    { name: "Home Cleaning", toggle: "Cleaning_status", points: 5, color: "#4a90cc" },
    { name: "Gardening", toggle: "Gardening_status", points: 2, color: "#5edb7c" },
    { name: "Car Maintenance", toggle: "Car_status", points: 5, color: "#fe3d7e" },
    { name: "Finance Budgeting", toggle: "Finance_status", points: 5, color: "#dfc496" }
];


// Calculate the total possible points for one day
const maxDailyPoints = activities.reduce((total, activity) => total + activity.points, 0);

// Total possible points for the month
const maxMonthlyPoints = maxDailyPoints * currentDate.daysInMonth;

// Get the pages for the current month
const pages = dv.pages('"02-Weekly Notes"')
    .where(p => {
        const pageDate = dv.date(p.Date);
        return pageDate >= startDate && pageDate <= endDate;
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


```dataviewjs
const chartSize = { width: 800, height: 800 }; // Adjust width and height

// Get current date from YAML frontmatter
const yamlDate = dv.current().date;
const currentDate = yamlDate ? dv.date(yamlDate) : dv.date();

// Calculate month range
const startOfMonth = currentDate.startOf('month');
const endOfMonth = currentDate.endOf('month');

// Define activities and their points
const activities = [
    { name: "Big Laundry", toggle: "Laundry_status", points: 3 },
    { name: "Home Cleaning", toggle: "Cleaning_status", points: 5 },
    { name: "Gardening", toggle: "Gardening_status", points: 2 },
    { name: "Car Maintenance", toggle: "Car_status", points: 5 },
    { name: "Finance Budgeting", toggle: "Finance_status", points: 5 }
];

// Calculate max daily points
const maxDailyPoints = activities.reduce((total, activity) => total + activity.points, 0);

// Get pages from the daily notes folder
const pages = dv.pages('"02-Weekly Notes"')
    .where(page => page.date && page.date >= startOfMonth && page.date <= endOfMonth)
    .sort(page => page.date);

// Initialize rating counts (ordered from weakest to mightiest)
const ratingCounts = {
    'Weak': 0,
    'Fair': 0,
    'Strong': 0,
    'Mighty': 0
};

// Calculate ratings for each day
pages.forEach(page => {
    let dailyPoints = 0;
    
    // Calculate points for each activity
    activities.forEach(activity => {
        if (page[activity.toggle]) {
            dailyPoints += activity.points;
        }
    });

    // Calculate percentage score
    const percentage = (dailyPoints / maxDailyPoints) * 100;
    
    // Use thresholds: <50% = Weak, <75% = Fair, <100% = Strong, exactly 100% = Mighty
    if (percentage < 50) {
        ratingCounts.Weak++;
    } else if (percentage < 75) {
        ratingCounts.Fair++;
    } else if (percentage < 100) {
        ratingCounts.Strong++;
    } else if (percentage === 100) {
        ratingCounts.Mighty++;
    }
});

// Generate chart data with matching colors in order
const chartData = {
    type: 'pie',
    data: {
        labels: Object.keys(ratingCounts),
        datasets: [{
            label: 'Rating Distribution',
            data: Object.values(ratingCounts),
            backgroundColor: [
                'rgba(128, 176, 106, 0.2)', // Light teal for Weak
                'rgba(74, 161, 206, 0.2)',  // Light yellow for Fair
                'rgba(158, 0, 180, 0.2)',   // Light blue for Strong
                'rgba(252, 67, 10, 0.2)'    // Light red for Mighty
            ],
            borderColor: [
                'rgba(128, 176, 106, 1)',   // Green for Weak
                'rgba(74, 161, 206, 1)',    // Teal for Fair
                'rgba(158, 0, 180, 1)',     // Purple for Strong
                'rgba(252, 67, 10, 1)'      // Orange for Mighty
            ],
            borderWidth: 1
        }]
    },
    options: {
        responsive: true,
        maintainAspectRatio: false, // Allows resizing
        width: chartSize.width,
        height: chartSize.height,
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
                        const rating = tooltipItem.label;
                        const count = tooltipItem.raw;
                        const dayPercentage = ((count / pages.length) * 100).toFixed(1);
                        return `${rating}: ${count} days (${dayPercentage}%)`;
                    }
                }
            }
        }
    }
};

// Render the chart
try {
    window.renderChart(chartData, this.container);
} catch (error) {
    dv.paragraph(`Error rendering chart: ${error.message}`);
}

```

###### <span style="color:rgb(26, 188, 156)">Daily Habit</span> ![[sunset-2.svg|34]]

```dataviewjs
// Parse the current note's date from YAML
const currentDate = dv.date(dv.current().Date);

// Calculate the start and end of the current month
const startDate = currentDate.startOf('month');
const endDate = currentDate.endOf('month');

// Define the activities and their corresponding YAML toggle fields
const activities = [
    { name: "Exercise", toggle: "Exercise_Status", color: "#FFD700", points: 3, color: "#abbfe2" },
    { name: "Meal", toggle: "Meal_Status", color: "#FF6347", points: 3, color: "#dfc496" },
    { name: "Shower", toggle: "Shower_Status", color: "#87CEEB", points: 2, color: "#4a90cc" },
    { name: "Entertainment", toggle: "Entertainment_Status", color: "#9370DB", points: 2, color: "#dc5697" },
    { name: "Productive", toggle: "Productive_Work", color: "#4682B4", points: 5, color: "#1abc9c" },
    { name: "Academic", toggle: "Academics_Studied", color: "#00FFFF", points: 5, color: "#5856dc" }
];

// Calculate the total possible points for one day
const maxDailyPoints = activities.reduce((total, activity) => total + activity.points, 0);

// Total possible points for the month
const maxMonthlyPoints = maxDailyPoints * currentDate.daysInMonth;

// Get the pages for the current month
const pages = dv.pages('"01-Daily Notes"')
    .where(p => {
        const pageDate = dv.date(p.Date);
        return pageDate >= startDate && pageDate <= endDate;
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

```dataviewjs
const chartSize = { width: 800, height: 800 }; // Adjust width and height
// Get current date from YAML frontmatter
const yamlDate = dv.current().date;
const currentDate = yamlDate ? dv.date(yamlDate) : dv.date();

// Calculate month range
const startOfMonth = currentDate.startOf('month');
const endOfMonth = currentDate.endOf('month');

// Define activities and their points
const activities = [
    { name: "Exercise", toggle: "Exercise_Status", color: "#FFD700", points: 3 },
    { name: "Meal", toggle: "Meal_Status", color: "#FF6347", points: 3 },
    { name: "Shower", toggle: "Shower_Status", color: "#87CEEB", points: 2 },
    { name: "Entertainment", toggle: "Entertainment_Status", color: "#9370DB", points: 2 },
    { name: "Productive", toggle: "Productive_Work", color: "#4682B4", points: 5 },
    { name: "Academic", toggle: "Academics_Studied", color: "#00FFFF", points: 5 }
];

// Calculate max daily points
const maxDailyPoints = activities.reduce((total, activity) => total + activity.points, 0);

// Get pages from the daily notes folder
const pages = dv.pages('"01-Daily Notes"')
    .where(page => page.date && page.date >= startOfMonth && page.date <= endOfMonth)
    .sort(page => page.date);

// Initialize rating counts
const ratingCounts = {
    'Mighty': 0,
    'Strong': 0,
    'Fair': 0,
    'Weak': 0
};

// Calculate ratings for each day
pages.forEach(page => {
    let dailyPoints = 0;
    
    // Calculate points for each activity
    activities.forEach(activity => {
        if (page[activity.toggle]) {
            dailyPoints += activity.points;
        }
    });

    // Calculate percentage and assign rating
    const percentage = (dailyPoints / maxDailyPoints) * 100;
    
    if (percentage < 50) {
        ratingCounts.Weak++;
    } else if (percentage < 75) {
        ratingCounts.Fair++;
    } else if (percentage < 100) {
        ratingCounts.Strong++;
    } else {
        ratingCounts.Mighty++;
    }
});

// Generate chart data
const chartData = {
    type: 'pie',
    data: {
        labels: Object.keys(ratingCounts),
        datasets: [{
            label: 'Rating Distribution',
            data: Object.values(ratingCounts),
            backgroundColor: [
                'rgba(252, 67, 10, 0.2)',   // Light red for Mighty
                'rgba(158, 0, 180, 0.2)',   // Light blue for Strong
                'rgba(74, 161, 206, 0.2)',   // Light yellow for Fair
                'rgba(128, 176, 106, 0.2)'    // Light teal for Weak
            ],
            borderColor: [
                'rgba(252, 67, 10, 1)',     // Orange for Mighty
                'rgba(158, 0, 180, 1)',     // Purple for Strong
                'rgba(74, 161, 206, 1)',     // Teal for Fair
                'rgba(128, 176, 106, 1)'      // Green for Weak
            ],
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
                        const rating = tooltipItem.label;
                        const count = tooltipItem.raw;
                        const percentage = ((count / pages.length) * 100).toFixed(1);
                        return `${rating}: ${count} days (${percentage}%)`;
                    }
                }
            }
        }
    }
};

// Render the chart
try {
    window.renderChart(chartData, this.container);
} catch (error) {
    dv.paragraph(`Error rendering chart: ${error.message}`);
}
```

### <span style="color:rgb(26, 188, 156)">Health</span> ![[life.svg|28]]

#### <span style="color:rgb(26, 188, 156)">Sleep Schedule</span> ![[Moon-Stars.svg|24]]
‎ 
```dataviewjs
// Access the current note's YAML frontmatter date
const yamlDate = dv.current().date;
// Check if the YAML date is valid, otherwise use today's date
const currentDate = yamlDate ? dv.date(yamlDate) : dv.date();

// Function to calculate the start and end of the month
function calculateMonthRange(date) {
    const startOfMonth = date.startOf('month');
    const endOfMonth = date.endOf('month');
    return { startOfMonth, endOfMonth };
}

const { startOfMonth, endOfMonth } = calculateMonthRange(currentDate);

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
    .where(page => page.date && page.date >= startOfMonth && page.date <= endOfMonth)
    .sort(page => page.date);

if (pages.length === 0) {
    dv.paragraph("No pages found for the specified month.");
}

// Generate array of all days in the month
const daysInMonth = endOfMonth.day; // Gets the last day of the month
const daysArray = Array.from({ length: daysInMonth }, (_, i) => (i + 1).toString());
const sleepHoursData = new Array(daysInMonth).fill(null);
const sleepInfoForTooltips = new Array(daysInMonth).fill(null).map(() => ({
    date: 'N/A',
    start: 'N/A',
    end: 'N/A',
    time: 'N/A'
}));

// Extract sleep data and map to correct day positions
pages.forEach(page => {
    if (page.date) {
        const dayIndex = page.date.day - 1; // Arrays are 0-based, days are 1-based
        
        if (page.Sleep_Time) {
            sleepHoursData[dayIndex] = parseFloat(page.Sleep_Time);
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
    dv.paragraph("No valid sleep data found for the specified month.");
} else {
    // Chart data configuration
    const chartData = {
        type: 'line',
        data: {
            labels: daysArray,
            datasets: [
                {
                    label: 'Sleep Time',
                    data: sleepHoursData,
                    borderColor: 'rgb(34, 190, 193)',
                    backgroundColor: 'rgba(34, 190, 193, 0.2)',
                    fill: false,
                    spanGaps: true 
                }
            ]
        },
        options: {
            responsive: true,
            scales: {
                x: { 
                    title: { display: true, text: 'Day of Month' },
                    grid: {
                        display: true
                    }
                },
                y: { 
                    title: { display: true, text: 'Time (hours)' },
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
                                `Start: ${info.start}`,
                                `End: ${info.end}`,
                                `Time: ${info.time}`
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
‎ 
#### <span style="color:rgb(26, 188, 156)">Moods</span> ![[mood-plus.svg|38]]
‎ 
```dataviewjs
// Access the current note's YAML frontmatter date
const yamlDate = dv.current().date;
const currentDate = yamlDate ? dv.date(yamlDate) : dv.date();

// Function to calculate the start and end of the month
function calculateMonthRange(date) {
    const startOfMonth = date.startOf('month');
    const endOfMonth = date.endOf('month');
    return { startOfMonth, endOfMonth };
}

const { startOfMonth, endOfMonth } = calculateMonthRange(currentDate);

// Define the folder path
const folderPath = '"01-Daily Notes"';

// Retrieve pages from the specified date range
const pages = dv.pages(folderPath)
    .where(page => page.date && page.date >= startOfMonth && page.date <= endOfMonth)
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
    "Nihilistic": "rgb(121, 53, 176)",   // Dim Gray
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
                text: `Mood Frequency for ${startOfMonth.toFormat('MMMM yyyy')}` // Added month and year to title
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
                        const mood = context.label;
                        const count = context.raw;
                        const percentage = ((count / pages.length) * 100).toFixed(1);
                        return [
                            `Occurrences: ${count}`,
                            `Percentage of Days: ${percentage}%`
                        ];
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
‎ 
#### <span style="color:rgb(26, 188, 156)">Shower Frequency</span> ![[Shower-03.svg|34]]
‎ 
```dataviewjs
// Access the current note's YAML frontmatter date
const yamlDate = dv.current().date;
const currentDate = yamlDate ? dv.date(yamlDate) : dv.date();

// Function to calculate the start and end of the month
function calculateMonthRange(date) {
    const startOfMonth = date.startOf('month');
    const endOfMonth = date.endOf('month');
    return { startOfMonth, endOfMonth };
}

const { startOfMonth, endOfMonth } = calculateMonthRange(currentDate);

// Define the folder path
const folderPath = '"01-Daily Notes"';

// Retrieve pages from the specified date range
const pages = dv.pages(folderPath)
    .where(page => page.date && page.date >= startOfMonth && page.date <= endOfMonth)
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
                text: `Shower Time Frequency for ${startOfMonth.toFormat('MMMM yyyy')}` // Added month and year to title
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
                        const time = context.label;
                        const count = context.raw;
                        const percentage = ((count / pages.length) * 100).toFixed(1);
                        return [
                            `Occurrences: ${count}`,
                            `Percentage of Days: ${percentage}%`
                        ];
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
‎ 

## <span style="color:rgb(223, 196, 150)">Interactions</span> ![[Handshake.svg|35]]

```dataviewjs
// Access the current note's YAML frontmatter date
const yamlDate = dv.current().date;

// Check if the YAML date is valid, otherwise use today's date
const currentDate = yamlDate ? dv.date(yamlDate) : dv.date(new Date());
const startOfMonth = currentDate.startOf('month');
const endOfMonth = currentDate.endOf('month');

// Define the folder path
const folderPath = '"01-Daily Notes"';

// Retrieve pages from the current month
const pages = dv.pages(folderPath)
    .where(page => page.file.day && dv.date(page.file.day) >= startOfMonth && dv.date(page.file.day) <= endOfMonth)
    .sort(page => page.file.day, 'asc');  // Sorting from earliest to latest

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
                // Normalize any newlines in the entry so it stays on one line
                const singleLineEntry = entry.replace(/\r?\n/g, ' ').trim();
                if (singleLineEntry !== '') {
                    entryDetails.push({ detail: singleLineEntry, note: page.file.name });
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
        entryDetails.forEach(entryObj => {
            if (entryObj.detail.trim() !== '') {
                // Format the entry and add the clickable wikilink.
                const formattedEntry = entryObj.detail
                    .replace(/\[\[([^\]]+)\]\]/g, '[[$1]]')
                    .replace(/^([^:]+):/, '**$1**:');
                dv.paragraph(`- ${formattedEntry} [[${entryObj.note}|🔗]]`);
            }
        });
    }
});

```


## <span style="color:rgb(171, 191, 226)">Insights</span> ![[lightbulb.svg|30]]

```dataviewjs
// 1) Parse date from YYYY-MM-DD frontmatter
function parseDate(dateString) {
    const [year, month, day] = dateString.split('-').map(Number);
    return dv.date(`${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`);
}

// 2) Get the current note's date from YAML frontmatter
const currentDate = parseDate(dv.current().file.frontmatter.Date);

// 3) Calculate the start and end of the current month
const startDate = currentDate.startOf('month');
const endDate = currentDate.endOf('month');

// 4) Find all notes whose date is within this month, sorted ascending by date
const monthlyNotes = dv.pages()
    .where(p => p.file.frontmatter.Date 
             && parseDate(p.file.frontmatter.Date) >= startDate 
             && parseDate(p.file.frontmatter.Date) <= endDate)
    .sort(p => parseDate(p.file.frontmatter.Date), 'asc');

// 5) Filter for notes that actually have 'Principles' defined, then store date/title/principles
const notesWithPrinciples = monthlyNotes
    .filter(page => page.file.frontmatter.Principles)
    .map(page => ({
        // We still parse the date if needed, but we won't display it
        date: parseDate(page.file.frontmatter.Date),
        filename: page.file.name,
        principles: page.file.frontmatter.Principles
    }));

// 6) Render each note’s principles in a cleaner format
if (notesWithPrinciples.length === 0) {
    dv.paragraph("No principles discovered this month.");
} else {
    // For each note, we display:
    //    A heading with a dash + note link
    //    Bullet points for each principle line
    notesWithPrinciples.forEach(item => {
        // Removed the date, but kept an em dash + note link
        dv.header(3, `— [[${item.filename}]]`);
        
        // Split 'Principles' on new lines and filter out any empty lines
        const lines = item.principles.split(/\r?\n+/).filter(line => line.trim() !== '');
        
        // Render each principle as a bullet
        lines.forEach(line => {
            dv.paragraph(`- ${line.trim()}`);
        });
        
        // Optional extra spacing
        dv.paragraph("");
    });
}

```


## <span style="color:rgb(220, 133, 86)">Milestones</span> ![[milestone.svg|30]]

```dataviewjs
const { update } = this.app.plugins.plugins["metaedit"].api;

// Access the current YAML frontmatter date
const yamlDate = dv.current().Date;

// Get today's date
const currentDate = yamlDate ? dv.date(yamlDate) : new Date();

// Define the start date (7 days ago)
const sevenDaysAgo = currentDate.startOf('month');
const endOfMonth = currentDate.endOf('month');

// Define the folder path
const folderPath = '"01-Daily Notes"';

// Retrieve pages from the specified date range
const pages = dv.pages(folderPath)
    .where(page => page.Date && page.Date >= sevenDaysAgo && page.Date <= currentDate)
    .sort(page => page.Date, 'asc');  // Sorting from earliest to latest

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
                categoryTasks.set(category, []);
            }

            const taskText = task.text.trim();
            const dateMatch = taskText.match(/\[\[(.*?)\]\]/);  // Check if the task has a completion date
            let taskDate = dateMatch ? dv.date(dateMatch[1]) : null;

            // If the task has a date, check if it's within the last 7 days
            if (taskDate && taskDate >= sevenDaysAgo) {
                categoryTasks.get(category).push({
                    taskText,
                    taskDate,
                    noteTitle: page.file.name
                });
            } else {
                // If the task has no date, check the note's Date
                let noteDate = dv.date(page.Date);
                if (noteDate >= sevenDaysAgo) {
                    categoryTasks.get(category).push({
                        taskText,
                        taskDate: noteDate,
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
            if (tasks.length > 0) {
                // Sort tasks within each category by date (earliest first)
                tasks.sort((a, b) => a.taskDate - b.taskDate);

                // Display the category header
                dv.paragraph(`<span style="color:rgb(220, 133, 86); font-weight: bold;">${category}</span>`);
                
                // Display each completed task with a clickable link icon
                for (const { taskText, noteTitle } of tasks) {
                    dv.paragraph(`   - [x] ${taskText} [[${noteTitle}|🔗]]`);
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
// Access the current note's YAML frontmatter date
const yamlDate = dv.current().date;

// Check if the YAML date is valid, otherwise use the previous day's date
const currentDate = yamlDate ? dv.date(yamlDate) : new Date();

// Subtract one day from the current date
const previousDay = currentDate instanceof Date 
    ? new Date(currentDate.setDate(currentDate.getDate() - 1)) 
    : currentDate.minus({ days: 1 }); // If it's a dv.date() object, use the `minus` function

// Define the start date (adjust as needed)
const startDate = dv.date("2025-01-01");

// Define the folder path
const folderPath = '"01-Daily Notes"';

// Retrieve pages from the specified date range, sorted ascending
const pages = dv.pages(folderPath)
    .where(page => page.date && page.date >= startDate && page.date <= previousDay)
    .sort(page => page.date, 'asc');

// Map to store tasks by keyword
const keywordTasks = new Map();

// Function to extract tasks by keyword (only processes incomplete tasks)
function extractKeywordTasks(page) {
    const tasks = page.file.tasks || [];
    for (const task of tasks) {
        if (task.completed) continue;  // Only process incomplete tasks
        const match = task.text.match(/\(([\w\s]+)::\)/);
        if (match) {
            const keyword = match[1];
            if (!keywordTasks.has(keyword)) {
                keywordTasks.set(keyword, new Map());
            }
            const taskText = task.text.trim();
            // Store the task text along with its originating note title
            keywordTasks.get(keyword).set(taskText, {
                taskObject: task,
                filePath: page.file.path,
                noteTitle: page.file.name
            });
        }
    }
}

// Extract tasks from each page
pages.forEach(page => extractKeywordTasks(page));

// Render tasks using markdown so that wikilinks behave natively (ctrl-click opens in new pane)
function renderTasks() {
    if (keywordTasks.size === 0) {
        dv.paragraph('<span style="color:rgb(88, 86, 220); font-weight: bold;">-- No Due Targets Set</span>');
    } else {
        for (const [keyword, tasks] of keywordTasks.entries()) {
            if (tasks.size > 0) {
                // Display the keyword header
                dv.paragraph(`<span style="color:rgb(88, 86, 220); font-weight: bold;">${keyword}</span>`);
                
                // Convert the Map to an array and sort tasks by taskText (or adjust as needed)
                const sortedTasks = Array.from(tasks.entries()).sort((a, b) => a[0].localeCompare(b[0]));
                
                // Render each task as a markdown line with a native wikilink for the note
                sortedTasks.forEach(([taskText, { noteTitle }]) => {
                    // Render an unchecked task; using markdown wikilink syntax ensures ctrl‑click works
                    dv.paragraph(`- [ ] ${taskText} [[${noteTitle}|🔗]]`);
                });
            }
        }
    }
}

// Initial render
renderTasks();

```
