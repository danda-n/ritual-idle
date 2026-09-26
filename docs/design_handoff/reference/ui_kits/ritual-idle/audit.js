/* Design audit overlay: contrast (WCAG 2), font sizes, families, italics, icon colour contrast.
   Load with ?audit or call RIAudit.run(). Results render in a fixed panel and on window.__audit. */
(function () {
  function parse(c) { const m = c && c.match(/rgba?\(([^)]+)\)/); if (!m) return null; const p = m[1].split(/[ ,/]+/).filter(Boolean).map(Number); return { r: p[0], g: p[1], b: p[2], a: p[3] == null ? 1 : p[3] }; }
  function lum({ r, g, b }) { const f = v => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }; return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b); }
  function mix(top, bot) { const a = top.a; return { r: top.r * a + bot.r * (1 - a), g: top.g * a + bot.g * (1 - a), b: top.b * a + bot.b * (1 - a), a: 1 }; }
  function bgOf(el) {
    const layers = []; let grad = false;
    for (let n = el; n && n.nodeType === 1; n = n.parentElement) {
      const cs = getComputedStyle(n);
      if (cs.backgroundImage && cs.backgroundImage !== "none" && !/url\(/.test(cs.backgroundImage)) {
        grad = true;
        const stops = cs.backgroundImage.match(/rgba?\([^)]+\)/g);
        if (stops) { const last = parse(stops[stops.length - 1]); if (last && last.a > 0.5) { layers.push(last); break; } }
      }
      const c = parse(cs.backgroundColor);
      if (c && c.a > 0) { layers.push(c); if (c.a >= 1) break; }
    }
    let out = { r: 9, g: 11, b: 14, a: 1 };
    for (let i = layers.length - 1; i >= 0; i--) out = mix(layers[i], out);
    return { c: out, grad };
  }
  const ratio = (a, b) => { const x = lum(a), y = lum(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); };
  const hex = c => "#" + [c.r, c.g, c.b].map(v => Math.round(v).toString(16).padStart(2, "0")).join("");
  function run(label) {
    const issues = [], fonts = {}, sizes = {};
    let italics = 0, checked = 0;
    document.querySelectorAll("body *:not(script):not(style):not(svg *)").forEach(el => {
      if (el.closest("#ri-audit")) return;
      const own = [...el.childNodes].some(n => n.nodeType === 3 && n.textContent.trim());
      const cs = getComputedStyle(el);
      if (cs.visibility === "hidden" || cs.display === "none" || !el.getClientRects().length) return;
      if (el.tagName === "svg" && !el.closest("[aria-hidden=true] svg")) {
        const col = parse(cs.color), bg = bgOf(el.parentElement);
        if (col && el.getBoundingClientRect().width >= 12) { const r = ratio(mix(col, bg.c), bg.c); if (r < 3) issues.push({ kind: "icon", r, el, text: "icon", fg: hex(col), bg: hex(bg.c) }); }
        return;
      }
      if (!own) return;
      checked++;
      const fam = cs.fontFamily.split(",")[0].replace(/"/g, ""); fonts[fam] = (fonts[fam] || 0) + 1;
      const px = parseFloat(cs.fontSize); sizes[px] = (sizes[px] || 0) + 1;
      if (cs.fontStyle === "italic") { italics++; issues.push({ kind: "italic", el, text: el.textContent.trim().slice(0, 40) }); }
      if (px < 12) issues.push({ kind: "size", el, px, text: el.textContent.trim().slice(0, 40) });
      let op = 1; for (let n = el; n && n.nodeType === 1; n = n.parentElement) op *= +getComputedStyle(n).opacity;
      const fg = parse(cs.color), bg = bgOf(el);
      if (!fg) return;
      const eff = mix({ ...fg, a: fg.a * op }, bg.c);
      const r = ratio(eff, bg.c);
      const large = px >= 24 || (px >= 18.66 && +cs.fontWeight >= 700);
      const disabled = el.closest(":disabled,.is-locked");
      const min = large ? 3 : 4.5;
      if (r < min && !disabled) issues.push({ kind: "contrast", r, el, px, text: el.textContent.trim().slice(0, 40), fg: hex(eff), bg: hex(bg.c), approx: bg.grad });
    });
    const res = { label, checked, fonts, sizes, italics, issues };
    (window.__audit = window.__audit || []).push(res);
    render(res);
    return res;
  }
  function render(res) {
    let p = document.getElementById("ri-audit");
    if (!p) { p = document.createElement("div"); p.id = "ri-audit"; document.body.appendChild(p); }
    p.style.cssText = "position:fixed;right:12px;bottom:12px;z-index:9999;width:460px;max-height:70vh;overflow:auto;background:#fff;color:#111;font:12px/1.4 ui-monospace,monospace;padding:12px;border-radius:6px;box-shadow:0 10px 30px rgba(0,0,0,.6)";
    document.querySelectorAll(".ri-flag").forEach(n => n.classList.remove("ri-flag"));
    const c = res.issues.filter(i => i.kind === "contrast"), ic = res.issues.filter(i => i.kind === "icon"), s = res.issues.filter(i => i.kind === "size"), it = res.issues.filter(i => i.kind === "italic");
    res.issues.forEach(i => i.el.style.outline = "2px solid magenta");
    p.innerHTML = `<b>${res.label}</b> · ${res.checked} text nodes<br>fonts: ${Object.entries(res.fonts).map(([k, v]) => k + " " + v).join(", ")}<br>sizes: ${Object.keys(res.sizes).sort((a, b) => a - b).join(", ")}px<br>
      <b style="color:${c.length ? "#b00" : "#070"}">contrast fails: ${c.length}</b> · icons <3:1: ${ic.length} · &lt;12px: ${s.length} · italic: ${it.length}<br>` +
      [...c, ...ic, ...s].slice(0, 30).map(i => `· ${i.kind} ${i.r ? i.r.toFixed(2) + ":1" : i.px + "px"} “${i.text}” ${i.fg || ""}/${i.bg || ""}${i.approx ? " ~grad" : ""}`).join("<br>");
  }
  window.RIAudit = { run };
})();
