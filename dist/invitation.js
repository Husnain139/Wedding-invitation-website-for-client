// Nikah, Mehndi and Walima still use the original sample schedule. Each guest link contains only the selected ceremony IDs.
const ceremonies = [
  { id: "nikah", name: "Nikah", urdu: "نکاح", date: "2027-02-18", time: "4:00 PM", venue: "The Garden Pavilion, Lahore", words: "Join our families for the signing of our Nikah and a prayer for our life together." },
  { id: "mehndi", name: "Mehndi", urdu: "مہندی", date: "2027-02-19", time: "6:30 PM", venue: "The Marigold Courtyard, Lahore", words: "Join us under the marigolds for an evening of henna, dholki and dancing." },
  { id: "baraat", name: "Barat", urdu: "بارات", date: "2026-12-19", time: "01:00 PM", lunch: "02:00 PM",
    venue: "Masood Marquee", address: "818-N, Pounch Road, Samanabad, Lahore",
    words: "Mr. & Mrs. M. Saeed invite you to the wedding ceremony of their beloved daughter Zarafshan Saeed with Faizan Moazzam." },
  { id: "walima", name: "Walima", urdu: "ولیمہ", date: "2027-02-21", time: "1:00 PM", venue: "The Pearl Terrace, Lahore", words: "Please join us for our Walima luncheon as we begin married life surrounded by family and friends." }
];
const byId = id => document.getElementById(id);
const icon = id => '<svg class="icon" aria-hidden="true"><use href="#' + id + '"/></svg>';
function formatDate(event, options) {
  return new Intl.DateTimeFormat("en-GB", { ...options, timeZone: "UTC" }).format(new Date(event.date + "T12:00:00Z"));
}
const shortDate = event => formatDate(event, { weekday: "short", day: "numeric", month: "short", year: "numeric" });
const url = new URL(window.location.href);
const isGuest = url.searchParams.has("events");
const invited = new Set((url.searchParams.get("events") || "").split(","));
const visible = ceremonies.filter(event => !isGuest || invited.has(event.id));
byId("host").hidden = isGuest;
if (visible.length === 1) {
  byId("date-range").textContent = formatDate(visible[0], { day: "numeric", month: "long", year: "numeric" });
} else if (visible.length > 1 && visible.every(event => event.date.slice(0, 7) === visible[0].date.slice(0, 7))) {
  const days = visible.map(event => Number(event.date.slice(-2)));
  const range = days.at(-1) - days[0] === days.length - 1 ? days[0] + "–" + days.at(-1) : days.join(", ");
  byId("date-range").textContent = range + " " + formatDate(visible[0], { month: "long", year: "numeric" });
}
function showCeremony(event) {
  const isBarat = event.id === "baraat";
  byId("standard-details").hidden = isBarat;
  byId("formal-details").hidden = !isBarat;
  byId("detail").querySelector(".kicker").hidden = isBarat;
  byId("event-title").textContent = event.name;
  byId("event-art").src = "assets/" + event.id + ".webp";
  if (isBarat) {
    byId("formal-details").innerHTML = `
      <p class="invocation" dir="rtl" lang="ar">بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</p>
      <p class="hosts">Mr. &amp; Mrs. M. Saeed</p>
      <p class="request">Request the honour of your presence at the wedding ceremony of their beloved daughter</p>
      <p class="couple-names">Zarafshan Saeed <em>with</em> Faizan Moazzam</p>
      <p>Son of Mr. &amp; Mrs. Mazzam</p>
      <h3>Programme In Sha Allah</h3>
      <dl class="programme">
        <dt>Day</dt><dd>${formatDate(event, { weekday: "long" })}</dd>
        <dt>Date</dt><dd>19th December 2026</dd>
        <dt>Barat Arrival</dt><dd>${event.time}</dd>
        <dt>Lunch</dt><dd>${event.lunch}</dd>
        <dt>Venue</dt><dd>${event.venue}</dd>
        <dt>Address</dt><dd>${event.address}</dd>
      </dl>`;
  } else {
    byId("event-wording").textContent = event.words;
    byId("event-date").textContent = formatDate(event, { weekday: "long", day: "numeric", month: "long", year: "numeric" }) + " · " + event.time + " PKT";
    byId("event-place").textContent = event.venue;
  }
  byId("detail").showModal();
  byId("detail").scrollTop = 0;
}
const chapters = [];
for (const [index, event] of visible.entries()) {
  const chapter = document.createElement("article");
  chapter.className = "chapter " + event.id;
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
          <div class="event-meta"><span>${icon("calendar")}${shortDate(event)} · ${event.time}</span><span>${icon("pin")}${event.venue}</span></div>
          <button class="event-button" aria-label="Open ${event.name} invitation">View invitation ${icon("arrow")}</button>
        </div>
      </div>
      <div class="leaf left" aria-hidden="true"><div><span>Wedding invitation</span><strong>${event.name}</strong><i>Z &amp; F</i></div></div>
      <div class="leaf right" aria-hidden="true"><div><span>Wedding invitation</span><strong>${event.name}</strong><i>Z &amp; F</i></div></div>
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
function drawScroll() {
  scrollFrame = 0;
  const h = window.innerHeight;
  const heroHeight = hero.offsetHeight;
  const departure = limit(-hero.getBoundingClientRect().top / heroHeight);
  hero.style.setProperty("--travel", reduced.matches ? 0 : departure);
  let activeIndex = -1;
  for (const [i, { chapter }] of chapters.entries()) {
    const top = chapter.getBoundingClientRect().top;
    const progress = reduced.matches ? 1 : limit((h * .98 - top) / (h * .46));
    const ease = progress * progress * (3 - 2 * progress);
    chapter.style.setProperty("--open", ease.toFixed(4));
    chapter.classList.toggle("unfolding", progress < .999 && !reduced.matches);
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
  byId("whatsapp").href = "https://wa.me/?text=" + encodeURIComponent("Please join us to celebrate our wedding. With love, Zarafshan & Faizan\n" + link.href);
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
