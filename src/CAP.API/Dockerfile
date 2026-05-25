# Build stage
FROM mcr.microsoft.com/dotnet/sdk:7.0 AS build
WORKDIR /src

# Copy csproj files and restore dependencies
COPY src/CAP.API/CAP.API.csproj CAP.API/
COPY src/CAP.Shared/CAP.Shared.csproj CAP.Shared/
COPY src/Modules/Users/CAP.Modules.Users.Core/CAP.Modules.Users.Core.csproj Modules/Users/CAP.Modules.Users.Core/
COPY src/Modules/Users/CAP.Modules.Users.Data/CAP.Modules.Users.Data.csproj Modules/Users/CAP.Modules.Users.Data/
COPY src/Modules/Users/CAP.Modules.Users.Api/CAP.Modules.Users.Api.csproj Modules/Users/CAP.Modules.Users.Api/
COPY src/Modules/Sports/CAP.Modules.Sports.Core/CAP.Modules.Sports.Core.csproj Modules/Sports/CAP.Modules.Sports.Core/
COPY src/Modules/Sports/CAP.Modules.Sports.Data/CAP.Modules.Sports.Data.csproj Modules/Sports/CAP.Modules.Sports.Data/
COPY src/Modules/Sports/CAP.Modules.Sports.Api/CAP.Modules.Sports.Api.csproj Modules/Sports/CAP.Modules.Sports.Api/
COPY src/Modules/Clinical/CAP.Modules.Clinical.Core/CAP.Modules.Clinical.Core.csproj Modules/Clinical/CAP.Modules.Clinical.Core/
COPY src/Modules/Clinical/CAP.Modules.Clinical.Data/CAP.Modules.Clinical.Data.csproj Modules/Clinical/CAP.Modules.Clinical.Data/
COPY src/Modules/Clinical/CAP.Modules.Clinical.Api/CAP.Modules.Clinical.Api.csproj Modules/Clinical/CAP.Modules.Clinical.Api/
COPY src/Modules/Finance/CAP.Modules.Finance.Core/CAP.Modules.Finance.Core.csproj Modules/Finance/CAP.Modules.Finance.Core/
COPY src/Modules/Finance/CAP.Modules.Finance.Data/CAP.Modules.Finance.Data.csproj Modules/Finance/CAP.Modules.Finance.Data/
COPY src/Modules/Finance/CAP.Modules.Finance.Api/CAP.Modules.Finance.Api.csproj Modules/Finance/CAP.Modules.Finance.Api/
COPY src/Modules/Notifications/CAP.Modules.Notifications.Core/CAP.Modules.Notifications.Core.csproj Modules/Notifications/CAP.Modules.Notifications.Core/
COPY src/Modules/Notifications/CAP.Modules.Notifications.Data/CAP.Modules.Notifications.Data.csproj Modules/Notifications/CAP.Modules.Notifications.Data/
COPY src/Modules/Notifications/CAP.Modules.Notifications.Api/CAP.Modules.Notifications.Api.csproj Modules/Notifications/CAP.Modules.Notifications.Api/
COPY src/Modules/Facilities/CAP.Modules.Facilities.Core/CAP.Modules.Facilities.Core.csproj Modules/Facilities/CAP.Modules.Facilities.Core/
COPY src/Modules/Facilities/CAP.Modules.Facilities.Data/CAP.Modules.Facilities.Data.csproj Modules/Facilities/CAP.Modules.Facilities.Data/
COPY src/Modules/Facilities/CAP.Modules.Facilities.Api/CAP.Modules.Facilities.Api.csproj Modules/Facilities/CAP.Modules.Facilities.Api/
COPY src/Modules/Reports/CAP.Modules.Reports.Core/CAP.Modules.Reports.Core.csproj Modules/Reports/CAP.Modules.Reports.Core/
COPY src/Modules/Reports/CAP.Modules.Reports.Data/CAP.Modules.Reports.Data.csproj Modules/Reports/CAP.Modules.Reports.Data/
COPY src/Modules/Reports/CAP.Modules.Reports.Api/CAP.Modules.Reports.Api.csproj Modules/Reports/CAP.Modules.Reports.Api/

WORKDIR /src/CAP.API
RUN dotnet restore

# Copy everything else and build
WORKDIR /src
COPY src/ .

WORKDIR /src/CAP.API
RUN dotnet build -c Release -o /app/build

# Publish stage
FROM build AS publish
RUN dotnet publish -c Release -o /app/publish /p:UseAppHost=false

# Runtime stage
FROM mcr.microsoft.com/dotnet/aspnet:7.0 AS final
WORKDIR /app
COPY --from=publish /app/publish .

EXPOSE 5000
ENV ASPNETCORE_URLS=http://+:5000

ENTRYPOINT ["dotnet", "CAP.API.dll"]
