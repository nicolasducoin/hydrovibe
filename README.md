# Hydrovibe 🌊

**Hydrovibe** is an AI-powered search tool for hydrology products from Hydroweb. It uses natural language processing to help users find relevant satellite and hydrology data products by describing what they need in plain English.

## Features

- 🤖 **AI-Powered Search**: Uses Mistral AI to understand natural language queries
- 🗺️ **Geographic Extraction**: Automatically extracts bounding boxes from location names
- 📅 **Date Range Detection**: Parses temporal queries (e.g., "summer 2024", "July 2023")
- 📊 **Collection Matching**: Intelligently matches queries to relevant hydrology product collections
- 🎨 **Modern Web UI**: Clean, responsive interface for easy interaction
- 🔧 **RESTful API**: Easy-to-use API for integration with other tools
- 📚 **API Documentation**: Interactive Swagger/OpenAPI documentation

## Prerequisites

- Java 21 or higher
- Gradle 8+ (or use the included Gradle Wrapper)
- Mistral AI API key ([Get one here](https://mistral.ai/))

## Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/nicolasducoin/hydrovibe.git
cd hydrovibe
```

### 2. Configure API Key

Set your Mistral AI API key either via:

**Option A: Environment Variable (Recommended)**
```bash
export MISTRAL_AI_API_KEY=your-api-key-here
```

**Option B: Application Properties**
Edit `src/main/resources/application.properties`:
```properties
mistral.ai.api-key=your-api-key-here
```

### 3. Build and Run

**Using Gradle Wrapper (Windows):**
```bash
gradlew.bat bootRun
```

**Using Gradle Wrapper (Linux/Mac):**
```bash
./gradlew bootRun
```

**Or build the JAR:**
```bash
./gradlew build
java -jar build/libs/hydrovibe-0.0.1-SNAPSHOT.jar
```

### 4. Access the Application

- **Web UI**: Open `index.html` in your browser (or serve it via a web server)
- **API**: `http://localhost:8080/searchparams?requestString=your+query`
- **Swagger UI**: `http://localhost:8080/swagger-ui.html`
- **OpenAPI Docs**: `http://localhost:8080/api-docs`

## Usage Examples

### Web Interface

1. Open `index.html` in your browser
2. Enter a natural language query like:
   - "Lakes water level in July 2023 over France"
   - "Total water over England"
   - "Snow over the Alps in winter 2024"
   - "River discharge in the Amazon basin"
3. Click "Search" and view the extracted parameters

### API Endpoint

```bash
curl "http://localhost:8080/searchparams?requestString=Lakes%20water%20level%20in%20July%202023"
```

**Response:**
```json
{
  "collections": [
    "HYDROWEB_LAKES_RESEARCH",
    "SWOT_L2_HR_LAKESP_OBS",
    "SWOT_L2_HR_LAKESP_PRIOR",
    "HYDROWEB_LAKES_OPE"
  ],
  "startDate": "2023-07-01T00:00:00",
  "endDate": "2023-07-31T23:59:59",
  "boundingBox": ["-5.14", "41.37", "9.56", "51.12"]
}
```

## Running with Docker

### Build and Run with Docker

```bash
# Build the image
docker build -t hydrovibe .

# Run the container
docker run -p 8080:8080 -e MISTRAL_AI_API_KEY=your-api-key-here hydrovibe
```

### Using Docker Compose

```bash
# Set your API key in environment or .env file
export MISTRAL_AI_API_KEY=your-api-key-here

# Start the service
docker-compose up -d

# View logs
docker-compose logs -f

# Stop the service
docker-compose down
```

## API Documentation

### GET `/searchparams`

Search for hydrology products using natural language.

**Parameters:**
- `requestString` (required): Natural language query describing what you're looking for

**Example:**
```
GET /searchparams?requestString=Lakes%20water%20level%20in%20July%202023%20over%20France
```

**Response:**
```json
{
  "collections": ["HYDROWEB_LAKES_RESEARCH", "SWOT_L2_HR_LAKESP_OBS"],
  "startDate": "2023-07-01T00:00:00",
  "endDate": "2023-07-31T23:59:59",
  "boundingBox": ["-5.14", "41.37", "9.56", "51.12"]
}
```

**Error Response (400):**
```json
{
  "error": "BAD_REQUEST",
  "message": "requestString parameter is required and cannot be empty"
}
```

Interactive API documentation is available at http://localhost:8080/swagger-ui.html when the application is running.

## Architecture

### Project Structure

```
hydrovibe/
├── src/
│   ├── main/
│   │   ├── java/pro/ducoin/hydrosearch/
│   │   │   ├── HydrosearchApplication.java    # Spring Boot entry point
│   │   │   ├── HydroSearchController.java     # REST API controller
│   │   │   ├── HydroSearchService.java        # Business logic
│   │   │   ├── HydroSearchParameters.java     # Data model
│   │   │   ├── ApiKeys.java                   # API key fallback
│   │   │   └── ErrorResponse.java             # Error response model
│   │   └── resources/
│   │       ├── application.properties         # Configuration
│   │       └── collections.json               # Product collection definitions
├── index.html                                  # Web UI
├── build.gradle                                # Build configuration
├── Dockerfile                                  # Docker configuration
├── docker-compose.yml                          # Docker Compose configuration
└── README.md                                   # This file
```

### Key Components

1. **HydroSearchController**: Handles HTTP requests and responses with OpenAPI documentation
2. **HydroSearchService**: Contains the core business logic for AI-powered parameter extraction
3. **Collections JSON**: Defines available hydrology product collections

### Technology Stack

- **Java 21**: Programming language
- **Spring Boot 3.5.0**: Web framework
- **LangChain4j 1.0.1**: AI/LLM integration framework
- **Mistral AI**: Large Language Model provider
- **SpringDoc OpenAPI 2.3.0**: API documentation
- **JSON.org**: JSON processing
- **Apache Commons IO**: File/resource utilities

## Development

### Building the Project

```bash
./gradlew build
```

### Running Tests

```bash
./gradlew test
```

### Running Locally

```bash
./gradlew bootRun
```

## Troubleshooting

### API Key Issues

If you see: `Mistral AI API key must be configured`

- Ensure your API key is set in `application.properties` or as the `MISTRAL_AI_API_KEY` environment variable
- Check that the API key is valid and has not expired

### Resource Loading Issues

If collections.json cannot be loaded:

- Ensure `collections.json` is in `src/main/resources/`
- Rebuild the project if you made changes

### Port Already in Use

If port 8080 is already in use:

- Change `server.port` in `application.properties`
- Or stop the process using port 8080

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

[Add your license here]

## Acknowledgments

- Built with [Spring Boot](https://spring.io/projects/spring-boot)
- AI powered by [Mistral AI](https://mistral.ai/)
- Using [LangChain4j](https://github.com/langchain4j/langchain4j) for LLM integration

## Roadmap

- [ ] Add unit and integration tests
- [ ] Caching of AI responses
- [ ] Rate limiting
- [ ] Authentication/authorization
- [ ] Support for additional LLM providers

## Support

For issues and questions, please open an issue on GitHub.
