# Java Version Issue

## Problem
You have **Java 25** installed, but the current Gradle versions (8.14 and earlier) don't fully support Java 25 yet. The project requires **Java 24**.

## Solutions

### Option 1: Install Java 24 (Recommended)

1. **Download Eclipse Temurin 24**:
   - Visit: https://adoptium.net/temurin/releases/
   - Select:
     - Version: **24** (LTS)
     - Operating System: Windows
     - Architecture: x64
     - Package Type: JDK

2. **Install Java 24** alongside Java 25 (they can coexist)

3. **Set JAVA_HOME to Java 24 for this project**:
   ```powershell
   # Find where Java 24 is installed (usually C:\Program Files\Eclipse Adoptium\jdk-24.x.x-hotspot)
   # Then set JAVA_HOME for current session:
   $env:JAVA_HOME = "C:\Program Files\Eclipse Adoptium\jdk-24.0.1+8-hotspot"  # Adjust path as needed
   
   # Verify:
   & "$env:JAVA_HOME\bin\java.exe" -version
   ```

4. **Run the application**:
   ```powershell
   $env:MISTRAL_AI_API_KEY="mz05FfMgHsTFmDOmB6AKcZOaOdBq6w9d"
   .\gradlew.bat bootRun
   ```

### Option 2: Update build.gradle to use Java 25 (If Gradle supports it later)

This would require waiting for Gradle 8.15+ or using a Gradle preview version that supports Java 25.

### Option 3: Use Docker (Easiest)

Docker will use the correct Java version automatically:

```powershell
docker build -t hydrovibe .
docker run -p 8080:8080 -e MISTRAL_AI_API_KEY=mz05FfMgHsTFmDOmB6AKcZOaOdBq6w9d hydrovibe
```

### Option 4: Use SDKMAN (If on WSL)

If you have WSL, you can use SDKMAN to manage multiple Java versions.

## Quick Fix - Check Your Java 24 Installation

Run this to check if you have Java 24 installed somewhere:

```powershell
Get-ChildItem "C:\Program Files\Eclipse Adoptium\" -ErrorAction SilentlyContinue | Where-Object { $_.Name -like "*jdk-24*" } | Select-Object FullName
Get-ChildItem "C:\Program Files\Java\" -ErrorAction SilentlyContinue | Where-Object { $_.Name -like "*24*" } | Select-Object FullName
```

If you find Java 24, set JAVA_HOME to that path before running Gradle.
