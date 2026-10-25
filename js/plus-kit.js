// Shared bits for the Plus dates: data that travels inside a link (after the #), device storage, and sending links.
(function () {
  // JSON, deflated where the browser can, then base64url. "z" = deflated, "j" = plain.
  const b64 = bytes => { let s = ""; for (let i = 0; i < bytes.length; i += 8192) s += String.fromCharCode.apply(null, bytes.subarray(i, i + 8192)); return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, ""); };
  const unb64 = s => { const bin = atob(s.replace(/-/g, "+").replace(/_/g, "/")); const out = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i); return out; };

  window.PlusKit = {
    async pack(obj) {
      const raw = new TextEncoder().encode(JSON.stringify(obj));
      if (window.CompressionStream) {
        try { return "z" + b64(new Uint8Array(await new Response(new Blob([raw]).stream().pipeThrough(new CompressionStream("deflate-raw"))).arrayBuffer())); } catch (e) {}
      }
      return "j" + b64(raw);
    },
    async unpack(code) {
      let bytes = unb64(code.slice(1));
      if (code[0] === "z") bytes = new Uint8Array(await new Response(new Blob([bytes]).stream().pipeThrough(new DecompressionStream("deflate-raw"))).arrayBuffer());
      return JSON.parse(new TextDecoder().decode(bytes));
    },
    // the packed code after #key= in this page's address, or ""
    fromHash(key) { return (location.hash.match(new RegExp("^#" + key + "=([zj][A-Za-z0-9_-]+)$")) || [])[1] || ""; },
    link(slug, key, code) { return location.origin + location.pathname + "?d=" + slug + "#" + key + "=" + code; },
    load(k, d) { try { return JSON.parse(localStorage.getItem(k)) || d; } catch (e) { return d; } },
    store(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch (e) { return false; } },
    safeUrl(u) { u = (u || "").trim(); if (!u) return ""; if (!/^https?:\/\//i.test(u)) u = "https://" + u; try { return /^https?:$/.test(new URL(u).protocol) ? u : ""; } catch (e) { return ""; } },
    // share sheet on phones, otherwise copy; false means neither worked and the caller should show the text
    async share(title, text, url, btn, done) {
      try { if (navigator.share) { await navigator.share(url ? { title, text, url } : { title, text }); return true; } } catch (e) { return true; }
      try { await navigator.clipboard.writeText(url ? text + " " + url : text); const was = btn.textContent; btn.textContent = done; setTimeout(() => { btn.textContent = was; }, 2200); return true; }
      catch (e) { return false; }
    },
    motion() { return matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth"; }
  };
})();
