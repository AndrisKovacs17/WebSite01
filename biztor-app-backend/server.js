const path = require('path');
const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = 1212;

const DEFAULT_CORS_ORIGINS = ['https://biztor.hu', 'https://www.biztor.hu'];
const rawCorsOrigins = process.env.CORS_ORIGINS;
const allowedOrigins = (rawCorsOrigins ? rawCorsOrigins.split(',') : DEFAULT_CORS_ORIGINS)
  .map((origin) => origin.trim())
  .filter(Boolean);

const corsOptions = {
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    console.warn(`Nem engedélyezett CORS forrás: ${origin}`);
    return callback(new Error('CORS hozzáférés megtagadva.'));
  },
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Accept', 'X-Requested-With'],
  optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

const FORM_CONFIG = {
  baleset: {
    title: 'Balesetbiztosítás ajánlatkérés',
    subject: 'Új balesetbiztosítási ajánlatkérés érkezett',
  },
  casco: {
    title: 'CASCO biztosítás ajánlatkérés',
    subject: 'Új CASCO ajánlatkérés érkezett',
  },
  egeszseg: {
    title: 'Egészségbiztosítás ajánlatkérés',
    subject: 'Új egészségbiztosítási ajánlatkérés érkezett',
  },
  elet: {
    title: 'Életbiztosítás ajánlatkérés',
    subject: 'Új életbiztosítási ajánlatkérés érkezett',
  },
  kgfb: {
    title: 'KGFB ajánlatkérés',
    subject: 'Új KGFB ajánlatkérés érkezett',
  },
  lakas: {
    title: 'Lakásbiztosítás ajánlatkérés',
    subject: 'Új lakásbiztosítási ajánlatkérés érkezett',
  },
  megtakaritas: {
    title: 'Megtakarítási biztosítás ajánlatkérés',
    subject: 'Új megtakarítási biztosítási ajánlatkérés érkezett',
  },
  mezogazd: {
    title: 'Mezőgazdasági biztosítás ajánlatkérés',
    subject: 'Új mezőgazdasági biztosítási igény érkezett',
  },
  nyugdij: {
    title: 'Nyugdíjbiztosítás ajánlatkérés',
    subject: 'Új nyugdíjbiztosítási igény érkezett',
  },
  'ekarbejelento': {
    title: 'Lakossági e-kárbejelentés',
    subject: 'Új lakossági e-kárbejelentés érkezett',
  },
  'ekarbejelento-corporate': {
    title: 'Vállalati e-kárbejelentés',
    subject: 'Új vállalati e-kárbejelentés érkezett',
  },
  'polgaror-personal': {
    title: 'Polgárőr személyes nyilatkozat',
    subject: 'Új polgárőr személyes nyilatkozat érkezett',
  },
  'polgaror-group': {
    title: 'Polgárőr csoportos nyilatkozat',
    subject: 'Új polgárőr csoportos nyilatkozat érkezett',
  },
  onkentes: {
    title: 'Önkéntes biztosítás ajánlatkérés',
    subject: 'Új önkéntes biztosítási ajánlatkérés érkezett',
  },
  utas: {
    title: 'Utasbiztosítás ajánlatkérés',
    subject: 'Új utasbiztosítási igény érkezett',
  },
  vallalkozas: {
    title: 'Vállalkozásbiztosítás ajánlatkérés',
    subject: 'Új vállalkozásbiztosítási igény érkezett',
  },
  contact: {
    title: 'Kapcsolatfelvétel',
    subject: 'Új kapcsolatfelvételi üzenet érkezett',
  },
  'corporate-appointment': {
    title: 'Céges időpontfoglalás',
    subject: 'Új céges időpontfoglalás érkezett',
  },
  kegyeleti: {
    title: 'Kegyeleti biztosítás ajánlatkérés',
    subject: 'Új kegyeleti biztosítási ajánlatkérés érkezett',
  },
};

const LABEL_OVERRIDES = {
  applicant: 'Ajánlatkérő',
  claimant: 'Bejelentő',
  insured: 'Biztosított',
  policy: 'Biztosítási részletek',
  riders: 'Kiegészítő szolgáltatások',
  health: 'Egészségügyi nyilatkozat',
  claim: 'Káradatok',
  member: 'Polgárőr tag',
  memberAddress: 'Tag lakcíme',
  beneficiary: 'Kedvezményezett',
  association: 'Egyesület',
  company: 'Cég',
  contact: 'Kapcsolattartó',
  attachments: 'Csatolt fájlok',
  meta: 'Metaadatok',
  consent: 'Hozzájárulás',
  privacy: 'Adatkezelési hozzájárulás',
  name: 'Név',
  email: 'E-mail',
  phone: 'Telefon',
  note: 'Megjegyzés',
  dob: 'Születési dátum',
  gender: 'Nem',
  sumInsured: 'Biztosítási összeg',
  deductible: 'Önrész',
  history: 'Egészségügyi előzmény',
  description: 'Leírás',
  estimatedAmount: 'Becsült kárösszeg',
  payoutMethod: 'Kifizetés módja',
  estimatedLoss: 'Becsült kár',
  insurer: 'Biztosító',
  location: 'Helyszín',
  page: 'Oldal',
  form: 'Űrlap',
  date: 'Dátum',
  policyNumber: 'Kötvényszám',
  position: 'Beosztás',
  sharePercent: 'Kedvezményezettség mértéke (%)',
  fitForWork: 'Keresőképesség nyilatkozat',
  sickDaysLast3Months: 'Betegség miatti távollét (nap)',
  disabilityPension: 'TB járadék',
  workAbilityReview: 'Munkaképesség kérelem státusza',
  updates: 'Tájékoztatási hozzájárulás',
  isPresident: 'Elnöki státusz',
  idNumber: 'Igazolványszám',
  zip: 'Irányítószám',
};

const resolvedPort = parseInt(process.env.MAIL_PORT || '465', 10);

const defaultMailSettings = {
  host: process.env.MAIL_HOST || 'smtp.rackhost.hu',
  port: resolvedPort,
  secure:
    process.env.MAIL_SECURE !== undefined
      ? String(process.env.MAIL_SECURE).toLowerCase() !== 'false'
      : resolvedPort === 465,
  user: process.env.MAIL_USER || process.env.MAIL_USERNAME,
  pass: process.env.MAIL_PASS || process.env.MAIL_PASSWORD,
  from: process.env.MAIL_FROM || 'weblap@biztor.hu',
  to: process.env.MAIL_TO || 'iroda@biztor.hu',
};

function createTransport() {
  if (!defaultMailSettings.user || !defaultMailSettings.pass) {
    throw new Error('SMTP hitelesítő adatok hiányoznak. Állítsd be a MAIL_USER és MAIL_PASS változókat.');
  }

  return nodemailer.createTransport({
    host: defaultMailSettings.host,
    port: defaultMailSettings.port,
    secure: defaultMailSettings.secure,
    auth: {
      user: defaultMailSettings.user,
      pass: defaultMailSettings.pass,
    },
  });
}

const transporter = createTransport();

verifyTransporter();

function verifyTransporter() {
  transporter.verify((err) => {
    if (err) {
      console.error('SMTP ellenőrzés sikertelen:', err.message);
    } else {
      console.log('SMTP kapcsolat sikeresen ellenőrizve.');
    }
  });
}

function humanizeKey(key) {
  if (!key) {
    return 'Mező';
  }
  if (LABEL_OVERRIDES[key]) {
    return LABEL_OVERRIDES[key];
  }
  return key
    .replace(/[-_]+/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function flattenEntries(data, prefix = '') {
  const entries = [];

  if (data === null || data === undefined) {
    return entries;
  }

  if (typeof data !== 'object') {
    entries.push([prefix || 'Mező', String(data)]);
    return entries;
  }

  if (Array.isArray(data)) {
    const joined = data.filter(Boolean).join(', ');
    entries.push([prefix || 'Mező', joined]);
    return entries;
  }

  Object.entries(data).forEach(([key, value]) => {
    const label = humanizeKey(key);
    const nextPrefix = prefix ? `${prefix} / ${label}` : label;
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      entries.push(...flattenEntries(value, nextPrefix));
    } else if (Array.isArray(value)) {
      const joined = value.filter(Boolean).join(', ');
      entries.push([nextPrefix, joined]);
    } else if (value !== undefined && value !== null && String(value).trim() !== '') {
      entries.push([nextPrefix, String(value)]);
    }
  });

  return entries;
}

function extractReplyTo(entries) {
  const emailRegex = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i;
  for (const [, value] of entries) {
    if (emailRegex.test(value)) {
      return value.match(emailRegex)[0];
    }
  }
  return null;
}

function buildHtmlBody(meta, entries, req) {
  const rows = entries
    .map(([key, value]) => `<tr><th align="left" style="padding:4px 8px; background:#f6f8fa;">${key}</th><td style="padding:4px 8px;">${value}</td></tr>`)
    .join('');
  const receivedAt = new Date().toLocaleString('hu-HU', { timeZone: 'Europe/Budapest' });
  const referer = req.get('referer') || req.get('origin') || 'ismeretlen';

  return `<!DOCTYPE html><html lang="hu"><head><meta charset="utf-8" /></head><body style="font-family:Arial,Helvetica,sans-serif;">
    <h2 style="color:#1b263b;">${meta.title}</h2>
    <p>Új űrlap érkezett a Biztor weboldaláról.</p>
    <table style="border-collapse:collapse;">${rows}</table>
    <p style="font-size:0.9rem; color:#555;">Beküldve: ${receivedAt}<br/>Forrás oldal: ${referer}</p>
  </body></html>`;
}

function buildTextBody(entries, req) {
  const receivedAt = new Date().toLocaleString('hu-HU', { timeZone: 'Europe/Budapest' });
  const referer = req.get('referer') || req.get('origin') || 'ismeretlen';
  const lines = entries.map(([key, value]) => `${key}: ${value}`);
  lines.push('', `Beküldve: ${receivedAt}`, `Forrás oldal: ${referer}`);
  return lines.join('\n');
}

app.post('/api/forms/:slug', async (req, res) => {
  const { slug } = req.params;
  const config = FORM_CONFIG[slug];

  if (!config) {
    return res.status(404).json({ message: 'Ismeretlen űrlap.' });
  }

  // Honeypot: ha a rejtett 'website' mező ki van töltve, bot küldte – csendesen elfogadjuk
  if (req.body && req.body.website) {
    return res.json({ ok: true, message: 'Köszönjük! Hamarosan felvesszük Önnel a kapcsolatot.' });
  }

  const entries = flattenEntries(req.body);

  if (entries.length === 0) {
    return res.status(400).json({ message: 'Az űrlap üresen érkezett.' });
  }

  const replyTo = extractReplyTo(entries);

  const mailOptions = {
    to: defaultMailSettings.to,
    from: `Biztor Alkusz Weblap <${defaultMailSettings.from}>`,
    subject: config.subject,
    text: buildTextBody(entries, req),
    html: buildHtmlBody(config, entries, req),
  };

  if (replyTo) {
    mailOptions.replyTo = replyTo;
  }

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Levélküldési hiba:', error);
    return res.status(502).json({ message: 'Hiba történt a levél küldése közben.' });
  }

  const successMessage = 'Köszönjük! Hamarosan felvesszük Önnel a kapcsolatot.';
  const acceptsHtml = (req.headers.accept || '').includes('text/html');

  if (acceptsHtml && !(req.headers['x-requested-with'] === 'XMLHttpRequest')) {
    res.send(`<!DOCTYPE html><html lang="hu"><head><meta charset="utf-8" /><title>Köszönjük a beküldést</title></head><body style="font-family:Arial,Helvetica,sans-serif; padding:2rem;">
      <h1>${successMessage}</h1>
      <p><a href="/">Vissza a főoldalra</a></p>
    </body></html>`);
  } else {
    res.json({ ok: true, message: successMessage });
  }
});

app.use((req, res) => {
  res.status(404).json({ message: 'A kért erőforrás nem található.' });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Backend fut a ${PORT} porton.`);
});
