'use client';

import { useState, KeyboardEvent } from 'react';

interface HydroSearchParameters {
  collections: string[];
  startDate?: string;
  endDate?: string;
  boundingBox?: string[];
}

interface StacFeature {
  id: string;
  type: string;
  collection?: string;
  geometry?: any;
  properties: {
    datetime?: string;
    collection?: string;
    [key: string]: any;
  };
  links?: Array<{
    rel: string;
    href: string;
    [key: string]: any;
  }>;
}

interface StacResponse {
  type: string;
  features: StacFeature[];
  numberMatched?: number;
  numberReturned?: number;
}

interface CollectionGroup {
  collectionId: string;
  features: StacFeature[];
}

export default function Home() {
  const [query, setQuery] = useState('');
  const [model, setModel] = useState('MISTRAL_LARGE_LATEST');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<HydroSearchParameters | null>(null);
  const [stacResults, setStacResults] = useState<CollectionGroup[]>([]);
  const [loadingStac, setLoadingStac] = useState(false);
  const [stacError, setStacError] = useState<string | null>(null);

  const handleSearch = async () => {
    if (!query.trim()) {
      alert('Please enter a search query');
      return;
    }

    setLoading(true);
    setError(null);
    setResults(null);

    try {
      const response = await fetch(
        `/api/searchparams?requestString=${encodeURIComponent(query)}&model=${encodeURIComponent(model)}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({
          message: `HTTP error! status: ${response.status}`,
        }));
        throw new Error(
          errorData.message || errorData.error || `HTTP error! status: ${response.status}`
        );
      }

      const data: HydroSearchParameters = await response.json();
      console.log('Found parameters:', data);
      console.log('Start date:', data.startDate);
      console.log('End date:', data.endDate);
      
      // Check if dates might be reversed
      if (data.startDate && data.endDate) {
        const start = new Date(data.startDate);
        const end = new Date(data.endDate);
        if (start > end) {
          console.warn('Warning: startDate is after endDate, they may be reversed');
        }
      }
      
      setResults(data);

      // Query STAC API with found parameters
      if (data.collections && data.collections.length > 0) {
        console.log('Querying STAC API with collections:', data.collections);
        await queryStacApi(data);
      } else {
        console.log('No collections found, skipping STAC query');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const queryStacApi = async (params: HydroSearchParameters) => {
    setLoadingStac(true);
    setStacResults([]);
    setStacError(null);

    try {
      // Build datetime string in ISO8601 format with timezone for STAC API
      // STAC REGARDS expects format like: 2020-03-20T00:00:00Z/2020-06-20T23:59:59Z
      let datetime: string | undefined;
      
      const formatDateForStac = (dateString: string): string => {
        // Parse the date string - backend returns LocalDateTime without timezone (e.g., "2020-03-20T00:00:00")
        // We need to convert to ISO8601 with Z (UTC) timezone
        
        // Remove milliseconds if present
        let cleaned = dateString.replace(/\.\d+$/, '');
        
        // Check if it already has timezone indicator
        if (!cleaned.endsWith('Z') && !cleaned.includes('+') && !cleaned.includes('-', 10)) {
          // No timezone info, append Z for UTC
          cleaned = cleaned + 'Z';
        }
        
        // Validate and parse
        const date = new Date(cleaned);
        if (isNaN(date.getTime())) {
          console.error('Invalid date format:', dateString);
          throw new Error(`Invalid date format: ${dateString}`);
        }
        
        // Return ISO8601 format with Z (always UTC)
        return date.toISOString();
      };

      // Build datetime interval for STAC
      // Use dates directly: startDate (backend) = start (STAC), endDate (backend) = end (STAC)
      // Standard STAC format: datetime where product date >= start AND product date <= end
      // For now, use standard format: start <= end (we'll test if start > end is needed)
      if (params.startDate && params.endDate) {
        let stacStart = formatDateForStac(params.startDate); // startDate becomes start in STAC
        let stacEnd = formatDateForStac(params.endDate); // endDate becomes end in STAC
        
        // Ensure stacStart <= stacEnd in the final STAC request (standard STAC format)
        // If dates are reversed, swap them
        const stacStartDate = new Date(stacStart);
        const stacEndDate = new Date(stacEnd);
        
        if (stacStartDate > stacEndDate) {
          // Swap dates to ensure start <= end (standard STAC format)
          console.log('Swapping dates to ensure start <= end in STAC request (standard format)');
          [stacStart, stacEnd] = [stacEnd, stacStart];
        }
        
        datetime = `${stacStart}/${stacEnd}`;
        console.log('STAC datetime interval:', { 
          backendStartDate: params.startDate, 
          backendEndDate: params.endDate,
          stacStart: stacStart,
          stacEnd: stacEnd,
          stacInterval: datetime,
          startIsBeforeEnd: stacStartDate <= stacEndDate
        });
      } else if (params.startDate) {
        // startDate = start date in STAC
        const start = formatDateForStac(params.startDate);
        datetime = `${start}/..`;
      } else if (params.endDate) {
        // endDate = end date in STAC
        const end = formatDateForStac(params.endDate);
        datetime = `../${end}`;
      }

      console.log('STAC datetime string:', datetime);
      console.log('STAC request params:', {
        startDate: params.startDate,
        endDate: params.endDate,
        datetime: datetime
      });

      const stacRequestBody: any = {
        collections: params.collections,
      };

      if (params.boundingBox && params.boundingBox.length === 4) {
        stacRequestBody.bbox = params.boundingBox.map(parseFloat);
      }

      // Temporarily skip datetime to test if that's the issue
      // Uncomment the following line to test without dates:
      // const skipDates = true;
      const skipDates = false;
      
      if (datetime && !skipDates) {
        stacRequestBody.datetime = datetime;
        console.log('STAC datetime included:', datetime);
      } else if (datetime && skipDates) {
        console.warn('STAC datetime skipped for testing:', datetime);
      } else {
        console.log('No STAC datetime provided');
      }
      
      console.log('STAC request body:', JSON.stringify(stacRequestBody, null, 2));

      const response = await fetch('/api/stac', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(stacRequestBody),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({
          message: `STAC API error: ${response.status}`,
        }));
        throw new Error(
          errorData.message || errorData.error || `STAC API error: ${response.status}`
        );
      }

      const stacData: StacResponse = await response.json();
      
      console.log('STAC API Response:', stacData);
      console.log('Number of features:', stacData.features?.length || 0);
      
      // Group features by collection
      const groupedByCollection: { [key: string]: StacFeature[] } = {};
      
      if (stacData.features && stacData.features.length > 0) {
        stacData.features.forEach((feature) => {
          // STAC features have a 'collection' property at the root level or in properties
          const collectionId = (feature as any).collection || feature.properties?.collection || 'Unknown';
          if (!groupedByCollection[collectionId]) {
            groupedByCollection[collectionId] = [];
          }
          groupedByCollection[collectionId].push(feature);
        });
      }

      // Convert to array format
      const collectionGroups: CollectionGroup[] = Object.entries(groupedByCollection).map(
        ([collectionId, features]) => ({
          collectionId,
          features,
        })
      );

      setStacResults(collectionGroups);
      setStacError(null);
      
      if (collectionGroups.length === 0) {
        setStacError('No results found in STAC catalog for the given parameters.');
      }
    } catch (err) {
      console.error('Error querying STAC API:', err);
      setStacError(err instanceof Error ? err.message : 'Failed to query STAC catalog');
      setStacResults([]);
    } finally {
      setLoadingStac(false);
    }
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <>
      <header className="header">
        <div className="headerContent">
          <a href="#" className="logo">
            Hydrovibe
          </a>
          <nav>
            <a
              href="http://localhost:8080/swagger-ui.html"
              style={{
                color: 'var(--text-secondary)',
                textDecoration: 'none',
                marginLeft: 'var(--spacing-md)',
              }}
            >
              API Docs
            </a>
          </nav>
        </div>
      </header>

      <div className="container">
        <h1 className="pageTitle">Search Hydroweb Products</h1>
        <p className="pageSubtitle">
          Use natural language to find hydrology products from Hydroweb catalog
        </p>

        <div className="searchSection">
          <div className="searchBox">
            <input
              type="text"
              className="searchInput"
              placeholder="What hydrology product do you want? (e.g., 'Lakes water level in July 2023 over France')"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyPress={handleKeyPress}
            />
            <select
              className="modelSelect"
              value={model}
              onChange={(e) => setModel(e.target.value)}
            >
              <option value="MISTRAL_LARGE_LATEST">Mistral Large (Latest)</option>
              <option value="MISTRAL_LARGE">Mistral Large</option>
              <option value="MISTRAL_MEDIUM">Mistral Medium</option>
              <option value="MISTRAL_SMALL">Mistral Small</option>
              <option value="MISTRAL_TINY">Mistral Tiny</option>
            </select>
            <button
              className="searchButton"
              onClick={handleSearch}
              disabled={loading}
            >
              Search
            </button>
          </div>

          {loading && (
            <div className="loading">
              <div className="spinner"></div>
              <div>Analyzing your request...</div>
            </div>
          )}

          {error && <div className="error">Error: {error}</div>}

          {results && (
            <div className="resultCard" style={{ marginTop: '16px' }}>
              <div className="resultCardTitle">Found Parameters</div>
              <div className="resultGrid">
                {/* Collections */}
                <div className="resultItem">
                  <strong>
                    Collections {results.collections && results.collections.length > 0
                      ? `(${results.collections.length})`
                      : ''}
                  </strong>
                  <div className="value">
                    {results.collections && results.collections.length > 0 ? (
                      <div className="collectionsList">
                        {results.collections.map((collection, index) => (
                          <span key={index} className="badge">
                            {collection}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <div>No collections found</div>
                    )}
                  </div>
                </div>

                {/* Dates */}
                {(results.startDate || results.endDate) && (
                  <div className="resultItem">
                    <strong>Date Range</strong>
                    <div className="value">
                      {results.startDate && (
                        <div>Start: {formatDate(results.startDate)}</div>
                      )}
                      {results.endDate && (
                        <div>End: {formatDate(results.endDate)}</div>
                      )}
                    </div>
                  </div>
                )}

                {/* Bounding Box */}
                {results.boundingBox && results.boundingBox.length === 4 && (
                  <div className="resultItem">
                    <strong>Geographic Area</strong>
                    <div className="value">
                      [{results.boundingBox.join(', ')}]
                    </div>
                    <a
                      href={`http://bboxfinder.com/#${results.boundingBox[1]},${results.boundingBox[0]},${results.boundingBox[3]},${results.boundingBox[2]}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      📍 View on Map
                    </a>
                  </div>
                )}
              </div>
            </div>
          )}

        </div>

        {loadingStac && (
          <div className="loading" style={{ marginTop: '24px' }}>
            <div className="spinner"></div>
            <div>Searching STAC catalog...</div>
          </div>
        )}

        {stacError && (
          <div className="error" style={{ marginTop: '24px' }}>
            STAC Catalog Error: {stacError}
          </div>
        )}

        {stacResults.length > 0 && (
          <div className="stacResults">
            <h2 className="resultsTitle">Search Results</h2>
            <div className="collectionsGrid">
              {stacResults.map((group) => (
                <div key={group.collectionId} className="collectionSummaryCard">
                  <div className="collectionSummaryHeader">
                    <h3 className="collectionSummaryTitle">{group.collectionId}</h3>
                    <span className="collectionCount">{group.features.length} items</span>
                  </div>
                  <div className="collectionSummaryContent">
                    <p className="collectionDescription">
                      {group.features.length > 0
                        ? `Collection containing ${group.features.length} hydrology product${group.features.length > 1 ? 's' : ''}`
                        : 'No items available'}
                    </p>
                        {group.features.length > 0 && (
                          <div className="collectionMetadata">
                            {group.features[0].properties?.datetime && (() => {
                              const firstDate = group.features[0].properties.datetime;
                              const lastFeature = group.features[group.features.length - 1];
                              const lastDate = lastFeature?.properties?.datetime;
                              
                              return (
                                <div className="metadataItem">
                                  <strong>Date range:</strong>
                                  <span>
                                    {firstDate && new Date(firstDate).toLocaleDateString('en-US', {
                                      year: 'numeric',
                                      month: 'short',
                                      day: 'numeric',
                                    })}
                                    {group.features.length > 1 && lastDate &&
                                      ` - ${new Date(lastDate).toLocaleDateString('en-US', {
                                        year: 'numeric',
                                        month: 'short',
                                        day: 'numeric',
                                      })}`}
                                  </span>
                                </div>
                              );
                            })()}
                          </div>
                        )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
