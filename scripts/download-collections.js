const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

const STAC_BASE_URL = 'https://hydroweb-pp.next.theia-land.fr/api/v1/rs-catalog/stac';
const OUTPUT_DIR = path.join(__dirname, '..', 'public', 'collections');
const METADATA_FILE = path.join(__dirname, '..', 'public', 'collections-metadata.json');

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// Function to download a file
function downloadFile(url, filepath) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    const file = fs.createWriteStream(filepath);
    
    client.get(url, (response) => {
      if (response.statusCode === 301 || response.statusCode === 302) {
        // Follow redirects
        return downloadFile(response.headers.location, filepath).then(resolve).catch(reject);
      }
      
      if (response.statusCode !== 200) {
        file.close();
        fs.unlinkSync(filepath);
        reject(new Error(`Failed to download ${url}: ${response.statusCode}`));
        return;
      }
      
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        resolve();
      });
    }).on('error', (err) => {
      file.close();
      if (fs.existsSync(filepath)) {
        fs.unlinkSync(filepath);
      }
      reject(err);
    });
  });
}

// Function to fetch data from URL
function fetchJson(url) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    
    client.get(url, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`HTTP ${response.statusCode}: ${response.statusMessage}`));
        return;
      }
      
      let data = '';
      response.on('data', (chunk) => {
        data += chunk;
      });
      
      response.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (err) {
          reject(err);
        }
      });
    }).on('error', reject);
  });
}

// Function to get all collections
async function getAllCollections() {
  try {
    console.log('Fetching collections from STAC API...');
    const collectionsUrl = `${STAC_BASE_URL}/collections`;
    const collectionsData = await fetchJson(collectionsUrl);
    return collectionsData.collections || [];
  } catch (error) {
    console.error('Error fetching collections:', error.message);
    throw error;
  }
}

// Function to get a specific collection
async function getCollection(collectionId) {
  try {
    const collectionUrl = `${STAC_BASE_URL}/collections/${collectionId}`;
    return await fetchJson(collectionUrl);
  } catch (error) {
    console.error(`Error fetching collection ${collectionId}:`, error.message);
    return null;
  }
}

// Main function
async function downloadCollectionsMetadata() {
  try {
    console.log('Starting collection metadata download...');
    
    // Get list of all collections
    const collections = await getAllCollections();
    console.log(`Found ${collections.length} collections`);
    
    const collectionsMetadata = {};
    
    for (const collection of collections) {
      const collectionId = collection.id;
      console.log(`\nProcessing collection: ${collectionId}`);
      
      // Get detailed collection metadata
      const detailedCollection = await getCollection(collectionId);
      if (!detailedCollection) {
        console.log(`  Skipping ${collectionId} - could not fetch details`);
        continue;
      }
      
      // Extract metadata
      const metadata = {
        id: collectionId,
        title: detailedCollection.title || collectionId,
        description: detailedCollection.description || '',
        shortDescription: detailedCollection.description 
          ? detailedCollection.description.substring(0, 200) + (detailedCollection.description.length > 200 ? '...' : '')
          : '',
        thumbnail: null,
        thumbnailUrl: null
      };
      
      // Extract thumbnail
      if (detailedCollection.assets && detailedCollection.assets.thumbnail) {
        metadata.thumbnailUrl = detailedCollection.assets.thumbnail.href;
      } else if (detailedCollection.links) {
        // Look for thumbnail in links
        const thumbnailLink = detailedCollection.links.find(
          link => link.rel === 'preview' || link.rel === 'thumbnail' || link.rel === 'icon'
        );
        if (thumbnailLink) {
          metadata.thumbnailUrl = thumbnailLink.href;
        }
      }
      
      // Download thumbnail if available
      if (metadata.thumbnailUrl) {
        try {
          const thumbnailFilename = `${collectionId}.${metadata.thumbnailUrl.split('.').pop().split('?')[0]}`;
          const thumbnailPath = path.join(OUTPUT_DIR, thumbnailFilename);
          
          console.log(`  Downloading thumbnail: ${metadata.thumbnailUrl}`);
          await downloadFile(metadata.thumbnailUrl, thumbnailPath);
          
          metadata.thumbnail = `/collections/${thumbnailFilename}`;
          console.log(`  ✓ Thumbnail saved: ${thumbnailFilename}`);
        } catch (error) {
          console.log(`  ✗ Failed to download thumbnail: ${error.message}`);
          metadata.thumbnail = null;
        }
      } else {
        console.log(`  No thumbnail found for ${collectionId}`);
      }
      
      collectionsMetadata[collectionId] = metadata;
    }
    
    // Save metadata to JSON file
    fs.writeFileSync(METADATA_FILE, JSON.stringify(collectionsMetadata, null, 2));
    console.log(`\n✓ Metadata saved to ${METADATA_FILE}`);
    console.log(`✓ Processed ${Object.keys(collectionsMetadata).length} collections`);
    
  } catch (error) {
    console.error('Error downloading collections:', error);
    process.exit(1);
  }
}

// Run the script
downloadCollectionsMetadata();
