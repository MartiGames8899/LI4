# Build Stage
FROM mcr.microsoft.com/dotnet/sdk:7.0 AS build
WORKDIR /app

# Copy the entire src directory (which contains CAP.API, Modules, CAP.Shared)
COPY src/ ./src/

# Restore dependencies for the API
RUN dotnet restore src/CAP.API/CAP.API.csproj

# Build and Publish the API
RUN dotnet publish src/CAP.API/CAP.API.csproj -c Release -o /app/publish /p:UseAppHost=false

# Runtime Stage
FROM mcr.microsoft.com/dotnet/aspnet:7.0 AS runtime
WORKDIR /app

# Set the URL to listen on port 80 (standard for container internals)
ENV ASPNETCORE_URLS=http://+:80

# Copy the published output from the build stage
COPY --from=build /app/publish .

# Expose port 80
EXPOSE 80

# Start the application
ENTRYPOINT ["dotnet", "CAP.API.dll"]
