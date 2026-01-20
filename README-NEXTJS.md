# Hydrovibe - Next.js Frontend

The frontend has been migrated to Next.js while keeping the Spring Boot backend.

## Project Structure

```
hydrovibe/
├── app/                    # Next.js app directory
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Main page component
│   └── globals.css        # Global styles
├── src/                   # Spring Boot backend (unchanged)
├── package.json           # Next.js dependencies
├── next.config.js         # Next.js configuration
├── tsconfig.json          # TypeScript configuration
└── index.html             # Original HTML (can be removed)
```

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Start Spring Boot Backend

In one terminal:
```bash
./gradlew bootRun
# or on Windows:
gradlew.bat bootRun
```

### 3. Start Next.js Frontend

In another terminal:
```bash
npm run dev
```

The Next.js app will run on http://localhost:3000 and will proxy API requests to the Spring Boot backend at http://localhost:8080.

## Development

- **Frontend**: http://localhost:3000 (Next.js)
- **Backend API**: http://localhost:8080 (Spring Boot)
- **Swagger UI**: http://localhost:8080/swagger-ui.html

## Build for Production

### Build Next.js:
```bash
npm run build
npm start
```

### Build Spring Boot:
```bash
./gradlew build
java -jar build/libs/hydrosearch-0.0.1-SNAPSHOT.jar
```

## Features

- ✅ React components with TypeScript
- ✅ Server-side rendering support
- ✅ API proxy to Spring Boot backend
- ✅ Same UI/UX as before
- ✅ Model selection dropdown
- ✅ Responsive design

## Migration Notes

- The original `index.html` is kept for reference but can be removed
- API calls are proxied through Next.js to avoid CORS issues
- All styles are preserved in `globals.css`
- The component structure matches the original functionality
