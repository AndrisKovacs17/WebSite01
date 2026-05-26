/**
 * Időpont Mentő - Egészségbiztosítás mini játék
 * Húzd a kártyát a megfelelő ellátási zónába.
 */
(function () {
  "use strict";

  var canvas = document.getElementById("idopont-canvas");
  if (!canvas) return;
  var ctx = canvas.getContext("2d");

  var CASES = [
    {
      title: "Térdpanasz sport után",
      text: "Ortopéd szakorvosi vizsgálat kellene, és jó lenne gyors időpont.",
      route: "szakorvos",
      tip: "Szakorvosi panaszhoz először azt nézzük, mely szakrendelés és partnerintézmény érhető el."
    },
    {
      title: "Hasi ultrahang javaslat",
      text: "Az orvos képalkotó vizsgálatot kért, a keret és az elérhető helyszín sem mindegy.",
      route: "diagnosztika",
      tip: "Diagnosztikánál külön fontos az éves limit, a beutaló/javaslat és a szolgáltatói hálózat."
    },
    {
      title: "Éves állapotfelmérés",
      text: "Nincs konkrét panasz, de jó lenne egy megelőző vizsgálati csomag.",
      route: "szures",
      tip: "Preventív vizsgálatnál a szűrési elemeket és a csomagszintet kell ellenőrizni."
    },
    {
      title: "Nem tudja, hova forduljon",
      text: "Van panasz, de nem világos, milyen szakrendelés lenne a jó irány.",
      route: "tisztazni",
      tip: "Ilyenkor az orvosi call center vagy betegútszervezés segíthet az első lépésben."
    },
    {
      title: "Régóta fennálló betegség",
      text: "Már a kötés előtt ismert probléma kezelésére kérne térítést.",
      route: "tisztazni",
      tip: "Előzménybetegség, várakozási idő és kizárás miatt ezt mindig előre kell tisztázni."
    },
    {
      title: "Labor kontroll",
      text: "Vérvételre és leletellenőrzésre van szükség a csomag feltételei szerint.",
      route: "diagnosztika",
      tip: "Labor és egyéb diagnosztika sokszor külön limittel fut, ezért nem csak a havidíj számít."
    },
    {
      title: "Gyermekorvosi kérdés",
      text: "A családi csomagban gyors szakmai iránymutatás kellene.",
      route: "tisztazni",
      tip: "Családi helyzetben fontos, hogy a biztosító milyen szervezési és tanácsadási csatornát ad."
    },
    {
      title: "Bőrgyógyászati időpont",
      text: "Szakorvosi konzultáció kell, lehetőség szerint közeli partnernél.",
      route: "szakorvos",
      tip: "Szakorvosnál a partnerhálózat és az elérhető időpont adja a valódi használhatóságot."
    }
  ];

  var ROUTES = {
    szakorvos: { label: "Szakorvos", sub: "panasz, konzultáció", color: "#0d6efd", icon: "\uf0f0" },
    diagnosztika: { label: "Diagnosztika", sub: "labor, ultrahang, MR/CT", color: "#6f42c1", icon: "\uf7fa" },
    szures: { label: "Szűrés", sub: "megelőző vizsgálat", color: "#198754", icon: "\uf46d" },
    tisztazni: { label: "Tisztázni kell", sub: "call center, kizárás, limit", color: "#fd7e14", icon: "\uf05a" }
  };

  var ZONE_IDS = ["szakorvos", "diagnosztika", "szures", "tisztazni"];

  var state = "idle"; // idle | playing | result
  var order = [];
  var index = 0;
  var score = 0;
  var lives = 3;
  var streak = 0;
  var lastTs = 0;
  var animId = null;
  var frozen = false;
  var dragging = false;
  var dragDx = 0;
  var dragDy = 0;
  var activeZone = null;
  var judgedZone = null;
  var judgedOk = false;
  var LW = 0;
  var LH = 0;
  var zones = [];
  var card = { x: 0, y: 0, w: 0, h: 0, homeX: 0, homeY: 0 };

  function byId(id) {
    return document.getElementById(id);
  }

  function setText(id, text) {
    var el = byId(id);
    if (el) el.textContent = text;
  }

  function showPanel(id) {
    ["idopont-panel-start", "idopont-panel-play", "idopont-panel-result"].forEach(function (pid) {
      var el = byId(pid);
      if (!el) return;
      el.classList.toggle("d-none", pid !== id);
    });
  }

  function setFeedback(type, text) {
    var fb = byId("idopont-feedback");
    if (!fb) return;
    fb.hidden = !text;
    fb.className = "alert mt-3 small mb-0 rounded-3 alert-" + type;
    fb.textContent = text || "";
  }

  function shuffleCases() {
    order = CASES.map(function (_, i) { return i; });
    for (var i = order.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var tmp = order[i];
      order[i] = order[j];
      order[j] = tmp;
    }
  }

  function currentCase() {
    return CASES[order[index]];
  }

  function resetCard() {
    card.w = Math.min(430, LW * 0.74);
    card.h = Math.min(150, Math.max(122, LH * 0.26));
    card.homeX = (LW - card.w) / 2;
    card.homeY = Math.max(18, LH * 0.10);
    card.x = card.homeX;
    card.y = -card.h - 12;
  }

  function resize() {
    LW = canvas.offsetWidth;
    LH = canvas.offsetHeight;
    if (!LW || !LH) return;
    var dpr = window.devicePixelRatio || 1;
    canvas.width = Math.round(LW * dpr);
    canvas.height = Math.round(LH * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    layoutZones();
    if (state === "playing" && !dragging) {
      card.w = Math.min(430, LW * 0.74);
      card.h = Math.min(150, Math.max(122, LH * 0.26));
      card.homeX = (LW - card.w) / 2;
      card.homeY = Math.max(18, LH * 0.10);
      card.x = card.homeX;
      card.y = card.homeY;
    }
    draw();
  }

  function layoutZones() {
    var pad = Math.max(10, LW * 0.025);
    var gap = Math.max(8, LW * 0.018);
    var top = LH * 0.50;
    var areaH = LH - top - pad;
    var zoneW = (LW - pad * 2 - gap) / 2;
    var zoneH = (areaH - gap) / 2;
    zones = ZONE_IDS.map(function (id, i) {
      var col = i % 2;
      var row = Math.floor(i / 2);
      return {
        id: id,
        x: pad + col * (zoneW + gap),
        y: top + row * (zoneH + gap),
        w: zoneW,
        h: zoneH
      };
    });
  }

  var resizeTimer;
  window.addEventListener("resize", function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(resize, 80);
  });
  setTimeout(resize, 80);

  function updateHud() {
    setText("idopont-hud-score", score + " pont");
    setText("idopont-hud-round", Math.min(index + 1, order.length) + " / " + order.length + ". kérés");
    setText("idopont-hud-lives", Array(lives + 1).join("●") + Array(4 - lives).join("○"));
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
    lines.slice(0, maxLines || 3).forEach(function (ln, i) {
      ctx.fillText(ln, x, y + i * lineHeight);
    });
  }

  function drawBg() {
    var gr = ctx.createLinearGradient(0, 0, 0, LH);
    gr.addColorStop(0, "#eef8f6");
    gr.addColorStop(1, "#f6fbff");
    ctx.fillStyle = gr;
    ctx.fillRect(0, 0, LW, LH);

    ctx.save();
    ctx.globalAlpha = 0.10;
    ctx.fillStyle = "#0d6efd";
    for (var i = 0; i < 8; i++) {
      ctx.beginPath();
      ctx.arc((i * 137 + 58) % LW, 36 + (i % 3) * 72, 13 + (i % 2) * 9, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  function drawZones() {
    zones.forEach(function (z) {
      var r = ROUTES[z.id];
      var isActive = activeZone === z.id;
      var isJudged = judgedZone === z.id;
      ctx.save();
      ctx.shadowColor = isActive ? "rgba(21,35,60,0.18)" : "rgba(21,35,60,0.06)";
      ctx.shadowBlur = isActive ? 14 : 5;
      ctx.shadowOffsetY = isActive ? 6 : 2;
      ctx.fillStyle = isJudged ? (judgedOk ? "rgba(25,135,84,0.16)" : "rgba(220,53,69,0.13)") : "#ffffff";
      ctx.strokeStyle = isJudged ? (judgedOk ? "#198754" : "#dc3545") : (isActive ? r.color : "rgba(21,35,60,0.14)");
      ctx.lineWidth = isActive || isJudged ? 3 : 1.5;
      roundRect(z.x, z.y, z.w, z.h, 14);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = r.color;
      ctx.font = "900 " + Math.max(16, Math.round(z.h * 0.24)) + "px 'Font Awesome 5 Free'";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(r.icon, z.x + z.w * 0.18, z.y + z.h * 0.46);

      ctx.fillStyle = "#15233C";
      ctx.font = "700 " + Math.max(13, Math.round(z.h * 0.20)) + "px Poppins, Arial, sans-serif";
      ctx.textAlign = "left";
      ctx.fillText(r.label, z.x + z.w * 0.32, z.y + z.h * 0.34);
      ctx.fillStyle = "#6c757d";
      ctx.font = "500 " + Math.max(10, Math.round(z.h * 0.13)) + "px Roboto, Arial, sans-serif";
      wrapText(r.sub, z.x + z.w * 0.32, z.y + z.h * 0.54, z.w * 0.60, Math.max(13, z.h * 0.16), 2);
      ctx.restore();
    });
  }

  function drawCard() {
    if (!order.length) return;
    var c = currentCase();
    ctx.save();
    ctx.shadowColor = dragging ? "rgba(21,35,60,0.26)" : "rgba(21,35,60,0.18)";
    ctx.shadowBlur = dragging ? 28 : 20;
    ctx.shadowOffsetY = dragging ? 12 : 7;
    ctx.fillStyle = "#ffffff";
    roundRect(card.x, card.y, card.w, card.h, 18);
    ctx.fill();
    ctx.restore();

    ctx.save();
    ctx.fillStyle = "#15233C";
    ctx.font = "700 " + Math.max(16, Math.round(LH * 0.036)) + "px Poppins, Arial, sans-serif";
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    ctx.fillText(c.title, card.x + 22, card.y + 18);

    ctx.fillStyle = "#5f6f89";
    ctx.font = "400 " + Math.max(13, Math.round(LH * 0.028)) + "px Roboto, Arial, sans-serif";
    wrapText(c.text, card.x + 22, card.y + 52, card.w - 44, Math.max(18, Math.round(LH * 0.036)), 3);

    ctx.strokeStyle = "rgba(13,110,253,0.18)";
    ctx.lineWidth = 2;
    roundRect(card.x + 18, card.y + card.h - 38, card.w - 36, 24, 12);
    ctx.stroke();
    ctx.fillStyle = "#0d6efd";
    ctx.font = "700 12px Poppins, Arial, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("Húzza a megfelelő zónába", card.x + card.w / 2, card.y + card.h - 32);
    ctx.restore();
  }

  function drawIdle() {
    drawBg();
    drawZones();
    ctx.save();
    ctx.fillStyle = "#15233C";
    ctx.font = "700 " + Math.max(24, Math.round(LH * 0.060)) + "px Poppins, Arial, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("Időpont Mentő", LW / 2, LH * 0.24);
    ctx.fillStyle = "#5f6f89";
    ctx.font = "400 " + Math.max(14, Math.round(LH * 0.032)) + "px Roboto, Arial, sans-serif";
    ctx.fillText("Húzza a kártyát a jó ellátási zónába.", LW / 2, LH * 0.33);
    ctx.restore();
  }

  function draw() {
    drawBg();
    drawZones();
    if (state === "playing") drawCard(); else drawIdle();
  }

  function loop(ts) {
    var dt = Math.min((ts - lastTs) / 1000, 0.05);
    lastTs = ts;
    if (state === "playing" && !dragging && !frozen) {
      card.y += (card.homeY - card.y) * Math.min(1, dt * 7);
      card.x += (card.homeX - card.x) * Math.min(1, dt * 7);
    }
    draw();
    if (state === "playing") animId = requestAnimationFrame(loop);
  }

  function pointerPos(evt) {
    var rect = canvas.getBoundingClientRect();
    return {
      x: (evt.clientX - rect.left) / rect.width * LW,
      y: (evt.clientY - rect.top) / rect.height * LH
    };
  }

  function pointInCard(p) {
    return p.x >= card.x && p.x <= card.x + card.w && p.y >= card.y && p.y <= card.y + card.h;
  }

  function zoneAt(p) {
    for (var i = 0; i < zones.length; i++) {
      var z = zones[i];
      if (p.x >= z.x && p.x <= z.x + z.w && p.y >= z.y && p.y <= z.y + z.h) return z.id;
    }
    return null;
  }

  function cardCenter() {
    return { x: card.x + card.w / 2, y: card.y + card.h / 2 };
  }

  function snapCardHome() {
    card.homeX = (LW - card.w) / 2;
    card.homeY = Math.max(18, LH * 0.10);
  }

  canvas.addEventListener("pointerdown", function (evt) {
    if (state !== "playing" || frozen) return;
    var p = pointerPos(evt);
    if (!pointInCard(p)) return;
    dragging = true;
    dragDx = p.x - card.x;
    dragDy = p.y - card.y;
    canvas.setPointerCapture(evt.pointerId);
    evt.preventDefault();
  });

  canvas.addEventListener("pointermove", function (evt) {
    if (!dragging || state !== "playing") return;
    var p = pointerPos(evt);
    card.x = Math.max(4, Math.min(LW - card.w - 4, p.x - dragDx));
    card.y = Math.max(4, Math.min(LH - card.h - 4, p.y - dragDy));
    activeZone = zoneAt(cardCenter());
    draw();
    evt.preventDefault();
  });

  canvas.addEventListener("pointerup", function (evt) {
    if (!dragging || state !== "playing") return;
    dragging = false;
    activeZone = zoneAt(cardCenter());
    canvas.releasePointerCapture(evt.pointerId);
    if (activeZone) {
      judge(activeZone);
    } else {
      snapCardHome();
      setFeedback("warning", "Húzza a kártyát valamelyik alsó zónába.");
    }
    evt.preventDefault();
  });

  canvas.addEventListener("pointercancel", function () {
    dragging = false;
    activeZone = null;
    snapCardHome();
  });

  function nextCase() {
    index += 1;
    activeZone = null;
    judgedZone = null;
    judgedOk = false;
    if (index >= order.length || lives <= 0) {
      endGame();
      return;
    }
    resetCard();
    frozen = false;
    setFeedback("info", "");
    updateHud();
  }

  function judge(route) {
    if (state !== "playing" || frozen) return;
    frozen = true;
    judgedZone = route;
    var c = currentCase();
    judgedOk = route === c.route;

    if (judgedOk) {
      streak += 1;
      score += 100 + Math.min(3, streak) * 25;
      setFeedback("success", "Jó helyre húzta: " + ROUTES[route].label + ". " + c.tip);
    } else {
      streak = 0;
      lives -= 1;
      setFeedback("danger", "Ez most nem az ideális hely. Jó megoldás: " + ROUTES[c.route].label + ". " + c.tip);
    }

    updateHud();
    draw();
    setTimeout(nextCase, 1650);
  }

  function endGame() {
    state = "result";
    if (animId) cancelAnimationFrame(animId);
    animId = null;
    showPanel("idopont-panel-result");
    setFeedback("info", "");

    var maxScore = order.length * 175;
    var pct = Math.round(score / maxScore * 100);
    var title;
    var desc;
    if (lives <= 0 || pct < 45) {
      title = "Érdemes átnézni a csatornákat";
      desc = "Az egészségbiztosításnál sok múlik azon, hogy panasz, diagnosztika, szűrés vagy kizárás kérdéséről van szó.";
    } else if (pct < 75) {
      title = "Jó alap, de vannak részletek";
      desc = "Már látszik, mikor kell szakorvos, diagnosztika vagy betegútszervezés. A limiteket és kizárásokat ajánlat előtt külön nézzük.";
    } else {
      title = "Remek betegút-érzék";
      desc = "Pont ez a lényeg: nem csak a díjat, hanem a használhatóságot, hálózatot, limiteket és kizárásokat is nézni kell.";
    }

    setText("idopont-result-title", title);
    setText("idopont-result-desc", desc);
    setText("idopont-result-score", score + " pont · " + Math.max(0, order.length - index) + " tartalék kérés");
    drawIdle();
  }

  window.idopontStart = function () {
    shuffleCases();
    index = 0;
    score = 0;
    lives = 3;
    streak = 0;
    frozen = false;
    dragging = false;
    activeZone = null;
    judgedZone = null;
    judgedOk = false;
    state = "playing";
    layoutZones();
    resetCard();
    lastTs = performance.now();
    showPanel("idopont-panel-play");
    setFeedback("info", "");
    updateHud();
    if (animId) cancelAnimationFrame(animId);
    animId = requestAnimationFrame(loop);
  };

  window.idopontRestart = function () {
    window.idopontStart();
  };

  document.addEventListener("keydown", function (e) {
    if (state !== "playing" || frozen || dragging) return;
    var keyMap = {
      "1": "szakorvos",
      "2": "diagnosztika",
      "3": "szures",
      "4": "tisztazni"
    };
    if (keyMap[e.key]) {
      e.preventDefault();
      judge(keyMap[e.key]);
    }
  });

  drawIdle();
})();
