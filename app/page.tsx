'use client';

import { useState, KeyboardEvent } from 'react';

interface HydroSearchParameters {
  collections: string[];
  startDate?: string;
  endDate?: string;
  boundingBox?: string[];
}

export default function Home() {
  const [query, setQuery] = useState('');
  const [model, setModel] = useState('MISTRAL_LARGE_LATEST');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<HydroSearchParameters | null>(null);

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
      setResults(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
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
      </div>
    </>
  );
}
