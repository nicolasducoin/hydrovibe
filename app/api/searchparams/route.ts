import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const requestString = searchParams.get('requestString');
  const model = searchParams.get('model') || 'MISTRAL_LARGE_LATEST';

  if (!requestString) {
    return NextResponse.json(
      { error: 'BAD_REQUEST', message: 'requestString parameter is required' },
      { status: 400 }
    );
  }

  try {
    const backendUrl = `http://localhost:8080/searchparams?requestString=${encodeURIComponent(requestString)}&model=${encodeURIComponent(model)}`;
    
    const response = await fetch(backendUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({
        error: 'BACKEND_ERROR',
        message: `Backend returned status ${response.status}`,
      }));
      return NextResponse.json(errorData, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error proxying request to backend:', error);
    return NextResponse.json(
      {
        error: 'CONNECTION_ERROR',
        message: 'Failed to connect to backend server. Make sure Spring Boot is running on port 8080.',
      },
      { status: 503 }
    );
  }
}
