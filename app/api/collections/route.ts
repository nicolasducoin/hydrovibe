import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    const metadataPath = path.join(process.cwd(), 'public', 'collections-metadata.json');
    
    console.log('Looking for metadata at:', metadataPath);
    
    if (!fs.existsSync(metadataPath)) {
      console.error('Metadata file not found at:', metadataPath);
      return NextResponse.json(
        { error: 'Collections metadata not found. Please run the download script first.' },
        { status: 404 }
      );
    }
    
    const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));
    console.log('Metadata loaded successfully,', Object.keys(metadata).length, 'collections');
    return NextResponse.json(metadata);
  } catch (error) {
    console.error('Error reading collections metadata:', error);
    return NextResponse.json(
      { error: 'Failed to read collections metadata', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
