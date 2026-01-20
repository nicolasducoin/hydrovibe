# Download Collections Metadata Script

This script downloads collection metadata (descriptions and thumbnail images) from the STAC API and stores them locally to enhance the application's results display.

## Usage

Run the script using npm:

```bash
npm run download-collections
```

Or directly with Node.js:

```bash
node scripts/download-collections.js
```

## What it does

1. **Fetches all collections** from the STAC API endpoint: `https://hydroweb-pp.next.theia-land.fr/api/v1/rs-catalog/stac/collections`

2. **Downloads collection metadata** including:
   - Collection ID
   - Title
   - Full description
   - Short description (first 200 characters)
   - Thumbnail/preview image URL

3. **Downloads thumbnail images** to `public/collections/` directory

4. **Saves metadata** to `public/collections-metadata.json`

## Output

- **Images**: `public/collections/{collection-id}.{extension}`
- **Metadata**: `public/collections-metadata.json`

The metadata file contains a JSON object where keys are collection IDs and values are metadata objects:

```json
{
  "HYDROWEB_LAKES_RESEARCH": {
    "id": "HYDROWEB_LAKES_RESEARCH",
    "title": "Hydroweb Lakes Research",
    "description": "Full description...",
    "shortDescription": "Short description...",
    "thumbnail": "/collections/HYDROWEB_LAKES_RESEARCH.jpg",
    "thumbnailUrl": "https://..."
  }
}
```

## Notes

- The script will create necessary directories if they don't exist
- If a thumbnail download fails, the script continues with other collections
- Images that fail to load in the UI will be hidden automatically
