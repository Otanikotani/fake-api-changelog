const fs = require('fs');
const path = require('path');

// Read the changelog data
const dataPath = path.join(__dirname, 'changelog-data.json');
const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

// Read the current index.html
const indexPath = path.join(__dirname, 'index.html');
let html = fs.readFileSync(indexPath, 'utf8');

// Get the current entry
const currentEntry = data.entries[data.currentIndex];

if (!currentEntry) {
  console.error(`No entry found at index ${data.currentIndex}`);
  process.exit(1);
}

console.log(`Adding entry: ${currentEntry.version} (Index: ${data.currentIndex})`);

// Build the new version HTML
let versionHTML = `
            <!-- ${currentEntry.version} -->
            <div class="version">
                <div class="version-header">
                    <span class="version-number">${currentEntry.version}</span>`;

if (currentEntry.badge === 'breaking') {
  versionHTML += `
                    <span class="version-badge badge-breaking">Breaking</span>`;
} else if (currentEntry.badge === 'latest') {
  versionHTML += `
                    <span class="version-badge badge-latest">Latest</span>`;
}

versionHTML += `
                    <span class="version-date">${currentEntry.date}</span>
                </div>
`;

// Add sections
currentEntry.sections.forEach(section => {
  versionHTML += `
                <div class="change-section">
                    <div class="change-type ${section.type}">${section.type.charAt(0).toUpperCase() + section.type.slice(1)}</div>
                    <ul class="changes-list">`;

  section.changes.forEach(change => {
    versionHTML += `
                        <li>${change}</li>`;
  });

  versionHTML += `
                    </ul>
                </div>
`;
});

versionHTML += `            </div>
`;

// Find the first version entry and insert before it
// Look for the first version comment (supports multiple formats: <!-- v2.4.2 --> or <!-- Version 2.4.0 -->)
const versionCommentMatch = html.match(/<!-- (?:Version )?v?\d+\.\d+\.\d+ -->/);

if (versionCommentMatch) {
  const insertIndex = html.indexOf(versionCommentMatch[0]);
  html = html.slice(0, insertIndex) + versionHTML + '\n' + html.slice(insertIndex);
} else {
  // If no version comment found, insert after the opening <div class="changelog">
  const changelogOpenTag = '<div class="changelog">';
  const insertIndex = html.indexOf(changelogOpenTag) + changelogOpenTag.length;
  html = html.slice(0, insertIndex) + '\n' + versionHTML + html.slice(insertIndex);
}

// Remove the "Latest" badge from previous entries
html = html.replace(/<span class="version-badge badge-latest">Latest<\/span>\s*/g, (match, offset) => {
  // Only remove if it's not in the newly added entry
  const newEntryStart = html.indexOf(currentEntry.version);
  if (offset < newEntryStart || offset > newEntryStart + versionHTML.length) {
    return '';
  }
  return match;
});

// Actually, let's do this properly - add Latest badge to our new entry if it should have it
if (currentEntry.badge === 'latest' || data.currentIndex === 0) {
  // First, remove all existing "Latest" badges
  html = html.replace(/<span class="version-badge badge-latest">Latest<\/span>\s*/g, '');

  // Then add it to our new entry
  const versionNumberPattern = new RegExp(`<span class="version-number">${currentEntry.version.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}</span>`);
  html = html.replace(versionNumberPattern, (match) => {
    return `${match}\n                    <span class="version-badge badge-latest">Latest</span>`;
  });
}

// Write the updated HTML
fs.writeFileSync(indexPath, html, 'utf8');

// Increment the counter (reset to 0 if it goes beyond 99)
data.currentIndex = (data.currentIndex + 1) % 100;

// Write the updated data
fs.writeFileSync(dataPath, JSON.stringify(data, null, 2), 'utf8');

console.log(`Successfully updated changelog. Next index: ${data.currentIndex}`);
