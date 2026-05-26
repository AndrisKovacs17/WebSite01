const cors = require("cors");
const dotenv = require("dotenv");
const express = require("express");
const fs = require("fs");
const nodemailer = require("nodemailer");
const path = require("path");

dotenv.config();

const app = express();
const port = Number(process.env.PORT || 3000);
const mailDryRun = process.env.MAIL_DRY_RUN === "true";

if (process.env.TRUST_PROXY) {
  app.set("trust proxy", process.env.TRUST_PROXY);
}
const emailTemplateVersion = "biztor-email-showcase-v2-2026-04";
const emailTemplateLabel = "Biztor email sablon: showcase v2 / 2026.04";

const allowedOrigins = new Set((process.env.CORS_ORIGINS ||
  "https://biztor.hu,https://www.biztor.hu,http://localhost:3000,http://127.0.0.1:3000")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean));

const guideConfig = {
  lakas: {
    serviceLabel: "Lakásbiztosítás",
    defaultGuideTitle: "5 hiba, ami miatt a biztosító nem fizeti ki a kárt (2026)",
    fileEnv: "GUIDE_LAKAS_FILE",
    urlEnv: "GUIDE_LAKAS_URL",
  },
  kgfb: {
    serviceLabel: "KGFB kötelező biztosítás",
    defaultGuideTitle: "KGFB váltás előtt: 5 kérdés, amit érdemes feltenni (2026)",
    fileEnv: "GUIDE_KGFB_FILE",
    urlEnv: "GUIDE_KGFB_URL",
  },
  egeszseg: {
    serviceLabel: "Egészségbiztosítás",
    defaultGuideTitle: "Egészségbiztosítás választás előtt: 5 kérdés, amit érdemes feltenni (2026)",
    fileEnv: "GUIDE_EGESZSEG_FILE",
    urlEnv: "GUIDE_EGESZSEG_URL",
  },
  megtakaritas: {
    serviceLabel: "Megtakarítási biztosítás",
    defaultGuideTitle: "Megtakarítási biztosítás előtt: 7 kérdés, amit érdemes feltenni",
    fileEnv: "GUIDE_MEGTAKARITAS_FILE",
    urlEnv: "GUIDE_MEGTAKARITAS_URL",
  },
  nyugdij: {
    serviceLabel: "Nyugdíjbiztosítás",
    defaultGuideTitle: "Nyugdíjbiztosítás előtt: 5 kérdés, amit érdemes feltenni (2026)",
    fileEnv: "GUIDE_NYUGDIJ_FILE",
    urlEnv: "GUIDE_NYUGDIJ_URL",
  },
  baleset: {
    serviceLabel: "Balesetbiztosítás",
    defaultGuideTitle: "Balesetbiztosítás előtt: 5 kérdés, amit érdemes feltenni (2026)",
    fileEnv: "GUIDE_BALESET_FILE",
    urlEnv: "GUIDE_BALESET_URL",
  },
  casco: {
    serviceLabel: "CASCO biztosítás",
    defaultGuideTitle: "CASCO kötés előtt: 5 kérdés, amit érdemes feltenni (2026)",
    fileEnv: "GUIDE_CASCO_FILE",
    urlEnv: "GUIDE_CASCO_URL",
  },
  kegyeleti: {
    serviceLabel: "Kegyeleti biztosítás",
    defaultGuideTitle: "Kegyeleti biztosítás előtt: 5 kérdés, amit érdemes feltenni (2026)",
    fileEnv: "GUIDE_KEGYELETI_FILE",
    urlEnv: "GUIDE_KEGYELETI_URL",
  },
  eletbiztositas: {
    serviceLabel: "Életbiztosítás",
    defaultGuideTitle: "Életbiztosítás előtt: 5 kérdés, amit érdemes feltenni (2026)",
    fileEnv: "GUIDE_ELET_FILE",
    urlEnv: "GUIDE_ELET_URL",
  },
  elet: {
    serviceLabel: "Életbiztosítás",
    defaultGuideTitle: "Életbiztosítás előtt: 5 kérdés, amit érdemes feltenni (2026)",
    fileEnv: "GUIDE_ELET_FILE",
    urlEnv: "GUIDE_ELET_URL",
  },
  vallalkozas: {
    serviceLabel: "Vállalkozásbiztosítás",
    defaultGuideTitle: "5 hiba, ami miatt nem fizet a biztosító",
    fileEnv: "GUIDE_VALLALKOZAS_FILE",
    urlEnv: "GUIDE_VALLALKOZAS_URL",
  },
};

const recentRequests = new Map();

app.use(
  cors({
    origin(origin, callback) {
      if (isAllowedOrigin(origin)) {
        callback(null, true);
        return;
      }
      callback(null, false);
    },
    methods: ["GET", "POST", "OPTIONS"],
  })
);
app.use((_req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "SAMEORIGIN");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  next();
});
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));

app.get("/health", (_req, res) => {
  res.json({ ok: true, emailTemplateVersion });
});

app.post("/api/forms/:formType", async (req, res) => {
  try {
    const formType = sanitizeKey(req.params.formType);
    const payload = normalizePayload(req.body || {});

    if (payload.website) {
      res.json({ ok: true, message: "Köszönjük!" });
      return;
    }

    const email = findPayloadEmail(payload);
    if (!email) {
      res.status(400).json({
        ok: false,
        message: "Kérjük, adjon meg érvényes e-mail címet.",
      });
      return;
    }

    if (isRateLimited(req, email)) {
      res.status(429).json({
        ok: false,
        message: "Túl sok beküldés érkezett rövid időn belül. Kérjük, próbálja meg később.",
      });
      return;
    }

    const isLeadMagnet = payload.requestType === "lead_magnet";
    if (isLeadMagnet) {
      await sendLeadMagnetEmail(formType, email, payload);
      res.json({
        ok: true,
        message: "Köszönjük! Az útmutatót elküldtük a megadott e-mail címre.",
      });
      return;
    }

    await sendGeneralFormEmail(formType, email, payload);
    res.json({
      ok: true,
      message: "Köszönjük! Hamarosan felvesszük Önnel a kapcsolatot.",
    });
  } catch (error) {
    console.error("Form submit error:", error.message || error);
    res.status(500).json({
      ok: false,
      message: "Nem sikerült elküldeni az űrlapot. Kérjük, próbálja meg később.",
    });
  }
});

const distDir = path.join(__dirname, "dist");

if (fs.existsSync(distDir)) {
  app.use(express.static(distDir));
  app.get("*", (req, res, next) => {
    const cleanPath = req.path.replace(/^\/+|\/+$/g, "");
    if (!cleanPath) {
      next();
      return;
    }

    const pagesDir = path.join(distDir, "pages");
    const pagePath = path.join(pagesDir, `${cleanPath}.html`);
    if (!pagePath.startsWith(pagesDir + path.sep)) {
      next();
      return;
    }

    if (fs.existsSync(pagePath)) {
      res.sendFile(pagePath);
      return;
    }

    next();
  });

  const notFoundPage = path.join(distDir, "404.html");
  app.use((_req, res) => {
    if (fs.existsSync(notFoundPage)) {
      res.status(404).sendFile(notFoundPage);
    } else {
      res.status(404).json({ ok: false, message: "Az oldal nem található." });
    }
  });
}

if (require.main === module) {
  if (!mailDryRun && (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS)) {
    console.warn("[figyelmeztetés] SMTP_HOST, SMTP_USER vagy SMTP_PASS nincs beállítva. Az email küldés nem fog működni. Teszteléshez állítsa be a MAIL_DRY_RUN=true értéket.");
  }
  app.listen(port, () => {
    console.log(`Biztor form API listening on port ${port}`);
  });
}

function getTransporter() {
  if (mailDryRun) {
    return nodemailer.createTransport({ jsonTransport: true });
  }

  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    throw new Error("Hiányzó SMTP beállítás. Ellenőrizze az SMTP_HOST, SMTP_USER és SMTP_PASS értékeket.");
  }

  return nodemailer.createTransport({
    host,
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === "true",
    requireTLS: process.env.SMTP_REQUIRE_TLS === "true",
    tls: {
      rejectUnauthorized: process.env.SMTP_TLS_REJECT_UNAUTHORIZED !== "false",
    },
    auth: { user, pass },
  });
}

async function sendLeadMagnetEmail(formType, email, payload) {
  const config = guideConfig[formType] || {
    serviceLabel: formType.toUpperCase(),
    defaultGuideTitle: payload.guide || "Biztor útmutató",
  };

  const guideTitle = payload.guide || config.defaultGuideTitle;
  const guideUrl = process.env[config.urlEnv];
  const attachment = resolveGuideAttachment(config);
  const from = process.env.MAIL_FROM || process.env.SMTP_USER || "Biztor Alkusz <no-reply@biztor.hu>";
  const replyTo = process.env.MAIL_REPLY_TO || "iroda@biztor.hu";
  const adminTo = process.env.MAIL_TO || "iroda@biztor.hu";

  const userHtml = buildLeadMagnetUserHtml({
    guideTitle,
    serviceLabel: config.serviceLabel,
    guideUrl,
    hasAttachment: Boolean(attachment),
  });

  const adminHtml = buildAdminHtml({
    title: `PDF útmutató kérés: ${guideTitle}`,
    formType,
    email,
    payload,
  });

  const transporter = getTransporter();

  await transporter.sendMail({
    from,
    to: email,
    bcc: process.env.LEAD_BCC || undefined,
    replyTo,
    subject: `${guideTitle} - Biztor Alkusz`,
    headers: { "X-Biztor-Template": emailTemplateVersion },
    html: userHtml,
    attachments: attachment ? [attachment] : [],
  });

  await transporter.sendMail({
    from,
    to: adminTo,
    subject: `Új PDF útmutató kérés - ${config.serviceLabel}`,
    headers: { "X-Biztor-Template": emailTemplateVersion },
    html: adminHtml,
  });
}

async function sendGeneralFormEmail(formType, email, payload) {
  const from = process.env.MAIL_FROM || process.env.SMTP_USER || "Biztor Alkusz <no-reply@biztor.hu>";
  const adminTo = process.env.MAIL_TO || "iroda@biztor.hu";
  const transporter = getTransporter();

  await transporter.sendMail({
    from,
    to: adminTo,
    replyTo: email,
    subject: `Új ajánlatkérés - ${formType}`,
    headers: { "X-Biztor-Template": emailTemplateVersion },
    html: buildAdminHtml({
      title: `Új ajánlatkérés: ${formType}`,
      formType,
      email,
      payload,
    }),
  });
}

function buildLeadMagnetUserHtml({ guideTitle, serviceLabel, guideUrl, hasAttachment }) {
  const downloadBlock = guideUrl
    ? `
      <tr>
        <td style="padding:4px 0 18px;">
          <a href="${escapeHtml(guideUrl)}" style="display:inline-block;background:#ff9f1c;color:#15233c;padding:13px 22px;border-radius:999px;text-decoration:none;font-weight:700;font-size:15px;box-shadow:0 8px 18px rgba(255,122,0,.22);">PDF útmutató megnyitása</a>
        </td>
      </tr>`
    : "";

  const attachmentText = hasAttachment
    ? "A PDF útmutatót csatolmányként is elküldtük."
    : "Ha a csatolmány nem jelenik meg, válaszoljon erre az e-mailre, és kollégánk segít.";

  return `
    <!-- ${emailTemplateVersion} -->
    <div style="display:none;max-height:0;overflow:hidden;color:#f6f7fc;">A kért Biztor PDF útmutató megérkezett.</div>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="width:100%;margin:0;padding:0;background:#f6f7fc;font-family:Arial,Helvetica,sans-serif;color:#15233c;">
      <tr>
        <td align="center" style="padding:28px 14px;">
          <table role="presentation" width="640" cellspacing="0" cellpadding="0" style="width:100%;max-width:640px;border-collapse:separate;border-spacing:0;">
            <tr>
              <td style="padding:28px 28px 24px;border-radius:18px 18px 0 0;background:#ff9f1c;background-image:linear-gradient(135deg,#ffb13b 0%,#ff8a00 58%,#e95f00 100%);color:#fff;">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                  <tr>
                    <td style="padding:0 0 22px;">
                      <img src="https://biztor.hu/img/icon/biztorlogo.png" width="142" alt="Biztor Alkusz" style="display:block;width:142px;max-width:142px;height:auto;padding:8px 10px;border-radius:10px;background:#fff;">
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <p style="margin:0 0 10px;font-size:12px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#fff4df;">PDF útmutató</p>
                      <h1 style="margin:0;font-size:28px;line-height:1.18;font-weight:800;color:#fff;">Köszönjük az érdeklődést!</h1>
                      <p style="margin:12px 0 0;font-size:16px;line-height:1.55;color:#fff9ef;">A kért útmutatót elküldtük, hogy könnyebben átlássa a biztosítási döntési pontokat.</p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding:28px;background:#fff;border:1px solid #edf0f5;border-top:0;border-radius:0 0 18px 18px;box-shadow:0 14px 35px rgba(21,35,60,.08);">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                  <tr>
                    <td style="padding:0 0 14px;">
                      <p style="margin:0 0 8px;font-size:13px;color:#667085;">Kért anyag</p>
                      <h2 style="margin:0;font-size:21px;line-height:1.25;color:#15233c;">${escapeHtml(guideTitle)}</h2>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:0 0 18px;">
                      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:separate;border-spacing:0 10px;">
                        <tr>
                          <td style="padding:14px 16px;border:1px solid #ffe0ac;border-radius:12px;background:#fff8ed;">
                            <strong style="display:block;margin:0 0 4px;color:#15233c;">Téma</strong>
                            <span style="color:#5c6575;">${escapeHtml(serviceLabel)}</span>
                          </td>
                        </tr>
                        <tr>
                          <td style="padding:14px 16px;border:1px solid #d8eadf;border-radius:12px;background:#f4fbf7;">
                            <strong style="display:block;margin:0 0 4px;color:#15233c;">Kézbesítés</strong>
                            <span style="color:#5c6575;">${escapeHtml(attachmentText)}</span>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                  ${downloadBlock}
                  <tr>
                    <td style="padding:18px 18px;border-radius:14px;background:#15233c;color:#fff;">
                      <p style="margin:0 0 6px;font-size:16px;font-weight:700;color:#fff;">Kérdése van a biztosítással kapcsolatban?</p>
                      <p style="margin:0;font-size:14px;line-height:1.55;color:#e9edf4;">Válaszoljon erre az e-mailre, vagy hívjon minket: <a href="tel:+36706258201" style="color:#ffb13b;text-decoration:none;font-weight:700;">+36 70 625 8201</a>.</p>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:22px 0 0;color:#667085;font-size:13px;line-height:1.55;">
                      Üdvözlettel,<br><strong style="color:#15233c;">Biztor Alkusz Kft.</strong><br>
                      <a href="https://biztor.hu" style="color:#ff8a00;text-decoration:none;font-weight:700;">biztor.hu</a>
                      <div style="margin-top:10px;color:#98a2b3;font-size:11px;line-height:1.4;">${escapeHtml(emailTemplateLabel)}</div>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  `;
}

function buildAdminHtml({ title, formType, email, payload }) {
  const rows = Object.entries(payload)
    .map(([key, value]) => {
      const displayValue = typeof value === "object" ? JSON.stringify(value, null, 2) : String(value);
      return `
        <tr>
          <th style="width:34%;text-align:left;vertical-align:top;padding:12px 14px;border-bottom:1px solid #edf0f5;color:#15233c;font-size:13px;background:#fff8ed;">${escapeHtml(key)}</th>
          <td style="padding:12px 14px;border-bottom:1px solid #edf0f5;white-space:pre-wrap;color:#344054;font-size:13px;">${escapeHtml(displayValue)}</td>
        </tr>`;
    })
    .join("");

  return `
    <!-- ${emailTemplateVersion} -->
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="width:100%;margin:0;padding:0;background:#f6f7fc;font-family:Arial,Helvetica,sans-serif;color:#15233c;">
      <tr>
        <td align="center" style="padding:24px 12px;">
          <table role="presentation" width="720" cellspacing="0" cellpadding="0" style="width:100%;max-width:720px;">
            <tr>
              <td style="padding:22px 24px;border-radius:16px 16px 0 0;background:#15233c;color:#fff;">
                <p style="margin:0 0 8px;font-size:12px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#ffb13b;">Biztor weboldal</p>
                <h1 style="margin:0;font-size:24px;line-height:1.25;color:#fff;">${escapeHtml(title)}</h1>
              </td>
            </tr>
            <tr>
              <td style="padding:20px 24px;background:#fff;border:1px solid #edf0f5;border-top:0;border-radius:0 0 16px 16px;box-shadow:0 12px 30px rgba(21,35,60,.07);">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:0 0 18px;border-collapse:separate;border-spacing:0 8px;">
                  <tr>
                    <td style="padding:13px 15px;border-radius:12px;background:#fff8ed;border:1px solid #ffe0ac;">
                      <strong style="color:#15233c;">Űrlap:</strong>
                      <span style="color:#5c6575;">${escapeHtml(formType)}</span>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:13px 15px;border-radius:12px;background:#f4fbf7;border:1px solid #d8eadf;">
                      <strong style="color:#15233c;">E-mail:</strong>
                      <a href="mailto:${escapeHtml(email)}" style="color:#ff8a00;text-decoration:none;font-weight:700;">${escapeHtml(email)}</a>
                    </td>
                  </tr>
                </table>
                <table style="border-collapse:collapse;width:100%;border:1px solid #edf0f5;border-radius:12px;overflow:hidden;">${rows}</table>
                <div style="padding-top:14px;color:#98a2b3;font-size:11px;line-height:1.4;">${escapeHtml(emailTemplateLabel)}</div>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  `;
}

function resolveGuideAttachment(config) {
  const fileValue = process.env[config.fileEnv];
  if (!fileValue) {
    return null;
  }

  const filePath = path.isAbsolute(fileValue) ? fileValue : path.join(__dirname, fileValue);
  if (!fs.existsSync(filePath)) {
    console.warn(`Guide file not found: ${filePath}`);
    return null;
  }

  return {
    filename: path.basename(filePath),
    path: filePath,
  };
}

function normalizePayload(payload) {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    return {};
  }

  const normalized = {};
  Object.entries(payload).forEach(([key, value]) => {
    normalized[sanitizeKey(key)] = normalizeValue(value);
  });
  return normalized;
}

function normalizeValue(value) {
  if (typeof value === "string") {
    return value.trim();
  }

  if (Array.isArray(value)) {
    return value.map(normalizeValue).filter((item) => item !== "");
  }

  if (value && typeof value === "object") {
    return normalizePayload(value);
  }

  return value;
}

function normalizeEmail(value) {
  if (typeof value !== "string") {
    return "";
  }

  const email = value.trim().toLowerCase();
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? email : "";
}

function findPayloadEmail(payload) {
  return (
    normalizeEmail(payload.email) ||
    normalizeEmail(payload.applicant && payload.applicant.email) ||
    normalizeEmail(payload.contact && payload.contact.email) ||
    normalizeEmail(payload.insured && payload.insured.email)
  );
}

function isRateLimited(req, email) {
  const key = `${req.ip}:${email}`;
  const now = Date.now();
  const windowMs = 10 * 60 * 1000;
  const maxRequests = Number(process.env.RATE_LIMIT_MAX || 5);
  const history = (recentRequests.get(key) || []).filter((timestamp) => now - timestamp < windowMs);
  history.push(now);
  recentRequests.set(key, history);
  if (history.length === 1) {
    pruneStaleRateLimitEntries(now, windowMs);
  }
  return history.length > maxRequests;
}

function pruneStaleRateLimitEntries(now, windowMs) {
  for (const [key, history] of recentRequests) {
    if (history.every((ts) => now - ts >= windowMs)) {
      recentRequests.delete(key);
    }
  }
}

function isAllowedOrigin(origin) {
  if (!origin || allowedOrigins.has(origin)) {
    return true;
  }

  if (origin === "null") {
    return process.env.ALLOW_FILE_ORIGIN === "true";
  }

  try {
    const { hostname } = new URL(origin);
    return hostname === "localhost" || hostname === "127.0.0.1" || hostname === "::1";
  } catch (_error) {
    return false;
  }
}

function sanitizeKey(key) {
  return String(key || "")
    .replace(/[^\w.-]/g, "")
    .slice(0, 80);
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

module.exports = {
  app,
  buildAdminHtml,
  buildLeadMagnetUserHtml,
  emailTemplateVersion,
};
