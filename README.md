# Fake API Changelog

An automated changelog website that publishes new entries daily using GitHub Actions.

## Files

- **index.html** - The main changelog website
- **changelog-data.json** - Contains 100 pre-generated changelog entries and a counter
- **update-changelog.js** - Node.js script that updates the changelog
- **.github/workflows/update-changelog.yml** - GitHub Actions workflow for automation

## How It Works

1. Every day at 9:00 AM UTC (or manually triggered), GitHub Actions runs the workflow
2. The workflow executes `update-changelog.js` which:
   - Reads the current index from `changelog-data.json`
   - Gets the changelog entry at that index
   - Adds the entry to the top of `index.html`
   - Updates the "Latest" badge to the new entry
   - Increments the counter (resets to 0 after reaching 99)
3. The changes are committed and pushed to the repository

## Manual Trigger

You can manually trigger the workflow from the GitHub Actions tab:
1. Go to the "Actions" tab in your repository
2. Select "Update Changelog Daily" workflow
3. Click "Run workflow"

## Testing Locally

To test the update script locally:

```bash
node update-changelog.js
```

This will add the next entry from the JSON file to the changelog.

## Customizing

To modify the changelog entries, edit the `entries` array in `changelog-data.json`. Each entry should have:

- `version`: Version number (e.g., "v2.4.1")
- `date`: Release date
- `badge`: Optional badge ("latest", "breaking", or null)
- `sections`: Array of change sections, each with:
  - `type`: One of "added", "changed", "fixed", "deprecated", "removed", "security"
  - `changes`: Array of change descriptions (can include HTML like `<span class="code">`)
