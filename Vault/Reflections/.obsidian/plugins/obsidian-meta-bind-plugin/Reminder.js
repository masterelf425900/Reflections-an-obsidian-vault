const container = dv.container;

// Initialize reminders from the note's YAML front matter
let reminders = dv.current().reminders || [];

// Ensure reminders is an array
if (!Array.isArray(reminders)) {
    reminders = [];
}

// Create a reminder input section
const uniqueId = `${Date.now()}`; // Unique ID based on timestamp
const reminderDiv = container.createEl('div', { cls: 'reminder-entry' });

reminderDiv.innerHTML = `
    <input type="text" placeholder="Reminder Text" id="reminderText${uniqueId}" />
    <input type="date" id="reminderDate${uniqueId}" />
    <button id="saveButton${uniqueId}">Save</button>
`;
container.appendChild(reminderDiv);

// Function to save the reminder
async function saveReminder(id) {
    const textInput = document.getElementById(`reminderText${id}`);
    const dateInput = document.getElementById(`reminderDate${id}`);
    
    if (textInput.value && dateInput.value) { // Check for valid input
        const newReminder = {
            text: textInput.value,
            date: dateInput.value,
            id: Date.now() // Unique identifier for the reminder
        };

        // Add new reminder to the array
        reminders.push(newReminder);

        // Update the current note's YAML front matter
        await dv.file.set(dv.current().file.path, {
            ...dv.current(),
            reminders: reminders
        });
        
        // Clear the container and re-render the reminders
        container.empty(); // Clear the existing entries
        renderReminders(); // Call the function to render reminders
    } else {
        alert("Please enter both a reminder text and a date."); // Alert for missing inputs
    }
}

// Attach the save function to the button click
document.getElementById(`saveButton${uniqueId}`).onclick = () => saveReminder(uniqueId);

// Function to render existing reminders
function renderReminders() {
    // Loop through reminders and display them
    reminders.forEach(reminder => {
        const reminderDiv = container.createEl('div', { text: `${reminder.text} on ${reminder.date}` });
        container.appendChild(reminderDiv);
    });
}

// Initial rendering of reminders
renderReminders();
