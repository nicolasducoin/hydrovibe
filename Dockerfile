# Multi-stage build for Hydrovibe
FROM gradle:8-jdk21 AS build

WORKDIR /app

# Copy Gradle files
COPY build.gradle settings.gradle gradlew* ./
COPY gradle ./gradle

# Copy source code
COPY src ./src

# Build the application
RUN ./gradlew build -x test --no-daemon

# Runtime stage
FROM eclipse-temurin:21-jre-alpine

WORKDIR /app

# Copy the built JAR from build stage
COPY --from=build /app/build/libs/*.jar app.jar

# Expose the application port
EXPOSE 8080

# Set environment variable for API key (can be overridden)
ENV MISTRAL_AI_API_KEY=""

# Run the application
ENTRYPOINT ["java", "-jar", "app.jar"]
