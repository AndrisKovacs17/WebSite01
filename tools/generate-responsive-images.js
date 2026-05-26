const fs = require("fs");
const http = require("http");
const os = require("os");
const path = require("path");
const { spawn } = require("child_process");

const roots = process.argv.slice(2);
const imageRoots = roots.length
  ? roots
  : ["kgfb1", "kgfb2", "lakas1", "lakas2", "egeszseg1", "egeszseg2", "utas1", "utas2"];
const widths = [640, 960, 1280];
const rootDir = process.cwd();
const imageDir = path.join(rootDir, "img", "ajanlatok");
const userDataDir = fs.mkdtempSync(path.join(rootDir, "tmp", "edge-image-render-"));

const edgeCandidates = [
  "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
  "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
];

const browserPath = edgeCandidates.find((candidate) => fs.existsSync(candidate));
if (!browserPath) {
  console.error("No Chromium-based browser found for canvas image generation.");
  process.exit(1);
}

fs.mkdirSync(userDataDir, { recursive: true });

function contentType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  if (ext === ".jpg" || ext === ".jpeg") return "image/jpeg";
  if (ext === ".webp") return "image/webp";
  if (ext === ".html") return "text/html; charset=utf-8";
  return "application/octet-stream";
}

function send(res, status, body, type = "text/plain; charset=utf-8") {
  res.writeHead(status, { "Content-Type": type });
  res.end(body);
}

function pageHtml(port) {
  return `<!doctype html>
<html lang="hu">
<meta charset="utf-8">
<title>Image generator</title>
<body>
<script>
const roots = ${JSON.stringify(imageRoots)};
const widths = ${JSON.stringify(widths)};

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Could not load " + src));
    img.src = src;
  });
}

function toBlob(canvas, type, quality) {
  return new Promise((resolve) => canvas.toBlob(resolve, type, quality));
}

function blobToDataUrl(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

async function saveImage(filename, blob) {
  if (!blob) throw new Error("Canvas export failed for " + filename);
  const dataUrl = await blobToDataUrl(blob);
  const response = await fetch("/save", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ filename, dataUrl })
  });
  if (!response.ok) throw new Error("Save failed for " + filename);
}

async function run() {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d", { alpha: false });

  for (const root of roots) {
    const img = await loadImage("/img/" + root + ".jpg");
    const usableWidths = widths.filter((width) => width < img.naturalWidth);
    for (const width of usableWidths) {
      const height = Math.round(img.naturalHeight * width / img.naturalWidth);
      canvas.width = width;
      canvas.height = height;
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, width, height);
      ctx.drawImage(img, 0, 0, width, height);
      await saveImage(root + "-" + width + ".webp", await toBlob(canvas, "image/webp", 0.82));
      await saveImage(root + "-" + width + ".jpg", await toBlob(canvas, "image/jpeg", 0.82));
    }
  }

  await fetch("/done", { method: "POST" });
}

run().catch(async (error) => {
  await fetch("/error", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message: error.message, stack: error.stack })
  });
});
</script>
</body>
</html>`;
}

let browser;
let settled = false;

const server = http.createServer((req, res) => {
  if (req.method === "GET" && req.url === "/") {
    return send(res, 200, pageHtml(server.address().port), "text/html; charset=utf-8");
  }

  if (req.method === "GET" && req.url.startsWith("/img/")) {
    const filename = decodeURIComponent(req.url.slice("/img/".length));
    const filePath = path.join(imageDir, filename);
    if (!filePath.startsWith(imageDir) || !fs.existsSync(filePath)) {
      return send(res, 404, "Not found");
    }
    res.writeHead(200, { "Content-Type": contentType(filePath), "Cache-Control": "no-store" });
    return fs.createReadStream(filePath).pipe(res);
  }

  if (req.method === "POST" && (req.url === "/save" || req.url === "/error")) {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
      if (body.length > 25 * 1024 * 1024) req.destroy();
    });
    req.on("end", () => {
      try {
        const data = JSON.parse(body);
        if (req.url === "/error") {
          throw new Error(data.message || "Browser-side image generation failed");
        }
        const outputPath = path.join(imageDir, data.filename);
        if (!outputPath.startsWith(imageDir)) throw new Error("Invalid output path");
        const base64 = String(data.dataUrl).split(",")[1];
        fs.writeFileSync(outputPath, Buffer.from(base64, "base64"));
        send(res, 200, "ok");
      } catch (error) {
        console.error(error);
        send(res, 500, error.message);
        finish(1);
      }
    });
    return;
  }

  if (req.method === "POST" && req.url === "/done") {
    send(res, 200, "done");
    return finish(0);
  }

  send(res, 404, "Not found");
});

function finish(code) {
  if (settled) return;
  settled = true;
  setTimeout(() => {
    if (browser && !browser.killed) browser.kill();
    server.close(() => process.exit(code));
  }, 250);
}

server.listen(0, "127.0.0.1", () => {
  const port = server.address().port;
  browser = spawn(browserPath, [
    "--headless=new",
    "--disable-gpu",
    "--disable-dev-shm-usage",
    "--no-first-run",
    "--no-default-browser-check",
    "--user-data-dir=" + userDataDir,
    "http://127.0.0.1:" + port + "/",
  ], { stdio: "ignore", windowsHide: true });

  browser.on("exit", (code) => {
    if (!settled) {
      console.error("Browser exited before generation finished with code", code);
      finish(1);
    }
  });
});

setTimeout(() => {
  console.error("Timed out while generating responsive images.");
  finish(1);
}, 90000).unref();
