---
Date: 2025-02-16
creation date: 2025 Feb 27th Thu 13:19
modification date: 2025 Feb 27th Thu 13:19
obsidianUIMode: preview
Sleep_Start: 23:30
Sleep_End: 08:00
Sleep_Time: 8:30
Nap_Start: 00:00
Nap_End: 00:00
Nap_Time: 00:00
Exercise_Status: false
Meal_Status: true
Shower_Status: true
Entertainment_Status: true
Productive_Work: true
Academics_Studied: false
Games: 
Movies:
  - The Lord of the Rings The Fellowship of the Ring
TV_Shows: 
Others:
  - Dungeons & Dragons
Mood:
  - Content
  - Irritated
  - Happy
Shower_Time:
  - Morning
Key_Takeouts:
  - sink leaking
  - started reading mortal engines
  - tina wants a witch costume
Content_Highlight:
  - "[Why are the Dutch So Good at Waterworks?](https://youtu.be/qQCB3N8Vaxk?feature=shared)"
  - "[OSINT Exercise 029 | Solution and full walkthrough](https://youtu.be/Ssz4wEvsJKY?feature=shared)"
cssclasses:
  - task-color
Reflections: |+
  Woke up too late for exercise and while preparing breakfast, I realized the sink was leaking. Told John to get it fixed by evening—otherwise making dinner would become harder for me. 

  Once the morning chaos was underway, I met up with a few friends for our weekly D&D session, which went for a but too longer than usual. resulting in a delayed lunch for everyone.

  spent the quiet noon catching up on a movie ive been wanting to watch for some time now. its the first movie of a series called The Lord of the Rings and it turned out way better than i initially thought. idk how i never bothered watching this masterpiece.

  when evening rolled around and john forgot to get someone to fix the sink i realized i had some inconveniences at my hand with preparing food. reminded john again to get it fixed by tomorrow and he promised he will. tina wanted me to get her a halloween costume even though its not halloween yet. she's planning on going to a costume party at her friends so i promised her i would make her a witch costume and that made her  ecstatic. 

  was planning on finishing some chapters on my waterworks book but decided to spend the rest of the day getting materials and preparations to start working on tinas costume tomorrow instead.

Principles: Reading Mortal Engines and watching the LOTR movie got me thinking about how even in a chaotic world, hope and courage can make all the difference. Both stories show that everyday struggles are part of a larger adventure, where small acts of bravery add up to meaningful change.
Milestones_Tag: Lifestyle
Targets_Tag: Lifestyle
Reminder_Text_0: Tina's Birthday
Reminder_Date_0: 2025-03-30

---

<< [[2025 Feb 15th Sat|Yesterday]] | [[2025 Feb 17th Mon|Tomorrow]] >> | [[2025 Feb 22nd (W08)|Weekly]] | [[2025 Feb|Monthly]] >>   `BUTTON[Refresh]`
```meta-bind-embed
[[Movies Embeds]]
```

---

## <span style="color:rgb(74, 144, 226)">Reflections</span> ![[feather.svg|30]] 

`INPUT[textArea(class(reflection-text)):Reflections]`
<span style="color:rgb(74, 144, 226); font-weight: bold;">Key Takeouts</span> ![[Highlight.svg|24]]

```meta-bind
INPUT[list:Key_Takeouts]
```

<span style="color:rgb(74, 144, 226); font-weight: bold;">Upcoming Events</span> ![[Calendar-time.svg|24]]
‎‎
```meta-bind-button
label: Add Reminder
icon: plus
hidden: false
class: metabind-reminder
tooltip: "Add a new reminder"
id: add-simple-reminder
style: default
actions:
  - type: inlineJS
    code: |
      const activeLeaf = app.workspace.activeLeaf;
      if (!activeLeaf || !activeLeaf.view || !(activeLeaf.view.getViewType() === "markdown")) {
        console.log("No active Markdown view");
        return;
      }

      const editor = activeLeaf.view.editor;
      const content = editor.getValue();

      function findNextAvailableNumber() {
        const regex = /Reminder_Text_(\d+)/g;
        let maxNum = -1;
        let match;
        while ((match = regex.exec(content)) !== null) {
          const num = parseInt(match[1], 10);
          if (num > maxNum) maxNum = num;
        }
        return maxNum + 1;
      }

      const nextNum = findNextAvailableNumber();
      const newReminderLine = `- \`INPUT[text(class(input-w-full)):Reminder_Text_${nextNum}]\` \`INPUT[datePicker(class(reminder-date)):Reminder_Date_${nextNum}]\`\n`;

      // Split content into lines
      const lines = content.split('\n');
      let codeBlockStart = -1;
      let codeBlockEnd = -1;

      // Find the start of the current code block (meta-bind-button block)
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].includes('meta-bind-button')) {
          codeBlockStart = i;
          // Look for the end of this code block (closing "```")
          for (let j = i + 1; j < lines.length; j++) {
            if (lines[j].trim() === '```') {
              codeBlockEnd = j;
              break;
            }
          }
          break; // Stop after finding the first meta-bind-button block
        }
      }

      // If code block end is found, insert the reminder right after it
      if (codeBlockEnd !== -1) {
        editor.replaceRange(newReminderLine, { line: codeBlockEnd + 1, ch: 0 });
        console.log(`Added reminder with number ${nextNum} after meta-bind-button block.`);
      } else {
        console.log("No meta-bind-button block found.");
      }
```
- `INPUT[text(class(input-w-full)):Reminder_Text_0]` `INPUT[datePicker(class(reminder-date)):Reminder_Date_0]`
```dataviewjs
// Get all notes
let allNotes = dv.pages();

// Get the current note's date
let currentNoteDate = moment(dv.current().file.frontmatter.Date).format('YYYY-MM-DD');

// Calculate note date as one day before the current note's date
let noteDate = moment(currentNoteDate).subtract(1, 'days').format('YYYY-MM-DD');

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

      // Check if both the text and date keys exist and skip the current note
      if (page.file.frontmatter[reminderTextKey] !== undefined && 
          page.file.frontmatter[reminderDateKey] !== undefined && 
          page.file.name !== dv.current().file.name) { // Skip current note

        reminders.push({
          reminder_text: page.file.frontmatter[reminderTextKey],
          reminder_date: moment(page.file.frontmatter[reminderDateKey]),
          note_date: noteDate  // Use the calculated note date
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

// Extract all reminders from all pages, excluding the current note
let allReminders = allNotes.flatMap(page => extractReminders(page));

// Sort reminders by date
allReminders.sort((a, b) => moment(a.reminder_date).diff(moment(b.reminder_date)));

// Loop through the reminders and create styled output
for (let reminder of allReminders) {
  let reminderDate = moment(reminder.reminder_date).format('YYYY-MM-DD');
  
  if (reminderDate === currentNoteDate) {
    // If the reminder date matches the current note's date, show the reminder and the alert icon
    dv.paragraph(`<span style="color:rgb(91, 97, 117); font-weight: bold; margin-left: 13px;">•</span> <span style="display: inline-flex; align-items: center; ">
      <input type="text" value="${reminder.reminder_text}" style="background: transparent; border: 1px solid #282e42; border-radius: 6px; color: inherit; font-weight: 15px; margin-left: 0px; width: 207px;">
      <span style="margin-left: 15px;"></span>
      <input type="date" value="${reminderDate}" style="background: #272935; border: 1px solid #282e42; color: #4a90e2;font-size: 13; border-radius: 4px; align-items: center; font-weight: 10px; width: 117px; margin-left: 10px;">
      <span style="margin-left: 10px;">![[alert-triangle.svg|35]]</span>
    </span>`);
  } else if (moment(reminderDate).isAfter(moment(currentNoteDate))) {
    // If the reminder date is after the current note's date, show the reminder without the alert icon
    dv.paragraph(`<span style="color:rgb(91, 97, 117); font-weight: bold; margin-left: 13px;">•</span> <span style="display: inline-flex; align-items: center;">
      <input type="text" value="${reminder.reminder_text}" style="background: transparent; border: 1px solid #282e42; border-radius: 4px; color: inherit; font-weight: 15px; margin-left: 0px; width: 207px;">
      <span style="margin-left: 15px;"></span>
      <input type="date" value="${reminderDate}" style="background: #272935; border: 1px solid #282e42; color: #4a90e2;font-size: 13; border-radius: 4px; align-items: center; font-weight: 10px; width: 117px; margin-left: 10px;">
    </span>`);
  }
  // If the reminder date is before the current note's date, nothing is shown
}

```

## <span style="color:rgb(220, 86, 151)">Entertainment</span> ![[Mask.svg|30]]

#### <span style="color:rgb(220, 86, 151)">Media</span> ![[tv.svg|24]]

<span style="color:rgb(220, 86, 151); font-weight: bold;">Games:</span> `INPUT[inlineList:Games]`

<span style="color:rgb(220, 86, 151); font-weight: bold;">Movies:</span> `INPUT[inlineList:Movies]`

<span style="color:rgb(220, 86, 151); font-weight: bold;">TV Shows:</span> `INPUT[inlineList:TV_Shows]`

<span style="color:rgb(220, 86, 151); font-weight: bold;">Others:</span> `INPUT[inlineList:Others]`

#### <span style="color:rgb(220, 86, 151)">Content Highlight</span> ![[pin.svg|24]]

```meta-bind
INPUT[list:Content_Highlight]
```

## <span style="color:rgb(26, 188, 156)">Lifestyles</span> ![[Growing.svg|30]]

#### <span style="color:rgb(26, 188, 156)">Habits</span> ![[sun.svg|24]]

```dataviewjs
// Get the current note's YAML data
const data = dv.current().file.frontmatter;

// Create an array of activities with their corresponding YAML toggle fields
const activities = [
    { name: "Exercise", toggle: "Exercise_Status" },
    { name: "Meal", toggle: "Meal_Status" },
    { name: "Shower", toggle: "Shower_Status" },
    { name: "Entertainment", toggle: "Entertainment_Status" },
    { name: "Productive", toggle: "Productive_Work" },
    { name: "Academic", toggle: "Academics_Studied" }
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

#### <span style="color:rgb(26, 188, 156)">Health</span> ![[life.svg|24]]

```dataviewjs
// Get the current note's YAML data
const sleepData = dv.current().file.frontmatter;

// Function to parse time in HH:MM format
function parseTime(timeStr) {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return { hours, minutes };
}

// Function to format time in 12-hour format with AM/PM
function format12HourTime(hours, minutes) {
    const period = hours >= 12 ? 'PM' : 'AM';
    const adjustedHours = hours % 12 === 0 ? 12 : hours % 12;
    const formattedMinutes = minutes.toString().padStart(2, '0');
    return `${adjustedHours}:${formattedMinutes} ${period}`;
}

// Extract and parse Sleep_Start and Sleep_End
const start = parseTime(sleepData.Sleep_Start);
const end = parseTime(sleepData.Sleep_End);

// Calculate duration
let durationMinutes = (end.hours * 60 + end.minutes) - (start.hours * 60 + start.minutes);
if (durationMinutes < 0) durationMinutes += 24 * 60; // Adjust if sleep spans midnight
const durationHours = Math.floor(durationMinutes / 60);
const remainingMinutes = durationMinutes % 60;

// Format duration
const formattedDuration = `${durationHours}:${remainingMinutes.toString().padStart(2, '0')}`;

// Update YAML Sleep_Time
const {update} = app.plugins.plugins["metaedit"].api;
update('Sleep_Time', formattedDuration, dv.current().file.path);

// Create output using Markdown and inline INPUT components for time
const output = `
<span style="color: rgb(26, 188, 156); font-weight: bold;">Sleep Time:</span> \`INPUT[time:Sleep_Start]\` → \`INPUT[time:Sleep_End]\` = <span style="font-size: calc(1em - 2px); background-color: rgb(39, 41, 53); padding: 7px 12px; border-radius: 4px; color: var(--text-bold);"> ${formattedDuration} HR ⧖</span>
`;

// Output the result
dv.paragraph(output);
```
<span style="color:rgb(26, 188, 156); font-weight: bold;">Mood:</span> `INPUT[inlineListSuggester(option(Apathetic), option(Content), option(Happy), option(Excited), option(Nostalgic), option(Downcast), option(Somber), option(Heartbroken), option(Pensive), option(Irritated), option(Frustrated), option(Furious), option(Anxious), option(Worried), option(Distracted), option(Melancholic), option(Despair), option(Nihilistic), option(Jaded), option(Resigned)):Mood]`

<span style="color:rgb(26, 188, 156); font-weight: bold;">Shower Time:</span>  `INPUT[inlineListSuggester(option(Dawn), option(Morning), option(Noon), option(Afternoon), option(Evening), option(Night), option(Midnight)):Shower_Time]`

## <span style="color:rgb(223, 196, 150)">Interactions</span> ![[Handshake.svg|35]]

<span style="color:rgb(223, 196, 150); font-weight: bold;">Family::</span> [[John]]: reminded him to fix the sink. | [[Tina]]: wanted a witch costume for her party.

<span style="color:rgb(223, 196, 150); font-weight: bold;">Relatives::</span> 

<span style="color:rgb(223, 196, 150); font-weight: bold;">Friends::</span>  [[Alex]]: weekly dnd session. | [[Sam]]: weekly dnd session. | [[Jess]]:weekly dnd session.

<span style="color:rgb(223, 196, 150); font-weight: bold;">Casual Acquaintances::</span> 

<span style="color:rgb(223, 196, 150); font-weight: bold;">Academic Contacts::</span>  

<span style="color:rgb(223, 196, 150); font-weight: bold;">Professional Contacts::</span> 

<span style="color:rgb(223, 196, 150); font-weight: bold;">Service Providers::</span> 

<span style="color:rgb(223, 196, 150); font-weight: bold;">Strangers::</span> 

## <span style="color:rgb(171, 191, 226)">Insights</span> ![[lightbulb.svg|30]]

`INPUT[textArea(class(Principles-text)):Principles]`
```meta-bind-embed
[[Daily Notes-Meta Bind Menu]]
```
## <span style="color:rgb(220, 133, 86)">Milestones</span> ![[milestone.svg|30]]

`BUTTON[milestone]`   `INPUT[inlineSelect(class(milestones-tag), option(Academic), option(Assistance), option(Entertainment), option(Lifestyle), option(Mastery), option(Note), option(Project)):Milestones_Tag]`

<span style="color:rgb(220, 133, 86); font-weight:bold;">Lifestyle</span>
  - [x] made preparations to start working on tinas costume. (Lifestyle::)


## <span style="color:rgb(88, 86, 220)">Targets </span> ![[crosshair.svg|24]]

`BUTTON[target]`   `INPUT[inlineSelect(class(targets-tag), option(Academic), option(Assistance), option(Entertainment), option(Lifestyle), option(Mastery), option(Note), option(Project)):Targets_Tag]`

<span style="color:rgb(88, 86, 220); font-weight: bold;">Lifestyle</span>
  - [ ] Fix the sink. (Lifestyle::)

<span style="color:rgb(88, 86, 220); font-weight: bold;">Assistance</span>
  - [ ] Make tina a witch costume. (Assistance::)


```dataviewjs
// Access the current YAML frontmatter date
const yamlDate = dv.current().date;

// Check if the YAML date is valid, otherwise use the previous day's date
const currentDate = yamlDate ? dv.date(yamlDate) : new Date();

// Subtract one day from the current date
const previousDay = currentDate instanceof Date 
    ? new Date(currentDate.setDate(currentDate.getDate() - 1)) 
    : currentDate.minus({ days: 1 }); // If it's a dv.date() object, use the `minus` function

// Define the start date (2024-10-05)
const startDate = dv.date("2025-01-01");

// Define the folder path
const folderPath = '"01-Daily Notes"';

// Retrieve pages from the specified date range
const pages = dv.pages(folderPath)
    .where(page => page.date && page.date >= startDate && page.date <= previousDay)
    .sort(page => page.date, 'asc');

// Map to store tasks by keyword
const keywordTasks = new Map();

// Function to extract tasks by keyword
function extractKeywordTasks(page) {
    const tasks = page.file.tasks || [];

    for (const task of tasks) {
        // Only process incomplete tasks
        if (task.completed) continue;

        const match = task.text.match(/\(([\w\s]+)::\)/);
        if (match) {
            const keyword = match[1];
            if (!keywordTasks.has(keyword)) {
                keywordTasks.set(keyword, new Map());
            }

            const taskText = task.text.trim();
            
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

// Function to update task in original note
async function updateTaskInOriginalNote(filePath, taskText, currentNoteTitle) {
    const file = app.vault.getAbstractFileByPath(filePath);
    if (file) {
        const content = await app.vault.read(file);
        const updatedTaskText = taskText.replace(/^\s*-\s*\[\s?\]\s*/, '').replace(/\s*\[\[.*?\]\]\s*$/, '');
        const newTaskText = `- [x] ${updatedTaskText} [[${currentNoteTitle}]]`;
        const escapedTaskText = taskText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const updatedContent = content.replace(new RegExp(`- \\[ \\] ${escapedTaskText}`), newTaskText);
        await app.vault.modify(file, updatedContent);
    }
}

// Function to render all tasks
function renderTasks() {
    const currentNoteTitle = dv.current().file.name;
    
    if (keywordTasks.size === 0) {
        dv.paragraph('<span style="color:rgb(88, 86, 220); font-weight: bold;">-- No Due Targets Set</span>');
    } else {
        for (const [keyword, tasks] of keywordTasks.entries()) {
            if (tasks.size > 0) {
                dv.paragraph(`<span style="color:rgb(88, 86, 220); font-weight: bold;">${keyword}</span>`);
                for (const [taskText, { taskObject, filePath, noteTitle }] of tasks.entries()) {
                    const container = dv.el('div', '', { style: "display: block; margin-bottom: 5px;" });
                    
                    const checkbox = dv.el('input', '', { type: 'checkbox', checked: false });
                    const label = dv.el('span', taskText.replace(/^\s*-\s*\[\s?\]\s*/, ''), { cls: 'task-text', style: "margin-left: 8px;" });

                    container.appendChild(checkbox);
                    container.appendChild(label);

                    checkbox.onchange = async () => {
                        if (checkbox.checked) {
                            // Update task in original note with current note's title
                            await updateTaskInOriginalNote(filePath, taskText, currentNoteTitle);

                            // Remove the task from keywordTasks
                            tasks.delete(taskText);

                            // Refresh the view
                            dv.replace(() => renderTasks());
                        }
                    };
                }
            }
        }
    }
}

// Initial render
renderTasks();
```

---


