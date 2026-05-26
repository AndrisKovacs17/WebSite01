const fs = require("fs");
const path = require("path");
const { buildAdminHtml, buildLeadMagnetUserHtml } = require("../server");

const ROOT = path.resolve(__dirname, "..");
const OUT_DIR = path.join(ROOT, "tmp", "email-previews");

fs.mkdirSync(OUT_DIR, { recursive: true });

const previews = [
  {
    file: "lakas-pdf-utmutato.html",
    html: buildLeadMagnetUserHtml({
      guideTitle: "5 hiba, ami miatt a biztosító nem fizeti ki a kárt (2026)",
      serviceLabel: "Lakásbiztosítás",
      guideUrl: "https://biztor.hu/pdf/lakasbiztositas-5-hiba-2026.pdf",
      hasAttachment: true,
    }),
  },
  {
    file: "kgfb-pdf-utmutato.html",
    html: buildLeadMagnetUserHtml({
      guideTitle: "KGFB váltás előtt: 5 kérdés, amit érdemes feltenni (2026)",
      serviceLabel: "KGFB kötelező biztosítás",
      guideUrl: "https://biztor.hu/pdf/kgfb-valtas-5-kerdes-2026.pdf",
      hasAttachment: true,
    }),
  },
  {
    file: "egeszseg-pdf-utmutato.html",
    html: buildLeadMagnetUserHtml({
      guideTitle: "Egészségbiztosítás választás előtt: 5 kérdés, amit érdemes feltenni (2026)",
      serviceLabel: "Egészségbiztosítás",
      guideUrl: "https://biztor.hu/pdf/egeszsegbiztositas-5-kerdes-2026.pdf",
      hasAttachment: true,
    }),
  },
  {
    file: "nyugdij-pdf-utmutato.html",
    html: buildLeadMagnetUserHtml({
      guideTitle: "Nyugdíjbiztosítás előtt: 5 kérdés, amit érdemes feltenni (2026)",
      serviceLabel: "Nyugdíjbiztosítás",
      guideUrl: "https://biztor.hu/pdf/nyugdijbiztositas-5-kerdes-2026.pdf",
      hasAttachment: true,
    }),
  },
  {
    file: "baleset-pdf-utmutato.html",
    html: buildLeadMagnetUserHtml({
      guideTitle: "Balesetbiztosítás előtt: 5 kérdés, amit érdemes feltenni (2026)",
      serviceLabel: "Balesetbiztosítás",
      guideUrl: "https://biztor.hu/pdf/balesetbiztositas-5-kerdes-2026.pdf",
      hasAttachment: true,
    }),
  },
  {
    file: "casco-pdf-utmutato.html",
    html: buildLeadMagnetUserHtml({
      guideTitle: "CASCO kötés előtt: 5 kérdés, amit érdemes feltenni (2026)",
      serviceLabel: "CASCO biztosítás",
      guideUrl: "https://biztor.hu/pdf/casco-5-kerdes-2026.pdf",
      hasAttachment: true,
    }),
  },
  {
    file: "kegyeleti-pdf-utmutato.html",
    html: buildLeadMagnetUserHtml({
      guideTitle: "Kegyeleti biztosítás előtt: 5 kérdés, amit érdemes feltenni (2026)",
      serviceLabel: "Kegyeleti biztosítás",
      guideUrl: "https://biztor.hu/pdf/kegyeleti-5-kerdes-2026.pdf",
      hasAttachment: true,
    }),
  },
  {
    file: "admin-ertesito.html",
    html: buildAdminHtml({
      title: "PDF útmutató kérés: KGFB váltás előtt",
      formType: "kgfb",
      email: "teszt@example.com",
      payload: {
        requestType: "lead_magnet",
        guide: "KGFB váltás előtt: 5 kérdés, amit érdemes feltenni (2026)",
        email: "teszt@example.com",
      },
    }),
  },
];

for (const preview of previews) {
  const document = `<!doctype html>
<html lang="hu">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${preview.file}</title>
</head>
<body style="margin:0;">
${preview.html}
</body>
</html>
`;

  fs.writeFileSync(path.join(OUT_DIR, preview.file), document, "utf8");
}

console.log(`Rendered ${previews.length} email previews into ${path.relative(ROOT, OUT_DIR)}/`);
