# API – curl-exempel

Starta API:t först:

```powershell
cd backend/RecipeApi
dotnet run --launch-profile http
```

Bas-URL: `http://localhost:5029`

Ersätt `{id}` med ett riktigt recept-id från svaret på POST /recipes.

---

## Recept

### Hämta alla recept

```bash
curl -X GET "http://localhost:5029/recipes" -H "Accept: application/json"
```

### Hämta ett recept

```bash
curl -X GET "http://localhost:5029/recipes/{id}" -H "Accept: application/json"
```

### Skapa externt recept (URL)

```bash
curl -X POST "http://localhost:5029/recipes" \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"Pannkakor\",\"url\":\"https://example.com/pannkakor\"}"
```

PowerShell:

```powershell
Invoke-RestMethod -Method Post -Uri "http://localhost:5029/recipes" -ContentType "application/json" -Body '{"name":"Pannkakor","url":"https://example.com/pannkakor"}'
```

### Skapa eget recept

```bash
curl -X POST "http://localhost:5029/recipes" \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"Chokladkaka\",\"ingredients\":\"mjöl, socker, kakao\",\"instructions\":\"Blanda och grädda\"}"
```

### Skapa recept med kategorier

```bash
curl -X POST "http://localhost:5029/recipes" \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"Pannkakor\",\"url\":\"https://example.com/pannkakor\",\"categories\":[\"Frukost\",\"Snabbt\"]}"
```

### Uppdatera recept

```bash
curl -X PUT "http://localhost:5029/recipes/{id}" \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"Morotssoppa\",\"ingredients\":\"Morötter\",\"instructions\":\"Koka\"}"
```

### Radera recept

```bash
curl -X DELETE "http://localhost:5029/recipes/{id}"
```

### Lägg till kategorier på recept

```bash
curl -X POST "http://localhost:5029/recipes/{id}/categories" \
  -H "Content-Type: application/json" \
  -d "{\"names\":[\"Lunch\"]}"
```

### Uppdatera anteckning

```bash
curl -X PATCH "http://localhost:5029/recipes/{id}/notes" \
  -H "Content-Type: application/json" \
  -d "{\"notes\":\"Ta extra vitlök\"}"
```

---

## Kategorier

### Hämta alla kategorier

```bash
curl -X GET "http://localhost:5029/categories" -H "Accept: application/json"
```

---

## Validering (förväntat fel)

### Saknat namn → 400 Bad Request

```bash
curl -X POST "http://localhost:5029/recipes" \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"   \"}"
```

### Saknat innehåll → 400 Bad Request

```bash
curl -X POST "http://localhost:5029/recipes" \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"Tomt recept\"}"
```
