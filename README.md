En receptapp för att samla recept — byggd som kursprojekt i DevSecOps.

Spara **externa recept** via URL eller skapa **egna recept** med ingredienser och instruktioner. Recept kan kategoriseras, förses med anteckningar och raderas. Receptsamlingen finns på `/recept`; egna recept har en detaljvy på `/recept/{id}`. Externa recept öppnas i ett nytt fönster.

## Teknik

| Frontend | Next.js, React, TypeScript |
| Backend | ASP.NET Core Web API (.NET 9) |
| Databas | SQLite |
| Tester | xUnit (backend), Playwright BDD (frontend) |

## Förutsättningar

- [Node.js](https://nodejs.org/) 22 (eller senare LTS)
- [.NET 9 SDK](https://dotnet.microsoft.com/download)

## Köra appen

Appen består av två delar: API och frontend. Starta backend först, sedan frontend.

### 1. Backend (API)

```bash
cd backend/RecipeApi
dotnet run --launch-profile http
```

API:t körs på [http://localhost:5029](http://localhost:5029). Swagger finns på `/swagger` i utvecklingsläge.

### 2. Frontend

Kopiera miljövariablerna och installera beroenden:

```bash
cd frontend
cp .env.local.example .env.local   # Windows: copy .env.local.example .env.local
npm install
npm run dev
```

Öppna [http://localhost:3000/recept](http://localhost:3000/recept) i webbläsaren.

`.env.local` pekar frontend mot API:t:

```
NEXT_PUBLIC_USE_MOCK_DATA=false
NEXT_PUBLIC_API_URL=http://localhost:5029
```

Sätt `NEXT_PUBLIC_USE_MOCK_DATA=true` om du vill köra utan backend — då används mock-data i webbläsarens localStorage.

## Tester

**Backend:**

```bash
dotnet test backend/RecipeApp.sln
```

**Frontend (E2E):**

```bash
cd frontend
npx playwright install chromium
npm run test:e2e
```

E2E-testerna startar frontend automatiskt och kör mot mock-data som standard.