// Generate a random number based on the current date and time
function generateRandomNumber() {
    return Date.now().toString().slice(-3); // Use last 3 digits of timestamp
}

// Create a new input area for reminders
function createReminderInput() {
    const reminderContainer = document.createElement('div');

    // Create input for text
    const textInput = document.createElement('input');
    textInput.type = 'text';
    textInput.placeholder = 'Place to write text';
    reminderContainer.appendChild(textInput);

    // Create date picker
    const datePicker = document.createElement('input');
    datePicker.type = 'date';
    reminderContainer.appendChild(datePicker);

    // Create a button to submit the input
    const submitButton = document.createElement('button');
    submitButton.textContent = 'Add Reminder';
    reminderContainer.appendChild(submitButton);

    // Append reminder container to the body or any specific section
    document.body.appendChild(reminderContainer);

    // Handle button click
    submitButton.onclick = () => {
        const randomNumber = generateRandomNumber();
        const reminderText = textInput.value;
        const reminderDate = datePicker.value;

        // Create YAML format
        const yamlText = `ReminderText${randomNumber}: ${reminderText}`;
        const yamlDate = `ReminderDate${randomNumber}: ${reminderDate}`;

        // Log the generated YAML (for demonstration purposes)
        console.log(yamlText);
        console.log(yamlDate);

        // Clear inputs
        textInput.value = '';
        datePicker.value = '';
    };
}

// Run the function to create reminder input
createReminderInput();
