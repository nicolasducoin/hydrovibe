import { NextRequest, NextResponse } from 'next/server';

interface StacSearchParams {
  collections?: string[];
  bbox?: string[];
  datetime?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: StacSearchParams = await request.json();
    
    const { collections, bbox, datetime } = body;

    // Build STAC search query
    const stacQuery: any = {
      limit: 100, // Adjust as needed
    };

    if (collections && collections.length > 0) {
      stacQuery.collections = collections;
    }

    if (bbox && bbox.length === 4) {
      // STAC expects bbox as [minx, miny, maxx, maxy]
      stacQuery.bbox = bbox.map(parseFloat);
    }

    if (datetime) {
      stacQuery.datetime = datetime;
    }

    const stacUrl = 'https://hydroweb-pp.next.theia-land.fr/api/v1/rs-catalog/stac/search';
    
    const response = await fetch(stacUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(stacQuery),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('STAC API error:', errorText);
      return NextResponse.json(
        {
          error: 'STAC_API_ERROR',
          message: `STAC API returned status ${response.status}: ${errorText}`,
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error querying STAC API:', error);
    return NextResponse.json(
      {
        error: 'CONNECTION_ERROR',
        message: error instanceof Error ? error.message : 'Failed to query STAC API',
      },
      { status: 500 }
    );
  }
}
