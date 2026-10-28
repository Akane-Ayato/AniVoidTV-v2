/* Pick + crop an image in the browser (drag to move, slider/wheel to zoom), returns a small WebP blob.
   AVTV.pickAndCrop({ w: 384, h: 384 })  ->  Promise<Blob|null> */
(function () {
  "use strict";
  const AVTV = (window.AVTV = window.AVTV || {});
  function openFile() {
    return new Promise((resolve) => {
      const inp = document.createElement("input");
      inp.type = "file"; inp.accept = "image/png,image/jpeg,image/webp,image/gif";
      inp.onchange = () => resolve(inp.files && inp.files[0] ? inp.files[0] : null);
      inp.click();
    });
  }
  function loadImage(file) {
    return new Promise((resolve, reject) => {
      const url = URL.createObjectURL(file), img = new Image();
      img.onload = () => resolve({ img, url });
      img.onerror = () => { URL.revokeObjectURL(url); reject(new Error("That file isn't a readable image.")); };
      img.src = url;
    });
  }
  AVTV.pickAndCrop = async function (opt) {
    const OUT_W = opt.w, OUT_H = opt.h, ratio = OUT_W / OUT_H;
    const file = await openFile();
    if (!file) return null;
    if (file.size > 20 * 1024 * 1024) throw new Error("That image is over 20 MB.");
    const { img, url } = await loadImage(file);
    const VW = Math.min(420, window.innerWidth - 48), VH = Math.round(VW / ratio);
    return new Promise((resolve) => {
      const ov = document.createElement("div");
      ov.className = "crop-overlay";
      ov.innerHTML = '<div class="crop-box" role="dialog" aria-modal="true" aria-label="Crop image"><h3>Adjust your ' + (opt.label || "picture") + '</h3><canvas width="' + VW + '" height="' + VH + '"></canvas>' +
        '<label class="crop-zoom">Zoom<input type="range" min="1" max="4" step="0.01" value="1"></label><p class="hint">Drag to move. Scroll or use the slider to zoom.</p>' +
        '<div class="row-btns"><button class="btn ghost" data-act="cancel" type="button">Cancel</button><button class="btn primary" data-act="ok" type="button">Use this</button></div></div>';
      document.body.appendChild(ov);
      const cv = ov.querySelector("canvas"), ctx = cv.getContext("2d"), zoom = ov.querySelector("input");
      const base = Math.max(VW / img.width, VH / img.height);
      let z = 1, ox = (VW - img.width * base) / 2, oy = (VH - img.height * base) / 2;
      const clamp = () => {
        const w = img.width * base * z, h = img.height * base * z;
        ox = Math.min(0, Math.max(VW - w, ox)); oy = Math.min(0, Math.max(VH - h, oy));
      };
      const draw = () => { clamp(); ctx.fillStyle = "#09080c"; ctx.fillRect(0, 0, VW, VH); ctx.drawImage(img, ox, oy, img.width * base * z, img.height * base * z); };
      const setZoom = (nz, cx, cy) => {
        nz = Math.min(4, Math.max(1, nz)); const k = nz / z;
        ox = cx - (cx - ox) * k; oy = cy - (cy - oy) * k; z = nz; zoom.value = z; draw();
      };
      let drag = null;
      cv.addEventListener("pointerdown", (e) => { cv.setPointerCapture(e.pointerId); drag = { x: e.clientX, y: e.clientY, ox, oy }; });
      cv.addEventListener("pointermove", (e) => { if (drag) { ox = drag.ox + e.clientX - drag.x; oy = drag.oy + e.clientY - drag.y; draw(); } });
      cv.addEventListener("pointerup", () => (drag = null));
      cv.addEventListener("wheel", (e) => { e.preventDefault(); setZoom(z * (e.deltaY < 0 ? 1.08 : 0.92), VW / 2, VH / 2); }, { passive: false });
      zoom.addEventListener("input", () => setZoom(Number(zoom.value), VW / 2, VH / 2));
      draw();
      const done = (blob) => { URL.revokeObjectURL(url); ov.remove(); resolve(blob); };
      ov.addEventListener("click", (e) => {
        const a = e.target.closest("[data-act]");
        if (e.target === ov || (a && a.dataset.act === "cancel")) return done(null);
        if (a && a.dataset.act === "ok") {
          const out = document.createElement("canvas"); out.width = OUT_W; out.height = OUT_H;
          const k = OUT_W / VW; const c2 = out.getContext("2d");
          c2.imageSmoothingQuality = "high";
          c2.drawImage(img, ox * k, oy * k, img.width * base * z * k, img.height * base * z * k);
          out.toBlob((b) => done(b), "image/webp", 0.86);
        }
      });
    });
  };
  /* upload a cropped blob as an avatar or banner picture */
  AVTV.uploadPicture = (kind, blob) => AVTV.api("/me/pictures?kind=" + kind, { method: "POST", raw: blob });
})();
