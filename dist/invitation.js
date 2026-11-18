// Nikah, Mehndi and Walima still use the original sample schedule. Each guest link contains only the selected ceremony IDs.
const ceremonies = [
  { id: "nikah", name: "Nikah", urdu: "نکاح", date: "2027-02-18", time: "4:00 PM", words: "Join our families for the signing of our Nikah and a prayer for our life together." },
  { id: "mehndi", name: "Mehndi", urdu: "مہندی", date: "2027-02-19", time: "6:30 PM", venue: "Oswa Grammar School", mapUrl: "https://www.google.com/maps/place/Oswa+Grammar+School/@31.4290207,74.2898304,17z/data=!3m1!4b1!4m6!3m5!1s0x39190123dc76a3c9:0xdcff9100ff67027f!8m2!3d31.4290161!4d74.2924053!16s%2Fg%2F11bz_141rq?entry=tts&g_ep=EgoyMDI2MTExMC4wIOC7DCoASAFQAw%3D%3D&skid=6703ef41-0118-4e3e-b4fe-e91d50f55525", words: "Join us under the marigolds for an evening of henna, dholki and dancing." },
  { id: "baraat", name: "Barat", urdu: "بارات", date: "2026-12-19", time: "01:00 PM", lunch: "02:00 PM",
    venue: "Masood Marquee", mapUrl: "https://maps.app.goo.gl/uzpRe2q83tdxhfNS9", address: "818-N, Pounch Road, Samanabad, Lahore",
    words: "Miss & Mrs. Moazzam invite you to the wedding ceremony of Faizan Moazzam and Zarafshan Saeed." },
  { id: "walima", name: "Walima", urdu: "ولیمہ", date: "2027-02-21", time: "1:00 PM", venue: "Golden Fort Banquet Hall", mapUrl: "https://maps.app.goo.gl/HHyoXtQf5kTKY7qEA", words: "Please join us for our Walima luncheon as we begin married life surrounded by family and friends." }
];
const byId = id => document.getElementById(id);
const icon = id => '<svg class="icon" aria-hidden="true"><use href="#' + id + '"/></svg>';
function venueLink(event) {
  if (!event.mapUrl) return "";
  const link = document.createElement("a");
  link.className = "venue-link";
  link.href = event.mapUrl;
  link.target = "_blank";
  link.rel = "noopener noreferrer";
  link.textContent = event.venue + " ↗";
  link.setAttribute("aria-label", event.venue + " – open in Google Maps");
  return link.outerHTML;
}
function formatDate(event, options) {
  return new Intl.DateTimeFormat("en-GB", { ...options, timeZone: "UTC" }).format(new Date(event.date + "T12:00:00Z"));
}
const shortDate = event => formatDate(event, { weekday: "short", day: "numeric", month: "short", year: "numeric" });
const url = new URL(window.location.href);
const isGuest = url.searchParams.has("events");
const invited = new Set((url.searchParams.get("events") || "").split(","));
const visible = ceremonies.filter(event => !isGuest || invited.has(event.id));
byId("host").hidden = isGuest;
byId("hero-place").hidden = visible.length === 1 && !visible[0].mapUrl;
if (visible.length === 1) {
  byId("date-range").textContent = formatDate(visible[0], { day: "numeric", month: "long", year: "numeric" });
} else if (visible.length > 1 && visible.every(event => event.date.slice(0, 7) === visible[0].date.slice(0, 7))) {
  const days = visible.map(event => Number(event.date.slice(-2)));
  const range = days.at(-1) - days[0] === days.length - 1 ? days[0] + "–" + days.at(-1) : days.join(", ");
  byId("date-range").textContent = range + " " + formatDate(visible[0], { month: "long", year: "numeric" });
}
function showCeremony(event) {
  const isBarat = event.id === "baraat";
  byId("detail").dataset.ceremony = event.id;
  byId("event-title").textContent = event.name;
  byId("event-art").src = "assets/" + event.id + ".webp";
  byId("formal-details").innerHTML = `
    <p class="invocation" dir="rtl" lang="ar">بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</p>
    ${isBarat ? '<p class="hosts">Miss &amp; Mrs. Moazzam</p>' : ""}
    <p class="request">${isBarat ? "Request the honour of your presence at the wedding ceremony of their beloved daughter" : event.words}</p>
    <div class="couple-names name-stack">
      <span>Faizan Moazzam</span>
      ${isBarat ? '<small>Son of Mr. &amp; Mrs. Mazzam</small>' : ""}
      <em>with</em>
      <span>Zarafshan Saeed</span>
    </div>
    <section class="wedding-programme" aria-labelledby="programme-heading">
      <h3 id="programme-heading">Programme <span>In Sha Allah</span></h3>
      <p class="programme-day">${formatDate(event, { weekday: "long" })}</p>
      <p class="programme-date"><time datetime="${event.date}">${isBarat ? "19<sup>th</sup> December 2026" : formatDate(event, { day: "numeric", month: "long", year: "numeric" })}</time></p>
      <dl class="programme-times">
        <div><dt>${isBarat ? "Barat Arrival" : event.name}</dt><dd>${event.time}</dd></div>
        ${event.lunch ? `<div><dt>Lunch</dt><dd>${event.lunch}</dd></div>` : ""}
      </dl>
      ${event.mapUrl ? `<p class="programme-venue">${venueLink(event)}</p>` : ""}
      ${event.address ? `<p class="programme-address">${event.address}</p>` : ""}
    </section>`;
  byId("detail").showModal();
  byId("detail").scrollTop = 0;
}
const chapters = [];
for (const [index, event] of visible.entries()) {
  const chapter = document.createElement("article");
  chapter.className = "chapter " + event.id;
  chapter.dataset.ceremony = event.id;
  chapter.id = "ceremony-" + event.id;
  chapter.setAttribute("aria-labelledby", "heading-" + event.id);
  const number = String(index + 1).padStart(2, "0");
  chapter.innerHTML = `
    <div class="chapter-stage">
      <div class="chapter-paper">
        <figure><img src="assets/${event.id}.webp" loading="lazy" alt=""><figcaption lang="ur" dir="rtl">${event.urdu}</figcaption></figure>
        <div class="chapter-copy">
          <p class="chapter-n">Chapter ${number} <i></i></p>
          <h3 id="heading-${event.id}">${event.name}</h3>
          <p class="wording">${event.words}</p>
          <div class="event-meta"><span>${icon("calendar")}${shortDate(event)} · ${event.time}</span>${event.mapUrl ? `<span>${icon("pin")}${venueLink(event)}</span>` : ""}</div>
          <button class="event-button" aria-label="Open ${event.name} invitation">View invitation ${icon("arrow")}</button>
        </div>
      </div>
      <div class="leaf left" aria-hidden="true"><div><span>Wedding invitation</span><strong>${event.name}</strong><i>F &amp; Z</i></div></div>
      <div class="leaf right" aria-hidden="true"><div><span>Wedding invitation</span><strong>${event.name}</strong><i>F &amp; Z</i></div></div>
    </div>`;
  chapter.querySelector("button").addEventListener("click", () => showCeremony(event));
  byId("cards").append(chapter);
  const link = document.createElement("a");
  link.href = "#" + chapter.id;
  link.textContent = event.name;
  byId("chapters-nav").append(link);
  chapters.push({ chapter, link });
}
const reduced = matchMedia("(prefers-reduced-motion: reduce)");
const hero = byId("invitation");
let scrollFrame = 0;
const limit = n => Math.max(0, Math.min(1, n));
const curtainStart = 0.90;
function drawScroll() {
  scrollFrame = 0;
  const h = window.innerHeight;
  const heroHeight = hero.offsetHeight;
  const departure = limit(-hero.getBoundingClientRect().top / heroHeight);
  hero.style.setProperty("--travel", reduced.matches ? 0 : departure);
  let activeIndex = -1;
  for (const [i, { chapter }] of chapters.entries()) {
    const { top, height } = chapter.getBoundingClientRect();
    // On short screens, measure entry against the portion that can fit at once.
    const entered = (h - top) / Math.min(height, h);
    if (reduced.matches || entered >= curtainStart) {
      chapter.classList.add("curtains-open");
    } else if (top >= h) {
      chapter.classList.remove("curtains-open");
    }
    if (top < h * .65) activeIndex = i;
  }
  chapters.forEach(({ link }, i) => {
    if (i === activeIndex) link.setAttribute("aria-current", "step");
    else link.removeAttribute("aria-current");
  });
  updateNavigation();
}
function queueScroll() {
  if (!scrollFrame) scrollFrame = requestAnimationFrame(drawScroll);
}
window.addEventListener("scroll", queueScroll, { passive: true });
window.addEventListener("resize", queueScroll);
reduced.addEventListener("change", queueScroll);
window.addEventListener("pageshow",queueScroll);
drawScroll();
if (!visible.length) {
  byId("cards").textContent = "This link has no valid ceremony cards. Please ask your host for a new invitation.";
  byId("date-range").textContent = "See ceremony dates";
}

const studio = byId("studio");
function updateLink() {
  const checked = [...studio.querySelectorAll("input:checked")].map(box => box.value);
  const link = new URL(window.location.href);
  link.hash = "";
  link.search = "";
  link.searchParams.set("events", checked.join(","));
  byId("share-url").value = checked.length ? link.href : "";
  byId("preview").hidden = byId("whatsapp").hidden = !checked.length;
  byId("copy").disabled = !checked.length;
  byId("preview").href = link.href;
  byId("whatsapp").href = "https://wa.me/?text=" + encodeURIComponent("Please join us to celebrate our wedding. With love,\nFaizan Moazzam\nZarafshan Saeed\n" + link.href);
  byId("status").textContent = checked.length ? "" : "Choose at least one ceremony.";
}
if (!isGuest) {
  for (const event of ceremonies) {
    const label = document.createElement("label");
    label.className = "option";
    label.innerHTML = '<input type="checkbox" checked value="' + event.id + '">' + event.name + '<small>' + shortDate(event) + '</small>';
    byId("options").append(label);
  }
  byId("options").addEventListener("change", updateLink);
  for (const preset of ["all", "three"]) {
    byId(preset).addEventListener("click", () => {
      for (const box of studio.querySelectorAll("input[type=checkbox]")) box.checked = preset === "all" || box.value !== "nikah";
      updateLink();
    });
  }
  byId("host").addEventListener("click", () => { updateLink(); studio.showModal(); });
  byId("copy").addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(byId("share-url").value);
      byId("status").textContent = "Invitation link copied.";
    } catch {
      byId("share-url").focus();
      byId("share-url").select();
      byId("status").textContent = "Link selected. Use your device’s Copy command.";
    }
  });
}
for (const dialog of document.querySelectorAll("dialog")) {
  dialog.querySelectorAll("[data-close]").forEach(button => button.addEventListener("click", () => dialog.close()));
  dialog.addEventListener("click", event => {
    if (event.target !== dialog) return;
    const bounds = dialog.getBoundingClientRect();
    if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) dialog.close();
  });
}
function updateNavigation() {
  const atEvents = byId("celebrations").getBoundingClientRect().top < window.innerHeight * 0.5;
  document.querySelectorAll(".nav-link").forEach((link, index) => {
    link.classList.toggle("current", atEvents === (index === 1));
  });
}

// An original, gently plucked pentatonic phrase. Sound starts on an explicit tap.
let audio;
let interval;
let note = 0;
const phrase = [62, 69, 72, 74, 69, 67, 64, 0, 62, 67, 69, 76, 74, 69, 67, 0];
function pluck() {
  const pitch = phrase[note++ % phrase.length];
  if (!pitch || !audio) return;
  const oscillator = audio.createOscillator();
  const gain = audio.createGain();
  const now = audio.currentTime;
  oscillator.type = "triangle";
  oscillator.frequency.value = 440 * 2 ** ((pitch - 69) / 12);
  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(0.055, now + 0.025);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.9);
  oscillator.connect(gain).connect(audio.destination);
  oscillator.start(now);
  oscillator.stop(now + 2);
}
byId("music").addEventListener("click", async () => {
  const button = byId("music");
  if (button.disabled) return;
  button.disabled = true;
  try {
    if (audio) {
      clearInterval(interval);
      await audio.close();
      audio = undefined;
    } else {
      audio = new AudioContext();
      await audio.resume();
      note = 0;
      pluck();
      interval = setInterval(pluck, 680);
    }
    button.title = (audio ? "Pause" : "Play") + " instrumental music";
    button.setAttribute("aria-label", button.title);
    button.setAttribute("aria-pressed", String(Boolean(audio)));
  } finally { button.disabled = false; }
});
if (location.protocol !== "file:" && !matchMedia("(prefers-reduced-motion: reduce)").matches) {
  import("./motion.js").catch(() => byId("motes").hidden = true);
}
