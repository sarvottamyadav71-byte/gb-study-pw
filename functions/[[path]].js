const TARGET_HOST = "www.learnxpw.site";
const TARGET_ORIGIN = `https://${TARGET_HOST}`;
const BRAND_NAME = "GB STUDY";
const TELEGRAM_URL = "https://t.me/GBFreestudy";
const ICON_URL = "https://i.ibb.co/Q3g9fGSt/1791541921524.png";
const OLD_ICON_URL = "https://i.ibb.co/V8CbjrG/image.png";
const OLD_TG_URL = "https://t.me/+AgMz8cG-x8VmNGY1";
const OLD_TG_URL_ALT = "https://t.me/AgMz8cG-x8VmNGY1";
let cachedAccessCookie = "studymeta_access=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzY29wZSI6ImZ1bGwiLCJpYXQiOjE3OTM2MjM4ODAsImV4cCI6MTc5MzcxMDI4MH0.RRjEAcW3pPiuWyKF6EDDgK0epLc-gCLCVMna1DFk_nA";
let refreshPromise = null;
function base64UrlDecode(str) {
  try {
    let b64 = str.replace(/-/g, "+").replace(/_/g, "/");
    while (b64.length % 4) b64 += "=";
    return atob(b64);
  } catch {
    return "";
  }
}
function isTokenExpired(cookieStr) {
  try {
    const rawJwt = cookieStr.replace(/^studymeta_access=/, "").split(";")[0];
    const parts = rawJwt.split(".");
    if (parts.length < 2) return true;
    const decoded = base64UrlDecode(parts[1]);
    if (!decoded) return true;
    const payload = JSON.parse(decoded);
    if (!payload.exp) return true;
    return Math.floor(Date.now() / 1e3) >= payload.exp - 7200;
  } catch {
    return true;
  }
}
async function fetchFreshAccessCookie() {
  try {
    const anonId = "anon_" + Date.now();
    const keyGenUrl = `${TARGET_ORIGIN}/key-generate?redirect=%2Fstudy%2Fbatches&type=full&anon_id=${anonId}`;
    const res = await fetch(keyGenUrl, {
      headers: {
        "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        referer: `${TARGET_ORIGIN}/study/batches`,
        cookie: `anon_id=${anonId}`
      }
    });
    const pageText = await res.text();
    const m = pageText.match(/\\?"token\\?":\s*\\?"([^"\\]+)\\?"/);
    if (!m || !m[1]) {
      return cachedAccessCookie;
    }
    const token = m[1];
    const verifyRes = await fetch(`${TARGET_ORIGIN}/api/complete-verification`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        referer: `${TARGET_ORIGIN}/verify?token=${encodeURIComponent(token)}`
      },
      body: JSON.stringify({ token })
    });
    const rawCookies = typeof verifyRes.headers.getSetCookie === "function"
      ? verifyRes.headers.getSetCookie()
      : (verifyRes.headers.get("set-cookie") ? [verifyRes.headers.get("set-cookie")] : []);
    for (const sc of rawCookies) {
      if (sc && sc.includes("studymeta_access=")) {
        const match = sc.match(/studymeta_access=[^;,\s]+/);
        if (match) {
          cachedAccessCookie = match[0];
          return cachedAccessCookie;
        }
      }
    }
  } catch (err) {
    console.error("[Cloudflare Edge] Failed to auto-refresh access cookie:", err);
  }
  return cachedAccessCookie;
}
async function fetchEdgeWithAuth(url, referer) {
  let cookie = await getAccessCookie();
  const doReq = async (c) => {
    try {
      const r = await fetch(url, {
        headers: {
          "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
          referer,
          cookie: c
        }
      });
      const body = await r.text();
      return { status: r.status, body };
    } catch {
      return { status: 500, body: "" };
    }
  };
  let res = await doReq(cookie);
  if (res.status === 401 || res.status === 403 || res.status === 307 || (res.body && res.body.includes("Unauthorised"))) {
    cachedAccessCookie = "";
    cookie = await fetchFreshAccessCookie();
    res = await doReq(cookie);
  }
  return res;
}
async function getAccessCookie() {
  if (cachedAccessCookie && !isTokenExpired(cachedAccessCookie)) {
    return cachedAccessCookie;
  }
  if (!refreshPromise) {
    refreshPromise = fetchFreshAccessCookie().finally(() => {
      refreshPromise = null;
    });
  }
  return refreshPromise;
}
function transformText(content) {
  let text = content;
  text = text.replaceAll("https://www.learnxpw.site", "");
  text = text.replaceAll("http://www.learnxpw.site", "");
  text = text.replaceAll("https:\\/\\/www.learnxpw.site", "");
  text = text.replaceAll("https://learnxpw.site", "");
  text = text.replaceAll("http://learnxpw.site", "");
  text = text.replaceAll("https:\\/\\/learnxpw.site", "");
  text = text.replaceAll(OLD_ICON_URL, ICON_URL);
  text = text.replaceAll(
    "https:\\/\\/i.ibb.co\\/V8CbjrG\\/image.png",
    ICON_URL.replace(/\//g, "\\/")
  );
  text = text.replaceAll("V8CbjrG/image.png", "Q3g9fGSt/1791541921524.png");
  text = text.replaceAll("V8CbjrG\\/image.png", "Q3g9fGSt\\/1791541921524.png");
  text = text.replaceAll("https://ibb.co/0R7qc34v", ICON_URL);
  text = text.replaceAll(
    "https:\\/\\/ibb.co\\/0R7qc34v",
    ICON_URL.replace(/\//g, "\\/")
  );
  text = text.replaceAll(OLD_TG_URL, TELEGRAM_URL);
  text = text.replaceAll(
    "https:\\/\\/t.me\\/+AgMz8cG-x8VmNGY1",
    TELEGRAM_URL.replace(/\//g, "\\/")
  );
  text = text.replaceAll(OLD_TG_URL_ALT, TELEGRAM_URL);
  text = text.replaceAll(
    "https:\\/\\/t.me\\/AgMz8cG-x8VmNGY1",
    TELEGRAM_URL.replace(/\//g, "\\/")
  );
  text = text.replaceAll("://t.me/+AgMz8cG-x8VmNGY1", "://t.me/GBFreestudy");
  text = text.replaceAll(":\\/\\/t.me\\/+AgMz8cG-x8VmNGY1", ":\\/\\/t.me\\/GBFreestudy");
  text = text.replaceAll("+AgMz8cG-x8VmNGY1", "GBFreestudy");
  text = text.replaceAll("AgMz8cG-x8VmNGY1", "GBFreestudy");
  text = text.replaceAll("@bookverse_probot", "@sarvottamji");
  text = text.replaceAll('"LearnX_9/58"', '"GBFreestudy"');
  text = text.replaceAll('"Mikkimeoww"', '"sarvottamji"');
  text = text.replaceAll('"webName":"Learnxpw"', `"webName":"${BRAND_NAME}"`);
  text = text.replaceAll(
    '"sidebarTitle":"Learnxpw"',
    `"sidebarTitle":"${BRAND_NAME}"`
  );
  text = text.replaceAll(
    "Learnxpw \u2014 a comprehensive online study platform",
    `${BRAND_NAME} \u2014 a comprehensive online study platform`
  );
  text = text.replaceAll("<title>Learnxpw</title>", `<title>${BRAND_NAME}</title>`);
  text = text.replaceAll("\xA9 2026 Learnxpw", `\xA9 2026 ${BRAND_NAME}`);
  text = text.replaceAll("\xA9 2025 Learnxpw", `\xA9 2025 ${BRAND_NAME}`);
  text = text.replaceAll("Learnxpw", BRAND_NAME);
  text = text.replaceAll("LEARNXPW", BRAND_NAME);
  text = text.replaceAll("learnxpw", BRAND_NAME);
  text = text.replaceAll(/"shortner_servers":\[[^\]]*\]/g, '"shortner_servers":[]');
  text = text.replaceAll('"isDirectLoginOpen":false', '"isDirectLoginOpen":true');
  if (text.includes("lx-video-turnstile-script") || text.includes("VIDEO_VERIFICATION_REQUIRED")) {
    text = text.replace(
      /(function (\w+)\(\)\{for\(let [^}]+\}async function \w+\(\)\{)\w+\("checking"\);/g,
      "$1$2();return;"
    );
    text = text.replace(/let (\w+)=window\.fetch;return window\.fetch=/g, "return;let $1=window.fetch;return window.fetch=");
  }
  text = text.replace(/(app\/watch\/layout-[a-zA-Z0-9_-]+\.js)(?:\?gbv=\d+)?/g, "$1?gbv=6");
  text = text.replace(/(app\/contact\/page-[a-zA-Z0-9_-]+\.js)(?:\?gbv=\d+)?/g, "$1?gbv=6");
  const EXISTING_HEAD_SCRIPT = `document.querySelectorAll('body link[rel="icon"], body link[rel="apple-touch-icon"]').forEach(el => document.head.appendChild(el))`;
  const ENHANCED_HEAD_SCRIPT = `${EXISTING_HEAD_SCRIPT};
(function() {
  if (typeof window === 'undefined') return;
  try {
    if ('adoptedStyleSheets' in document) {
      var gbSheet = new CSSStyleSheet();
      gbSheet.replaceSync('main.min-h-\\\\[65vh\\\\].items-center.justify-center>section.max-w-sm.rounded-2xl,main.fixed.z-\\\\[100\\\\].inset-0,aside nav a[href="/study/pi"],aside nav a[href="/study/nexttoppers"],aside nav a[href="/study/missionjeet"],aside nav a[href="/study/vibrant"],aside nav a[href="/study/sway"],aside nav a[data-pw-books="1"]{display:none!important}');
      document.adoptedStyleSheets = [].slice.call(document.adoptedStyleSheets).concat([gbSheet]);
    }
  } catch(e) {}
  try {
    var curFetch = window.fetch;
    var ownFd = Object.getOwnPropertyDescriptor(window, 'fetch');
    if (typeof curFetch === 'function' && (!ownFd || (!ownFd.writable && ownFd.configurable))) {
      Object.defineProperty(window, 'fetch', { configurable: true, enumerable: true, writable: true, value: curFetch });
    }
  } catch(e) {}
  var pwIconUrl = 'https://i.ibb.co/Q3g9fGSt/1791541921524.png';

  function hideMenuItems() {
    try {
      var links = document.querySelectorAll('aside nav a, nav a');
      for (var i = 0; i < links.length; i++) {
        var a = links[i];
        var h = (a.getAttribute('href') || '').toLowerCase();
        var t = (a.textContent || '').trim().toLowerCase();
        if (a.getAttribute('data-pw-books') === '1' || t === 'pw books') {
          a.remove();
          continue;
        }
        if (
          h === '/study/pi' || h.indexOf('/study/pi/') === 0 ||
          h === '/study/nexttoppers' || h.indexOf('/study/nexttoppers/') === 0 ||
          h === '/study/missionjeet' || h.indexOf('/study/missionjeet/') === 0 ||
          h === '/study/vibrant' || h.indexOf('/study/vibrant/') === 0 ||
          h === '/study/sway' || h.indexOf('/study/sway/') === 0 ||
          t === 'pi' || t === 'next toppers' || t === 'nexttoppers' ||
          t === 'missionjeet' || t === 'mission jeet' ||
          t === 'vibrant' || t === 'selection way'
        ) {
          a.style.setProperty('display', 'none', 'important');
        }
      }
    } catch(e) {}
  }

  function injectPoweredBy() {
    try {
      var allButtons = document.querySelectorAll('button');
      var loadMoreWrap = null;
      for (var i = 0; i < allButtons.length; i++) {
        var txt = (allButtons[i].textContent || '').trim();
        if (txt === 'Load More' || txt === 'Loading...') {
          loadMoreWrap = allButtons[i].closest('.flex.justify-center') || allButtons[i].parentElement;
          if (loadMoreWrap && loadMoreWrap.parentElement) break;
        }
      }
      var pBox = document.getElementById('gb-powered-by');
      function makePBox() {
        var el = document.createElement('div');
        el.id = 'gb-powered-by';
        el.className = 'w-full text-center py-6 mt-4 mb-8 flex justify-center items-center text-sm text-slate-400 font-medium tracking-wide';
        el.innerHTML = 'Powered by&nbsp;<a href="https://t.me/sarvottamji" target="_blank" rel="noopener noreferrer" class="font-bold underline underline-offset-4 transition-colors" style="color: #ef4444 !important; font-weight: 700; text-decoration: underline; text-underline-offset: 4px;"><span style="color: #ef4444 !important;">GB STUDY</span></a>';
        return el;
      }
      if (loadMoreWrap && loadMoreWrap.parentElement) {
        if (!pBox) pBox = makePBox();
        if (loadMoreWrap.nextElementSibling !== pBox) {
          loadMoreWrap.parentElement.insertBefore(pBox, loadMoreWrap.nextSibling);
        }
        return;
      }
      var grids = document.querySelectorAll('.grid');
      if (grids.length > 0) {
        var parentBox = grids[grids.length - 1].parentElement;
        if (parentBox) {
          if (!pBox) pBox = makePBox();
          if (parentBox.lastElementChild !== pBox) {
            parentBox.appendChild(pBox);
          }
          return;
        }
      }
      if (pBox && pBox.parentNode) {
        pBox.parentNode.removeChild(pBox);
      }
    } catch(e) {}
  }

  function fixMissingBatchBanners() {
    try {
      var imgs = document.querySelectorAll('img');
      imgs.forEach(function(img) {
        var s = img.getAttribute('src') || img.src || '';
        if (!s || s.trim() === '' || s.includes('undefined') || s.includes('null')) {
          img.src = pwIconUrl;
        }
        if (!img.dataset.pwErrorBound) {
          img.dataset.pwErrorBound = '1';
          img.addEventListener('error', function() {
            this.src = pwIconUrl;
          });
        }
      });
    } catch(e) {}
  }

  var isHydrated = false;

  function enableEnhancer() {
    if (isHydrated) return;
    isHydrated = true;
    runAll();
    setInterval(runAll, 500);
  }

  if (typeof window !== 'undefined') {
    window.addEventListener('load', function() {
      setTimeout(enableEnhancer, 1200);
    });

    ['pointerdown', 'touchstart', 'click', 'scroll'].forEach(function(evt) {
      window.addEventListener(evt, function() {
        enableEnhancer();
        setTimeout(runAll, 50);
      }, { passive: true });
    });
  }

  function runAll() {
    if (!isHydrated) return;
    hideMenuItems();
    injectPoweredBy();
    fixMissingBatchBanners();
  }
})();`;
  if (text.includes(EXISTING_HEAD_SCRIPT)) {
    text = text.replace(EXISTING_HEAD_SCRIPT, ENHANCED_HEAD_SCRIPT);
  }
  return text;
}
async function handleEdgeRequest(req, _env, _ctx) {
  const url = new URL(req.url);
  const pathname = url.pathname;
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS, HEAD",
        "Access-Control-Allow-Headers": "*"
      }
    });
  }
  if (pathname === "/") {
    if (url.searchParams.get("home") !== "1") {
      return Response.redirect(`${url.origin}/study/batches`, 307);
    }
  }
  if (pathname === "/key-generate") {
    const accessCookie2 = await getAccessCookie();
    const target = url.searchParams.get("redirect") || "/study/batches";
    const headers = new Headers();
    if (accessCookie2) {
      headers.set("Set-Cookie", `${accessCookie2}; Path=/; SameSite=Lax; Max-Age=86400`);
    }
    headers.set("Location", target.startsWith("http") ? target : `${url.origin}${target}`);
    return new Response(null, { status: 307, headers });
  }
  if (pathname === "/verify") {
    const accessCookie2 = await getAccessCookie();
    const headers = new Headers();
    if (accessCookie2) {
      headers.set("Set-Cookie", `${accessCookie2}; Path=/; SameSite=Lax; Max-Age=86400`);
    }
    headers.set("Location", `${url.origin}/study/batches`);
    return new Response(null, { status: 307, headers });
  }
  if (pathname === "/study/key") {
    return Response.redirect(`${url.origin}/study/batches`, 307);
  }
  if (pathname === "/logo.png") {
    return Response.redirect(ICON_URL, 307);
  }
  if (pathname === "/api/auth/serverInfo") {
    return new Response(
      JSON.stringify({
        webName: BRAND_NAME,
        sidebarLogoUrl: ICON_URL,
        sidebarTitle: BRAND_NAME,
        maintenanceMode: false,
        tg_channel: TELEGRAM_URL,
        tg_username: "sarvottamji",
        isDirectLoginOpen: true,
        tg_bot: "@sarvottamji",
        shortner_servers: []
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        }
      }
    );
  }
  if (pathname === "/api/video-security/status") {
    return new Response(
      JSON.stringify({
        enabled: false,
        verified: true,
        siteKey: ""
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-store, no-cache, must-revalidate",
          "Access-Control-Allow-Origin": "*"
        }
      }
    );
  }
  if (pathname === "/api/video-security/verify") {
    return new Response(
      JSON.stringify({
        success: true,
        verified: true
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        }
      }
    );
  }
  if (pathname === "/api/AllBatches") {
    const page = url.searchParams.get("page") || "1";
    const upstreamUrl = `${TARGET_ORIGIN}/api/AllBatches?page=${encodeURIComponent(page)}`;
    const upstreamRes = await fetchEdgeWithAuth(upstreamUrl, `${TARGET_ORIGIN}/study/batches`);
    if (upstreamRes.status === 200 && upstreamRes.body) {
      try {
        const parsed = JSON.parse(upstreamRes.body);
        if (parsed.success && parsed.batches) {
          for (const b of parsed.batches) {
            if (!b.previewImage || !b.previewImage.startsWith("http") || b.previewImage.trim() === "") {
              b.previewImage = ICON_URL;
            }
          }
          return new Response(transformText(JSON.stringify(parsed)), {
            status: 200,
            headers: {
              "Content-Type": "application/json",
              "Access-Control-Allow-Origin": "*"
            }
          });
        }
      } catch {
      }
    }
    return new Response(JSON.stringify({ success: true, batches: [], totalPages: 1, currentPage: 1, total: 0 }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      }
    });
  }
  if (pathname === "/api/BatchInfo") {
    const batchId = url.searchParams.get("BatchId") || url.searchParams.get("batchId") || "";
    const type = (url.searchParams.get("Type") || url.searchParams.get("type") || "details").toLowerCase();
    const page = url.searchParams.get("page") || "1";
    if (!batchId || batchId === "undefined" || batchId === "null") {
      return new Response(JSON.stringify({ success: true, data: type === "details" ? {} : [] }), {
        status: 200,
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
      });
    }
    const upstreamUrl = `${TARGET_ORIGIN}/api/BatchInfo?BatchId=${encodeURIComponent(batchId)}&Type=${encodeURIComponent(type)}${page ? `&page=${encodeURIComponent(page)}` : ""}`;
    const upstreamRes = await fetchEdgeWithAuth(upstreamUrl, `${TARGET_ORIGIN}/study/batches/${batchId}`);
    if (upstreamRes.status === 200 && upstreamRes.body) {
      try {
        const parsed = JSON.parse(upstreamRes.body);
        if (parsed.success && parsed.data) {
          return new Response(transformText(upstreamRes.body), {
            status: 200,
            headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
          });
        }
      } catch {
      }
    }
    return new Response(JSON.stringify({ success: true, data: type === "details" ? { _id: batchId, name: "Batch", subjects: [] } : [] }), {
      status: 200,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
    });
  }
  if (pathname === "/api/SubjectInfo") {
    const batchId = url.searchParams.get("BatchId") || url.searchParams.get("batchId") || "";
    const subjectId = url.searchParams.get("SubjectId") || url.searchParams.get("subjectId") || "";
    const page = url.searchParams.get("page") || "1";
    if (!batchId || batchId === "undefined" || !subjectId || subjectId === "undefined") {
      return new Response(JSON.stringify({ success: true, data: [] }), {
        status: 200,
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
      });
    }
    const upstreamUrl = `${TARGET_ORIGIN}/api/SubjectInfo?BatchId=${encodeURIComponent(batchId)}&SubjectId=${encodeURIComponent(subjectId)}&page=${encodeURIComponent(page)}`;
    const upstreamRes = await fetchEdgeWithAuth(upstreamUrl, `${TARGET_ORIGIN}/study/batches/${batchId}`);
    if (upstreamRes.status === 200 && upstreamRes.body) {
      try {
        const parsed = JSON.parse(upstreamRes.body);
        if (parsed && Array.isArray(parsed.data) && parsed.data.length > 0) {
          return new Response(transformText(upstreamRes.body), {
            status: 200,
            headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
          });
        }
      } catch {
      }
    }
    return new Response(JSON.stringify({ success: true, data: [] }), {
      status: 200,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
    });
  }
  if (pathname === "/api/TopicInfo") {
    const batchId = url.searchParams.get("BatchId") || url.searchParams.get("batchId") || "";
    const subjectId = url.searchParams.get("SubjectId") || url.searchParams.get("subjectId") || "";
    const topicId = url.searchParams.get("TopicId") || url.searchParams.get("topicId") || "";
    const contentType = url.searchParams.get("ContentType") || url.searchParams.get("contentType") || "videos";
    const page = url.searchParams.get("page") || "1";
    if (!batchId || batchId === "undefined" || !subjectId || subjectId === "undefined" || !topicId || topicId === "undefined") {
      return new Response(JSON.stringify({ success: true, data: [] }), {
        status: 200,
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
      });
    }
    const upstreamUrl = `${TARGET_ORIGIN}/api/TopicInfo?BatchId=${encodeURIComponent(batchId)}&SubjectId=${encodeURIComponent(subjectId)}&TopicId=${encodeURIComponent(topicId)}&ContentType=${encodeURIComponent(contentType)}&page=${encodeURIComponent(page)}`;
    const upstreamRes = await fetchEdgeWithAuth(upstreamUrl, `${TARGET_ORIGIN}/study/batches/${batchId}`);
    if (upstreamRes.status === 200 && upstreamRes.body) {
      try {
        const parsed = JSON.parse(upstreamRes.body);
        if (parsed && Array.isArray(parsed.data) && parsed.data.length > 0) {
          return new Response(transformText(upstreamRes.body), {
            status: 200,
            headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
          });
        }
      } catch {
      }
    }
    return new Response(JSON.stringify({ success: true, data: [] }), {
      status: 200,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
    });
  }
  if (pathname === "/api/searchBatch") {
    const name = (url.searchParams.get("name") || "").trim();
    const page = url.searchParams.get("page") || "1";
    const upstreamUrl = `${TARGET_ORIGIN}/api/searchBatch?name=${encodeURIComponent(name)}&page=${encodeURIComponent(page)}`;
    const upstreamRes = await fetchEdgeWithAuth(upstreamUrl, `${TARGET_ORIGIN}/study/batches`);
    if (upstreamRes.status === 200 && upstreamRes.body) {
      try {
        const parsed = JSON.parse(upstreamRes.body);
        if (parsed.success && parsed.batches) {
          for (const b of parsed.batches) {
            if (!b.previewImage || !b.previewImage.startsWith("http") || b.previewImage.trim() === "") {
              b.previewImage = ICON_URL;
            }
          }
          return new Response(transformText(JSON.stringify(parsed)), {
            status: 200,
            headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
          });
        }
      } catch {
      }
      return new Response(transformText(upstreamRes.body), {
        status: 200,
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
      });
    }
    return new Response(JSON.stringify({ success: true, batches: [], totalPages: 1, currentPage: 1, total: 0 }), {
      status: 200,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
    });
  }
  const targetUrl = new URL(pathname + url.search, TARGET_ORIGIN);
  let refererHeader = `${TARGET_ORIGIN}/`;
  const incomingReferer = req.headers.get("referer");
  if (incomingReferer) {
    try {
      const u = new URL(incomingReferer);
      u.protocol = "https:";
      u.host = TARGET_HOST;
      refererHeader = u.toString();
    } catch {
      refererHeader = `${TARGET_ORIGIN}/`;
    }
  }
  if (pathname.startsWith("/api/video-url") || pathname.startsWith("/api/get-video-url") || pathname.startsWith("/api/Schedule") || pathname.startsWith("/api/play") || pathname.startsWith("/api/get-otp") || pathname.startsWith("/api/stream")) {
    const q = url.searchParams;
    const batchId = q.get("batch_id") || q.get("batchId") || q.get("BatchId") || "";
    const subjectId = q.get("subject_id") || q.get("subjectId") || q.get("SubjectId") || "";
    const videoId = q.get("video_id") || q.get("videoId") || q.get("childId") || q.get("ChildId") || q.get("contentId") || q.get("ContentId") || "";
    if (batchId || subjectId || videoId) {
      refererHeader = `${TARGET_ORIGIN}/watch?batchId=${batchId}&SubjectId=${subjectId}&ContentId=${videoId}`;
    } else {
      refererHeader = `${TARGET_ORIGIN}/watch`;
    }
  }
  if (pathname === "/api/Schedule") {
    const batchId = url.searchParams.get("BatchId") || url.searchParams.get("batchId") || url.searchParams.get("batch_id") || "";
    const subjectId = url.searchParams.get("SubjectId") || url.searchParams.get("subjectId") || url.searchParams.get("subject_id") || "";
    const contentId = url.searchParams.get("ContentId") || url.searchParams.get("contentId") || url.searchParams.get("ChildId") || url.searchParams.get("childId") || url.searchParams.get("videoId") || url.searchParams.get("video_id") || "";
    const accessCookie2 = await getAccessCookie();
    try {
      const scheduleRes = await fetch(
        `${TARGET_ORIGIN}/api/Schedule?BatchId=${encodeURIComponent(batchId)}&SubjectId=${encodeURIComponent(subjectId)}&ContentId=${encodeURIComponent(contentId)}`,
        {
          headers: {
            "user-agent": req.headers.get("user-agent") || "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
            referer: refererHeader,
            cookie: accessCookie2
          }
        }
      );
      if (scheduleRes.status === 200) {
        const data = await scheduleRes.json().catch(() => null);
        if (data && data.success && (data.data?.urlType || Array.isArray(data.data) && data.data[0]?.urlType)) {
          return new Response(JSON.stringify(data), {
            status: 200,
            headers: {
              "Content-Type": "application/json",
              "Access-Control-Allow-Origin": "*"
            }
          });
        }
      }
    } catch {
    }
    let urlType = "penpencilvdo";
    let videoUrl = "";
    try {
      const vRes = await fetch(
        `${TARGET_ORIGIN}/api/video-url?batch_id=${encodeURIComponent(batchId)}&subject_id=${encodeURIComponent(subjectId)}&video_id=${encodeURIComponent(contentId)}`,
        {
          headers: {
            "user-agent": req.headers.get("user-agent") || "Mozilla/5.0",
            referer: refererHeader,
            cookie: accessCookie2
          }
        }
      );
      if (vRes.status === 200) {
        const vData = await vRes.json().catch(() => null);
        if (vData?.success && vData?.data) {
          urlType = vData.data.urlType || "penpencilvdo";
          videoUrl = vData.data.url || "";
        }
      }
    } catch {
    }
    return new Response(
      JSON.stringify({
        success: true,
        data: {
          _id: contentId,
          topic: "Class Lecture",
          title: "Class Lecture",
          name: "Class Lecture",
          urlType,
          url: videoUrl,
          videoDetails: {},
          availableFor: [],
          platformRestricted: false,
          restrictedSchedule: false,
          restrictedTime: 0
        }
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        }
      }
    );
  }
  const accessCookie = await getAccessCookie();
  const incomingCookie = req.headers.get("cookie") || "";
  const extraIncomingCookies = incomingCookie
    ? incomingCookie.split(";").map((c) => c.trim()).filter((c) => c && !c.startsWith("studymeta_access="))
    : [];
  const mergedCookies = [accessCookie, ...extraIncomingCookies].filter(Boolean);
  const forwardHeaders = new Headers();
  req.headers.forEach((val, key) => {
    const lowerKey = key.toLowerCase();
    if (
      lowerKey !== "host" &&
      lowerKey !== "connection" &&
      lowerKey !== "transfer-encoding" &&
      lowerKey !== "x-forwarded-proto" &&
      lowerKey !== "x-forwarded-host" &&
      lowerKey !== "x-forwarded-for" &&
      lowerKey !== "x-real-ip" &&
      lowerKey !== "cdn-loop" &&
      lowerKey !== "if-none-match" &&
      lowerKey !== "if-modified-since" &&
      !lowerKey.startsWith("cf-")
    ) {
      forwardHeaders.set(key, val);
    }
  });
  forwardHeaders.set("host", TARGET_HOST);
  forwardHeaders.set("origin", TARGET_ORIGIN);
  forwardHeaders.set("referer", refererHeader);
  forwardHeaders.set("cookie", mergedCookies.join("; "));
  const isVideoFallbackApi = pathname.startsWith("/api/video-url") || pathname.startsWith("/api/pw/pi");
  const isDirectMedia = pathname.startsWith("/api/play") || pathname.startsWith("/api/get-otp") || pathname.startsWith("/api/stream/") || pathname.includes(".mpd") || pathname.includes(".m3u8") || pathname.includes(".m4s") || pathname.includes(".mp4") || pathname.includes(".ts");
  try {
    let upstreamRes = await fetch(targetUrl.toString(), {
      method: req.method,
      headers: forwardHeaders,
      body: req.method !== "GET" && req.method !== "HEAD" ? req.body : void 0,
      redirect: "manual"
    });
    if (((upstreamRes.status === 307 || upstreamRes.status === 308) && upstreamRes.headers.get("location")?.includes("key-generate")) || (upstreamRes.status === 401 && pathname.startsWith("/api/stream/"))) {
      cachedAccessCookie = "";
      const newCookie = await fetchFreshAccessCookie();
      forwardHeaders.set("cookie", [newCookie, ...extraIncomingCookies].filter(Boolean).join("; "));
      upstreamRes = await fetch(targetUrl.toString(), {
        method: req.method,
        headers: forwardHeaders,
        body: req.method !== "GET" && req.method !== "HEAD" ? req.body : void 0,
        redirect: "manual"
      });
    }
    const resHeaders = new Headers();
    upstreamRes.headers.forEach((val, key) => {
      const lowerKey = key.toLowerCase();
      if (
        lowerKey !== "x-frame-options" &&
        lowerKey !== "content-security-policy" &&
        lowerKey !== "content-security-policy-report-only" &&
        lowerKey !== "set-cookie"
      ) {
        resHeaders.set(key, val);
      }
    });
    const upstreamSetCookies = typeof upstreamRes.headers.getSetCookie === "function"
      ? upstreamRes.headers.getSetCookie()
      : (upstreamRes.headers.get("set-cookie") ? [upstreamRes.headers.get("set-cookie")] : []);
    for (const rawCookie of upstreamSetCookies) {
      if (rawCookie) {
        resHeaders.append("Set-Cookie", rawCookie.replace(/domain=[^;]+;?/gi, "").replace(/Secure;?/gi, ""));
      }
    }
    resHeaders.set("Access-Control-Allow-Origin", "*");
    resHeaders.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS, HEAD");
    resHeaders.set("Access-Control-Allow-Headers", "*");
    const loc = upstreamRes.headers.get("location");
    if (loc) {
      let relativeLoc = loc.replace(/https?:\/\/(www\.)?learnxpw\.site/gi, "");
      if (relativeLoc.includes("key-generate")) {
        try {
          const locU = new URL(loc, TARGET_ORIGIN);
          relativeLoc = locU.searchParams.get("redirect") || "/study/batches";
        } catch {
          relativeLoc = "/study/batches";
        }
      }
      resHeaders.set("location", relativeLoc);
    }
    if (accessCookie) {
      resHeaders.append(
        "Set-Cookie",
        `${accessCookie}; Path=/; SameSite=Lax; Max-Age=86400`
      );
    }
    if (upstreamRes.status === 204 || upstreamRes.status === 205 || upstreamRes.status === 304) {
      return new Response(null, {
        status: upstreamRes.status,
        headers: resHeaders
      });
    }
    if (isDirectMedia) {
      return new Response(upstreamRes.body, {
        status: upstreamRes.status,
        headers: resHeaders
      });
    }
    const contentType = (resHeaders.get("content-type") || "").toLowerCase();
    const isText = contentType.includes("text/html") || contentType.includes("application/x-javascript") || contentType.includes("application/javascript") || contentType.includes("text/javascript") || contentType.includes("text/x-component") || contentType.includes("application/json") && !pathname.startsWith("/api/play");
    if (!isText) {
      return new Response(upstreamRes.body, {
        status: upstreamRes.status,
        headers: resHeaders
      });
    }
    const originalText = await upstreamRes.text();
    let modifiedText = transformText(originalText);
    if (isVideoFallbackApi && upstreamRes.status === 403 && modifiedText.includes("VIDEO_VERIFICATION_REQUIRED")) {
      modifiedText = modifiedText.replaceAll("VIDEO_VERIFICATION_REQUIRED", "STREAM_UNAVAILABLE");
    }
    resHeaders.delete("content-encoding");
    resHeaders.delete("content-length");
    resHeaders.delete("transfer-encoding");
    if (contentType.includes("text/html") || pathname.includes("/app/watch/layout") || pathname.includes("/app/contact/page")) {
      resHeaders.delete("etag");
      resHeaders.set("Cache-Control", "no-cache, no-store, must-revalidate");
    }
    return new Response(modifiedText, {
      status: upstreamRes.status,
      headers: resHeaders
    });
  } catch (err) {
    return new Response(`[GB STUDY Edge Proxy Error]: ${err?.message || err}`, {
      status: 502,
      headers: {
        "Content-Type": "text/plain"
      }
    });
  }
}
const onRequest = async (context) => {
  return handleEdgeRequest(context.request, context.env, context);
};
var path_default = {
  async fetch(request, env, ctx) {
    return handleEdgeRequest(request, env, ctx);
  }
};
export {
  path_default as default,
  handleEdgeRequest,
  onRequest
};
