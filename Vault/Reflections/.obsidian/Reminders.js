function generateRandomString() {
  return Math.floor(Date.now() * Math.random()).toString().padStart(5, '0').slice(-5);
}

function createMetabindOptions() {
  const randomString = generateRandomString();
  return `INPUT[text:Reminder_Text_${randomString}] INPUT[datePicker:Reminder_Date_${randomString}]`;
}

async function insertMetabindOptionsAt42ndLine() {
  const activeView = app.workspace.getActiveViewOfType(app.workspace.getActiveViewOfType(MarkdownView));
  
  if (!activeView) {
    console.error("No active Markdown view");
    return;
  }

  const editor = activeView.editor;
  const lineCount = editor.lineCount();

  if (lineCount < 42) {
    console.error("The note has fewer than 42 lines");
    return;
  }

  const metabindOptions = createMetabindOptions();
  const lineContent = editor.getLine(41); // Line 42 is index 41

  editor.transaction(() => {
    editor.replaceRange(metabindOptions + '\n' + lineContent, { line: 41, ch: 0 }, { line: 41, ch: lineContent.length });
  });
}

module.exports = insertMetabindOptionsAt42ndLine;