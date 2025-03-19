


```meta-bind-button
label: Add Target
icon: plus
hidden: true
class: metabind-target
tooltip: "Add a new target"
id: target
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
      
      // Extract YAML frontmatter
      const yamlMatch = content.match(/^---\n([\s\S]*?)\n---/);
      if (!yamlMatch) {
        console.log("YAML frontmatter not found.");
        return;
      }
      
      const yamlContent = yamlMatch[1];
      const targetsTagMatch = yamlContent.match(/^Targets_Tag:\s*(.+)$/m);
      if (!targetsTagMatch) {
        console.log("Targets_Tag not found in YAML frontmatter.");
        return;
      }
      
      const targetsTag = targetsTagMatch[1].trim();
      const newExampleLines = `<span style="color:rgb(88, 86, 220); font-weight: bold;">${targetsTag}</span>\n  - [ ] Example Target. (${targetsTag}::)\n\n`;
      
      const targetHeading = '## <span style="color:rgb(88, 86, 220)">Targets </span> ![[crosshair.svg|24]]';
      
      // Split content into lines
      const lines = content.split('\n');
      let targetHeadingIndex = -1;
      
      // Find the target heading
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].trim() === targetHeading) {
          targetHeadingIndex = i;
          break;
        }
      }
      
      // If the target heading is found, insert the example 4 lines below it
      if (targetHeadingIndex !== -1) {
        const insertionIndex = targetHeadingIndex + 4;
        
        // Ensure there are at least 3 lines after the heading
        while (lines.length <= insertionIndex) {
          lines.push('');
        }
        
        editor.replaceRange(newExampleLines, { line: insertionIndex, ch: 0 });
        console.log("Added example 4 lines below the Targets heading.");
      } else {
        console.log("Targets heading not found.");
      }

```


```meta-bind-button
label: Add Milestone
icon: plus
hidden: true
class: metabind-milestone
tooltip: "Add a new milestone"
id: milestone
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

      // Extract YAML frontmatter
      const yamlMatch = content.match(/^---\n([\s\S]*?)\n---/);
      if (!yamlMatch) {
        console.log("YAML frontmatter not found.");
        return;
      }
      
      const yamlContent = yamlMatch[1];
      const milestonesTagMatch = yamlContent.match(/^Milestones_Tag:\s*(.+)$/m);
      if (!milestonesTagMatch) {
        console.log("Milestones_Tag not found in YAML frontmatter.");
        return;
      }

      const milestonesTag = milestonesTagMatch[1].trim();
      const newExampleLines = `<span style="color:rgb(220, 133, 86); font-weight:bold;">${milestonesTag}</span>\n  - [x] Example Target. (${milestonesTag}::)\n\n`;

      const targetHeading = '## <span style="color:rgb(220, 133, 86)">Milestones</span> ![[milestone.svg|30]]';

      // Split content into lines
      const lines = content.split('\n');
      let targetHeadingIndex = -1;

      // Find the target heading
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].trim() === targetHeading) {
          targetHeadingIndex = i;
          break;
        }
      }

      // If the target heading is found, insert the example 4 lines below it
      if (targetHeadingIndex !== -1) {
        const insertionIndex = targetHeadingIndex + 4;

        // Ensure there are at least 3 lines after the heading
        while (lines.length <= insertionIndex) {
          lines.push('');
        }

        editor.replaceRange(newExampleLines, { line: insertionIndex, ch: 0 });
        console.log("Added example 4 lines below the Targets heading.");
      } else {
        console.log("Targets heading not found.");
      }

```

