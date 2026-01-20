# Java Setup Guide for Hydrovibe

## Problem
The application requires **Java 24** to run, but Java is not currently installed or not in your PATH.

## Solution Options

### Option 1: Install Java 24 (Recommended)

1. **Download Eclipse Temurin 24** (OpenJDK):
   - Visit: https://adoptium.net/temurin/releases/
   - Select:
     - Version: 24
     - Operating System: Windows
     - Architecture: x64
     - Package Type: JDK

2. **Install Java:**
   - Run the installer
   - Make sure to check "Add to PATH" during installation
   - Or manually add the Java bin directory to your PATH

3. **Verify Installation:**
   ```powershell
   java -version
   ```
   Should show version 24.x.x

4. **Set JAVA_HOME (if not automatically set):**
   ```powershell
   # For current session:
   $env:JAVA_HOME = "C:\Program Files\Eclipse Adoptium\jdk-24.x.x-hotspot"
   
   # To set permanently:
   [System.Environment]::SetEnvironmentVariable("JAVA_HOME", "C:\Program Files\Eclipse Adoptium\jdk-24.x.x-hotspot", "User")
   ```

### Option 2: Use SDKMAN (if available on Windows via WSL)

If you have WSL (Windows Subsystem for Linux), you can use SDKMAN to manage Java versions.

### Option 3: Use Docker (Already Configured)

Instead of installing Java directly, you can use Docker:

```powershell
# Build and run with Docker
docker build -t hydrovibe .
docker run -p 8080:8080 -e MISTRAL_AI_API_KEY=mz05FfMgHsTFmDOmB6AKcZOaOdBq6w9d hydrovibe
```

### Option 4: Use Java Version Manager (Jabba for Windows)

1. Install Jabba: https://github.com/shyiko/jabba
2. Install Java 24:
   ```powershell
   jabba install openjdk@24
   jabba use openjdk@24
   ```

## After Installing Java

1. **Verify Java is accessible:**
   ```powershell
   java -version
   ```

2. **Run the application:**
   ```powershell
   $env:MISTRAL_AI_API_KEY="mz05FfMgHsTFmDOmB6AKcZOaOdBq6w9d"
   .\gradlew.bat bootRun
   ```

## Checking Logs

Once the application is running, you'll see the logs directly in the terminal. The application typically shows:
- Spring Boot banner
- Starting application messages
- "Started HydrosearchApplication in X seconds"
- Any errors or warnings

If there are errors, they will appear in the console output.
