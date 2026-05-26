# Biztor Alkusz Kft. – Backend & Weboldal

Express.js alapú backend és statikus weboldal a [biztor.hu](https://biztor.hu) számára.

## Előfeltételek

- Node.js 18+
- npm 9+

## Telepítés

```bash
npm install
```

## Konfiguráció

Másold le a `.env.example` fájlt `.env` névre és töltsd ki az értékeket:

```bash
cp .env.example .env
```

Kötelező változók:

| Változó | Leírás |
|---|---|
| `SMTP_HOST` | SMTP szerver (pl. `smtp.gmail.com`) |
| `SMTP_PORT` | SMTP port (pl. `587`) |
| `SMTP_USER` | SMTP felhasználónév / email |
| `SMTP_PASS` | SMTP jelszó vagy app-jelszó |
| `ADMIN_EMAIL` | Admin értesítések címzettje |
| `SENDER_EMAIL` | Küldő email cím |

Opcionális változók:

| Változó | Leírás |
|---|---|
| `PORT` | Szerver port (alapértelmezett: `3000`) |
| `CORS_ORIGINS` | Engedélyezett origin-ek vesszővel elválasztva |
| `MAIL_DRY_RUN` | `true` = nem küld valódi emailt (tesztelés) |
| `TRUST_PROXY` | Proxy megbízhatóság (pl. `1`) |

## Futtatás

### Fejlesztési módban (auto-restart)

```bash
npm run dev
```

### Éles módban

```bash
npm start
```

### Email tesztelés (nem küld valódi emailt)

```bash
MAIL_DRY_RUN=true npm start
```

## Build

### Statikus oldalak generálása (`dist/`)

```bash
npm run build:static
```

### Tailwind CSS build

```bash
npm run build:css
```

### Tailwind CSS figyelő (fejlesztéshez)

```bash
npm run watch:css
```

## Egészség-ellenőrzés

```bash
curl http://localhost:3000/health
```

## Tesztelés

```bash
curl -X POST http://localhost:3000/api/forms/kgfb \
  -H "Content-Type: application/json" \
  -d '{"gname":"Teszt","gmail":"teszt@example.com","formType":"kgfb"}'
```

## Projektstruktúra

```
.
├── server.js           # Express backend, form API, email küldés
├── package.json
├── .env.example
├── robots.txt
├── sitemap.xml
├── css/                # Stíluslapok (style.css, tailwind.css, output.css)
├── js/                 # Frontend JS (main.js, multistep-form.js)
├── img/                # Képek
├── sites/              # HTML oldalak forrás
│   ├── ajanlatok/      # Biztosítás-típusonkénti ajánlatkérők
│   ├── infok/          # Tájékoztató cikkek
│   └── *.html          # Főbb oldalak
├── src/
│   └── routes.json     # Build route-lista
├── tools/
│   └── build-static.js # Statikus build szkript
└── dist/               # Generált produkciós fájlok (gitignore-ban)
```

## Deploy

### Render / VPS

1. `npm install`
2. `npm run build:static`
3. Állítsd be a `.env` változókat (vagy Render Environment Variables)
4. `npm start`

### Fontos

- A `dist/` mappa automatikusan generálódik a `npm run build:static` paranccsal
- `npm start` előtt szükséges a build, különben az Express nem talál HTML oldalakat
- Minden form submission a `/api/forms/:formType` endpointra megy
