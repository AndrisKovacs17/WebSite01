/**
 * SíPálya Mentőfutam - Utasbiztosítás mini játék
 * Fák és kövek kerülése, kapuk gyűjtése, célba érés.
 */
(function () {
  "use strict";

  var canvas = document.getElementById("sipalya-canvas");
  if (!canvas) return;
  var ctx = canvas.getContext("2d");

  var TRACK_LENGTH = 1650;
  var BASE_SPEED = 128;
  var PLAYER_W = 34;
  var PLAYER_H = 48;

  var state = "idle";
  var LW = 0;
  var LH = 0;
  var distance = 0;
  var score = 0;
  var lives = 3;
  var gateHits = 0;
  var totalGates = 0;
  var lastTs = 0;
  var animId = null;
  var invulnerable = 0;
  var messageTimer = 0;
  var messageText = "";
  var messageType = "info";
  var items = [];
  var snowflakes = [];
  var keys = { left: false, right: false };
  var pointerActive = false;
  var pointerX = 0;
  var targetX = 0;
  var player = { x: 0, vx: 0 };
  var playerFacing = 1;

  function byId(id) {
    return document.getElementById(id);
  }

  function setText(id, text) {
    var el = byId(id);
    if (el) el.textContent = text;
  }

  function showPanel(id) {
    ["sipalya-panel-start", "sipalya-panel-play", "sipalya-panel-result"].forEach(function (pid) {
      var el = byId(pid);
      if (!el) return;
      el.classList.toggle("d-none", pid !== id);
    });
  }

  function setFeedback(type, text) {
    var fb = byId("sipalya-feedback");
    if (!fb) return;
    fb.hidden = !text;
    fb.className = "alert mt-3 small mb-0 rounded-3 alert-" + type;
    fb.textContent = text || "";
  }

  function rand(min, max) {
    return min + Math.random() * (max - min);
  }

  function resize() {
    LW = canvas.offsetWidth;
    LH = canvas.offsetHeight;
    if (!LW || !LH) return;

    var dpr = window.devicePixelRatio || 1;
    canvas.width = Math.round(LW * dpr);
    canvas.height = Math.round(LH * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    if (!player.x) {
      player.x = LW / 2;
      targetX = player.x;
    }
    player.x = clamp(player.x, sideLimit(), LW - sideLimit());
    targetX = clamp(targetX || player.x, sideLimit(), LW - sideLimit());

    buildSnow();
    draw();
  }

  var resizeTimer;
  window.addEventListener("resize", function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(resize, 80);
  });
  setTimeout(resize, 80);

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function playerY() {
    return LH * 0.73;
  }

  function sideLimit() {
    return Math.max(34, LW * 0.10);
  }

  function playableLeft() {
    return sideLimit();
  }

  function playableRight() {
    return LW - sideLimit();
  }

  function toScreenY(worldY) {
    return playerY() - (worldY - distance);
  }

  function itemX(item) {
    return playableLeft() + item.x * (playableRight() - playableLeft());
  }

  function makeLevel() {
    items = [];
    totalGates = 0;
    var y = 95;
    var gateEvery = 0;

    while (y < TRACK_LENGTH - 105) {
      gateEvery += 1;

      if (gateEvery >= 4) {
        var center = rand(0.28, 0.72);
        var gap = rand(0.24, 0.34);
        items.push({
          type: "gate",
          y: y,
          left: clamp(center - gap / 2, 0.08, 0.82),
          right: clamp(center + gap / 2, 0.18, 0.92),
          scored: false
        });
        totalGates += 1;
        gateEvery = 0;
        y += rand(62, 86);
      } else {
        items.push({
          type: Math.random() > 0.22 ? "tree" : "rock",
          x: rand(0.10, 0.90),
          y: y,
          size: rand(0.86, 1.2),
          hit: false
        });

        if (y > 210 && Math.random() > 0.54) {
          var x2 = rand(0.10, 0.90);
          items.push({
            type: Math.random() > 0.32 ? "tree" : "rock",
            x: Math.abs(x2 - items[items.length - 1].x) < 0.22 ? clamp(x2 + 0.28, 0.10, 0.90) : x2,
            y: y + rand(-12, 16),
            size: rand(0.78, 1.05),
            hit: false
          });
        }
        y += rand(50, 74);
      }
    }
  }

  function buildSnow() {
    snowflakes = [];
    var count = Math.max(24, Math.round((LW * LH) / 16500));
    for (var i = 0; i < count; i += 1) {
      snowflakes.push({
        x: Math.random() * LW,
        y: Math.random() * LH,
        r: rand(0.7, 2.2),
        s: rand(8, 22),
        drift: rand(-8, 8)
      });
    }
  }

  function updateHud() {
    var percent = Math.min(100, Math.round((distance / TRACK_LENGTH) * 100));
    setText("sipalya-hud-distance", percent + "%");
    setText("sipalya-hud-score", Math.floor(score) + " pont");
    setText("sipalya-hud-lives", lives + " / 3");
    setText("sipalya-hud-gates", gateHits + " / " + totalGates + " kapu");

    var bar = byId("sipalya-hud-progress");
    if (bar) {
      bar.style.width = percent + "%";
      bar.setAttribute("aria-valuenow", String(percent));
    }
  }

  function showGameMessage(type, text) {
    messageType = type;
    messageText = text;
    messageTimer = 1.5;
    setFeedback(type, text);
  }

  function pointerPos(evt) {
    var rect = canvas.getBoundingClientRect();
    return {
      x: evt.clientX - rect.left,
      y: evt.clientY - rect.top
    };
  }

  canvas.addEventListener("pointerdown", function (evt) {
    if (state === "idle") {
      window.sipalyaStart();
      return;
    }
    if (state !== "playing") return;
    var p = pointerPos(evt);
    pointerActive = true;
    pointerX = p.x;
    targetX = clamp(pointerX, playableLeft(), playableRight());
    canvas.setPointerCapture(evt.pointerId);
    evt.preventDefault();
  });

  canvas.addEventListener("pointermove", function (evt) {
    if (state !== "playing" || !pointerActive) return;
    var p = pointerPos(evt);
    pointerX = p.x;
    targetX = clamp(pointerX, playableLeft(), playableRight());
    evt.preventDefault();
  });

  canvas.addEventListener("pointerup", function (evt) {
    pointerActive = false;
    try {
      canvas.releasePointerCapture(evt.pointerId);
    } catch (err) {
      /* pointer capture may already be released */
    }
  });

  canvas.addEventListener("pointercancel", function () {
    pointerActive = false;
  });

  document.addEventListener("keydown", function (evt) {
    if (evt.key === " " && state === "idle") {
      evt.preventDefault();
      window.sipalyaStart();
      return;
    }
    if (state !== "playing") return;
    if (evt.key === "ArrowLeft" || evt.key.toLowerCase() === "a") {
      keys.left = true;
      evt.preventDefault();
    }
    if (evt.key === "ArrowRight" || evt.key.toLowerCase() === "d") {
      keys.right = true;
      evt.preventDefault();
    }
  });

  document.addEventListener("keyup", function (evt) {
    if (evt.key === "ArrowLeft" || evt.key.toLowerCase() === "a") keys.left = false;
    if (evt.key === "ArrowRight" || evt.key.toLowerCase() === "d") keys.right = false;
  });

  function loop(ts) {
    if (state !== "playing") return;
    var dt = Math.min((ts - lastTs) / 1000, 0.045);
    lastTs = ts;
    update(dt);
    draw();
    animId = requestAnimationFrame(loop);
  }

  function update(dt) {
    distance += BASE_SPEED * dt;
    score += 8 * dt;
    invulnerable = Math.max(0, invulnerable - dt);
    messageTimer = Math.max(0, messageTimer - dt);

    if (pointerActive) {
      player.vx += (targetX - player.x) * 14 * dt;
    } else {
      var dir = 0;
      if (keys.left) dir -= 1;
      if (keys.right) dir += 1;
      player.vx += dir * 720 * dt;
      if (!dir) player.vx *= Math.pow(0.0008, dt);
    }

    player.vx = clamp(player.vx, -410, 410);
    player.x += player.vx * dt;

    if (player.vx < -45) playerFacing = 1;
    if (player.vx > 45) playerFacing = -1;

    if (player.x < playableLeft()) {
      player.x = playableLeft();
      player.vx *= -0.22;
    }
    if (player.x > playableRight()) {
      player.x = playableRight();
      player.vx *= -0.22;
    }

    updateSnow(dt);
    checkItems();
    updateHud();

    if (distance >= TRACK_LENGTH) {
      endGame(true);
    }
  }

  function updateSnow(dt) {
    snowflakes.forEach(function (flake) {
      flake.y += (flake.s + BASE_SPEED * 0.12) * dt;
      flake.x += flake.drift * dt;
      if (flake.y > LH + 4) {
        flake.y = -6;
        flake.x = Math.random() * LW;
      }
      if (flake.x < -4) flake.x = LW + 4;
      if (flake.x > LW + 4) flake.x = -4;
    });
  }

  function checkItems() {
    var py = playerY();

    items.forEach(function (item) {
      var sy = toScreenY(item.y);
      if (sy < py - 44 || sy > py + 44) return;

      if (item.type === "gate") {
        if (item.scored || sy < py - 2) return;
        var left = playableLeft() + item.left * (playableRight() - playableLeft());
        var right = playableLeft() + item.right * (playableRight() - playableLeft());
        item.scored = true;
        if (player.x > left + 10 && player.x < right - 10) {
          gateHits += 1;
          score += 140;
          showGameMessage("success", "Szép kapu! Plusz pont, és a cél egyre közelebb.");
        } else {
          showGameMessage("warning", "Kimaradt kapu. Nem baj, a lényeg: maradjon a pályán.");
        }
        return;
      }

      if (item.hit || invulnerable > 0) return;
      var ix = itemX(item);
      var radius = item.type === "tree" ? 22 * item.size : 17 * item.size;
      var dx = player.x - ix;
      var dy = py - sy;
      var hitRadius = radius + 15;

      if (Math.sqrt(dx * dx + dy * dy) < hitRadius) {
        item.hit = true;
        lives -= 1;
        invulnerable = 1.05;
        player.vx += dx < 0 ? -190 : 190;
        showGameMessage(
          "danger",
          lives > 0
            ? "Ütközés! Maradt " + lives + " védelmi pont. Síeléshez a téli sport fedezetet mindig ellenőrizni kell."
            : "Elfogytak a védelmi pontok. A pályán is, biztosításnál is számít a felkészülés."
        );
        if (lives <= 0) {
          endGame(false);
        }
      }
    });
  }

  function draw() {
    if (!LW || !LH) return;
    drawBackground();
    drawTrack();
    drawItems();
    drawFinish();
    drawPlayer();
    drawOverlayMessage();
  }

  function drawBackground() {
    var gr = ctx.createLinearGradient(0, 0, 0, LH);
    gr.addColorStop(0, "#cfeafa");
    gr.addColorStop(0.48, "#eef8ff");
    gr.addColorStop(1, "#f8fbff");
    ctx.fillStyle = gr;
    ctx.fillRect(0, 0, LW, LH);

    drawMountain(LW * 0.03, LH * 0.23, LW * 0.36, "#b7d2e7", "#ffffff");
    drawMountain(LW * 0.28, LH * 0.18, LW * 0.42, "#9fc5de", "#ffffff");
    drawMountain(LW * 0.62, LH * 0.24, LW * 0.34, "#b3d3e8", "#ffffff");

    ctx.fillStyle = "rgba(255,255,255,0.88)";
    snowflakes.forEach(function (flake) {
      ctx.beginPath();
      ctx.arc(flake.x, flake.y, flake.r, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  function drawMountain(x, y, w, color, cap) {
    ctx.save();
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(x, y + w * 0.35);
    ctx.lineTo(x + w * 0.45, y - w * 0.15);
    ctx.lineTo(x + w, y + w * 0.35);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = cap;
    ctx.beginPath();
    ctx.moveTo(x + w * 0.31, y + w * 0.02);
    ctx.lineTo(x + w * 0.45, y - w * 0.15);
    ctx.lineTo(x + w * 0.61, y + w * 0.02);
    ctx.lineTo(x + w * 0.52, y + w * 0.06);
    ctx.lineTo(x + w * 0.44, y + w * 0.02);
    ctx.lineTo(x + w * 0.38, y + w * 0.07);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  function drawTrack() {
    var left = playableLeft();
    var right = playableRight();
    var top = LH * 0.12;
    var bottom = LH + 30;

    ctx.save();
    ctx.fillStyle = "rgba(255,255,255,0.72)";
    ctx.beginPath();
    ctx.moveTo(left - 30, bottom);
    ctx.quadraticCurveTo(LW * 0.45, LH * 0.58, left + 10, top);
    ctx.lineTo(right - 10, top);
    ctx.quadraticCurveTo(LW * 0.56, LH * 0.58, right + 30, bottom);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = "rgba(13,110,253,0.12)";
    ctx.lineWidth = 2;
    for (var i = 0; i < 11; i += 1) {
      var y = ((distance * 0.55 + i * 62) % (LH + 80)) - 40;
      ctx.beginPath();
      ctx.moveTo(left + 16, y);
      ctx.quadraticCurveTo(LW / 2, y + 24, right - 16, y + 2);
      ctx.stroke();
    }

    ctx.strokeStyle = "rgba(21,35,60,0.12)";
    ctx.setLineDash([10, 12]);
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(left, top);
    ctx.lineTo(left + 18, bottom);
    ctx.moveTo(right, top);
    ctx.lineTo(right - 18, bottom);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();
  }

  function drawItems() {
    var drawList = items
      .map(function (item) {
        return { item: item, sy: toScreenY(item.y) };
      })
      .filter(function (entry) {
        return entry.sy > -100 && entry.sy < LH + 110;
      })
      .sort(function (a, b) {
        return a.sy - b.sy;
      });

    drawList.forEach(function (entry) {
      if (entry.item.type === "gate") drawGate(entry.item, entry.sy);
      if (entry.item.type === "tree") drawTree(itemX(entry.item), entry.sy, entry.item.size, entry.item.hit);
      if (entry.item.type === "rock") drawRock(itemX(entry.item), entry.sy, entry.item.size, entry.item.hit);
    });
  }

  function drawTree(x, y, scale, hit) {
    ctx.save();
    ctx.globalAlpha = hit ? 0.38 : 1;
    ctx.fillStyle = "rgba(21,35,60,0.14)";
    ctx.beginPath();
    ctx.ellipse(x + 6, y + 24 * scale, 21 * scale, 7 * scale, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#8a5a32";
    ctx.fillRect(x - 4 * scale, y + 13 * scale, 8 * scale, 18 * scale);

    ctx.fillStyle = "#0f7a55";
    triangle(x, y - 28 * scale, 23 * scale, 32 * scale);
    ctx.fillStyle = "#149564";
    triangle(x, y - 12 * scale, 28 * scale, 34 * scale);
    ctx.fillStyle = "#0c6f4b";
    triangle(x, y + 4 * scale, 32 * scale, 36 * scale);

    ctx.fillStyle = "rgba(255,255,255,0.45)";
    triangle(x - 6 * scale, y - 25 * scale, 9 * scale, 12 * scale);
    ctx.restore();
  }

  function triangle(x, y, halfW, h) {
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x - halfW, y + h);
    ctx.lineTo(x + halfW, y + h);
    ctx.closePath();
    ctx.fill();
  }

  function drawRock(x, y, scale, hit) {
    ctx.save();
    ctx.globalAlpha = hit ? 0.42 : 1;
    ctx.fillStyle = "rgba(21,35,60,0.13)";
    ctx.beginPath();
    ctx.ellipse(x + 5, y + 15 * scale, 20 * scale, 7 * scale, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#9aa6b2";
    ctx.beginPath();
    ctx.moveTo(x - 20 * scale, y + 14 * scale);
    ctx.lineTo(x - 10 * scale, y - 8 * scale);
    ctx.lineTo(x + 5 * scale, y - 14 * scale);
    ctx.lineTo(x + 21 * scale, y + 7 * scale);
    ctx.lineTo(x + 15 * scale, y + 18 * scale);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = "rgba(21,35,60,0.18)";
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();
  }

  function drawGate(item, y) {
    var left = playableLeft() + item.left * (playableRight() - playableLeft());
    var right = playableLeft() + item.right * (playableRight() - playableLeft());
    var alpha = item.scored ? 0.35 : 1;

    ctx.save();
    ctx.globalAlpha = alpha;
    drawFlag(left, y, "#dc3545", -1);
    drawFlag(right, y, "#0d6efd", 1);

    ctx.strokeStyle = "rgba(21,35,60,0.13)";
    ctx.setLineDash([6, 9]);
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(left + 8, y + 34);
    ctx.lineTo(right - 8, y + 34);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();
  }

  function drawFlag(x, y, color, dir) {
    ctx.save();
    ctx.strokeStyle = "#15233c";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(x, y - 22);
    ctx.lineTo(x, y + 38);
    ctx.stroke();

    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(x, y - 22);
    ctx.lineTo(x + dir * 24, y - 15);
    ctx.lineTo(x, y - 6);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  function drawFinish() {
    var y = toScreenY(TRACK_LENGTH);
    if (y < -80 || y > LH + 110) return;
    var left = playableLeft();
    var right = playableRight();

    ctx.save();
    ctx.strokeStyle = "#15233c";
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(left + 18, y - 46);
    ctx.lineTo(left + 18, y + 58);
    ctx.moveTo(right - 18, y - 46);
    ctx.lineTo(right - 18, y + 58);
    ctx.stroke();

    var h = 28;
    var cells = 14;
    var cellW = (right - left - 36) / cells;
    for (var i = 0; i < cells; i += 1) {
      ctx.fillStyle = i % 2 ? "#15233c" : "#ffffff";
      ctx.fillRect(left + 18 + i * cellW, y - 48, cellW, h);
      ctx.fillStyle = i % 2 ? "#ffffff" : "#15233c";
      ctx.fillRect(left + 18 + i * cellW, y - 48 + h / 2, cellW, h / 2);
    }

    ctx.fillStyle = "#15233c";
    ctx.font = "700 14px Arial, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("CÉL", LW / 2, y - 56);
    ctx.restore();
  }

  function drawPlayer() {
    var x = player.x;
    var y = playerY();
    var lean = clamp(player.vx / 360, -0.75, 0.75);
    var blink = invulnerable > 0 && Math.floor(invulnerable * 12) % 2 === 0;
    var size = Math.max(34, Math.min(52, LW * 0.078));

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(lean * 0.48);
    ctx.scale(playerFacing, 1);

    if (blink) {
      ctx.save();
      ctx.strokeStyle = "rgba(255,167,38,0.75)";
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.arc(0, 0, size * 0.45, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    ctx.font = size + "px 'Apple Color Emoji','Segoe UI Emoji','Noto Color Emoji',Arial,sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("⛷️", 0, -2);

    ctx.restore();
  }

  function roundRect(x, y, w, h, r) {
    var rr = Math.min(r, w / 2, h / 2);
    ctx.beginPath();
    ctx.moveTo(x + rr, y);
    ctx.lineTo(x + w - rr, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + rr);
    ctx.lineTo(x + w, y + h - rr);
    ctx.quadraticCurveTo(x + w, y + h, x + w - rr, y + h);
    ctx.lineTo(x + rr, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - rr);
    ctx.lineTo(x, y + rr);
    ctx.quadraticCurveTo(x, y, x + rr, y);
    ctx.closePath();
  }

  function drawOverlayMessage() {
    if (state === "idle") {
      drawCenteredCard("SíPálya Mentőfutam", "Kerülje a fákat, menjen át a kapukon, érjen célba.");
      return;
    }
    if (messageTimer <= 0 || !messageText) return;

    var color = messageType === "success" ? "#198754" : messageType === "danger" ? "#dc3545" : "#fd7e14";
    ctx.save();
    ctx.globalAlpha = Math.min(1, messageTimer);
    ctx.fillStyle = "rgba(255,255,255,0.92)";
    roundRect(18, 18, LW - 36, 52, 16);
    ctx.fill();
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = "#15233c";
    ctx.font = "700 13px Arial, sans-serif";
    ctx.textAlign = "center";
    wrapText(messageText, LW / 2, 39, LW - 72, 16, 2);
    ctx.restore();
  }

  function drawCenteredCard(title, text) {
    var w = Math.min(390, LW - 40);
    var h = 118;
    var x = (LW - w) / 2;
    var y = Math.max(30, LH * 0.28);

    ctx.save();
    ctx.fillStyle = "rgba(255,255,255,0.94)";
    roundRect(x, y, w, h, 18);
    ctx.fill();
    ctx.strokeStyle = "rgba(13,110,253,0.18)";
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = "#15233c";
    ctx.textAlign = "center";
    ctx.font = "800 21px Arial, sans-serif";
    ctx.fillText(title, LW / 2, y + 40);
    ctx.font = "500 14px Arial, sans-serif";
    wrapText(text, LW / 2, y + 70, w - 42, 18, 2);
    ctx.restore();
  }

  function wrapText(text, x, y, maxWidth, lineHeight, maxLines) {
    var words = text.split(" ");
    var line = "";
    var lines = [];

    words.forEach(function (word) {
      var test = line ? line + " " + word : word;
      if (ctx.measureText(test).width > maxWidth && line) {
        lines.push(line);
        line = word;
      } else {
        line = test;
      }
    });
    if (line) lines.push(line);

    lines.slice(0, maxLines || lines.length).forEach(function (row, i) {
      ctx.fillText(row, x, y + i * lineHeight);
    });
  }

  function endGame(won) {
    if (state !== "playing") return;
    state = "result";
    if (animId) cancelAnimationFrame(animId);
    animId = null;
    pointerActive = false;
    keys.left = false;
    keys.right = false;
    updateHud();
    showPanel("sipalya-panel-result");

    var title;
    var desc;
    if (won && lives === 3 && gateHits >= Math.max(1, totalGates - 1)) {
      title = "Hibátlan sífutam";
      desc = "A pályán is látszik: a jó felkészülés számít. Síeléshez külön téli sport fedezetet és assistance elérhetőséget is érdemes ellenőrizni.";
    } else if (won) {
      title = "Célba ért";
      desc = "Szép menet. Utazás előtt ugyanígy érdemes végignézni a célországot, sportprogramot, egészségügyi limiteket és poggyászfedezetet.";
    } else {
      title = "Újratervezés kell";
      desc = "A fák gyorsan jöttek, mint a kizárások az apróbetűben. Síelésnél különösen fontos, hogy a téli sport fedezet tényleg benne legyen.";
    }

    setText("sipalya-result-title", title);
    setText("sipalya-result-desc", desc);
    setText("sipalya-result-score", Math.floor(score) + " pont · " + gateHits + " / " + totalGates + " kapu · " + lives + " védelmi pont");
    setFeedback(won ? "success" : "warning", desc);
    draw();
  }

  window.sipalyaStart = function () {
    if (!LW || !LH) resize();
    makeLevel();
    distance = 0;
    score = 0;
    lives = 3;
    gateHits = 0;
    invulnerable = 0;
    messageTimer = 0;
    messageText = "";
    state = "playing";
    player.x = LW ? LW / 2 : 260;
    player.vx = 0;
    playerFacing = 1;
    targetX = player.x;
    pointerActive = false;
    showPanel("sipalya-panel-play");
    setFeedback("info", "");
    updateHud();
    lastTs = performance.now();
    if (animId) cancelAnimationFrame(animId);
    animId = requestAnimationFrame(loop);
  };

  window.sipalyaRestart = function () {
    window.sipalyaStart();
  };

  showPanel("sipalya-panel-start");
  buildSnow();
  draw();
})();
