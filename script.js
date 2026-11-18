// =========================================================
// Ali Zalzale – personal site
// 1. Sky colours and greeting follow the time in Ottawa
// 2. Nav bar gets a frosted background after you scroll
// 3. Sections slide in once when you reach them
// 4. Screenshots and the code card tilt toward your mouse
// 5. "Copy my email" button and footer year
// 6. Floating languages and code snippets in the hero
// 7. Typing line under the name
// =========================================================

const $ = (id) => document.getElementById(id);

// ---------- 1. Ottawa time, greeting and sky ----------
// Sunrise and sunset for Ottawa, worked out with the standard astronomy formulas
function sunTimes(date, lat = 45.42, lng = -75.69) {
  const PI = Math.PI, rad = PI / 180, dayMs = 86400000;
  const J1970 = 2440588, J2000 = 2451545, J0 = 0.0009, tilt = rad * 23.4397;
  const toDays = (d) => d.valueOf() / dayMs - 0.5 + J1970 - J2000;
  const fromJulian = (j) => new Date((j + 0.5 - J1970) * dayMs);

  const lw = rad * -lng, phi = rad * lat;
  const n = Math.round(toDays(date) - J0 - lw / (2 * PI));            // which day
  const ds = J0 + lw / (2 * PI) + n;
  const M = rad * (357.5291 + 0.98560028 * ds);                         // where Earth is in its orbit
  const C = rad * (1.9148 * Math.sin(M) + 0.02 * Math.sin(2 * M) + 0.0003 * Math.sin(3 * M));
  const L = M + C + rad * 102.9372 + PI;
  const dec = Math.asin(Math.sin(tilt) * Math.sin(L));                  // how high the sun gets
  const noon = J2000 + ds + 0.0053 * Math.sin(M) - 0.0069 * Math.sin(2 * L);
  const w = Math.acos((Math.sin(rad * -0.833) - Math.sin(phi) * Math.sin(dec)) / (Math.cos(phi) * Math.cos(dec)));
  const set = J2000 + J0 + (w + lw) / (2 * PI) + n + 0.0053 * Math.sin(M) - 0.0069 * Math.sin(2 * L);
  return { sunrise: fromJulian(noon - (set - noon)), sunset: fromJulian(set) };
}

const ottawaTime = (date) =>
  date.toLocaleTimeString("en-CA", { hour: "numeric", minute: "2-digit", timeZone: "America/Toronto" })
    .replace("a.m.", "AM").replace("p.m.", "PM");

function ottawaHour() {
  // The hour (0–23) in Ottawa, no matter where the visitor is
  const text = new Intl.DateTimeFormat("en-CA", {
    hour: "numeric", hourCycle: "h23", timeZone: "America/Toronto",
  }).format(new Date());
  return parseInt(text, 10);
}

function updateSky() {
  const now = new Date();
  const { sunrise, sunset } = sunTimes(now);
  const minutes = (a, b) => (a - b) / 60000;   // minutes from b to a

  // Pick the sky from the real sunrise and sunset
  let sky;
  if (minutes(now, sunrise) < -75 || minutes(now, sunset) > 60) sky = "night";
  else if (minutes(now, sunrise) < 60)                            sky = "dawn";
  else if (minutes(now, sunset) > -60)                            sky = "dusk";
  else                                                            sky = "day";
  document.body.dataset.sky = sky;

  const hour = ottawaHour();
  $("greeting").textContent =
    hour >= 5 && hour < 12 ? "Good morning" :
    hour >= 12 && hour < 17 ? "Good afternoon" :
    hour >= 17 && hour < 23 ? "Good evening" : "Hello";
  $("clock").textContent = ottawaTime(now);

  // Tell visitors what the sky is doing, so they can see it's real
  const notes = {
    dawn: `It's sunrise in Ottawa, so the page is in dawn colours. Sunrise today: ${ottawaTime(sunrise)}.`,
    day: `It's daytime in Ottawa, so the page is in daytime colours. Sunset today: ${ottawaTime(sunset)}.`,
    dusk: `The sun is setting in Ottawa, so the page is in sunset colours. Sunset today: ${ottawaTime(sunset)}.`,
    night: `It's night in Ottawa, so the page is in night colours. Sunrise: ${ottawaTime(sunTimes(new Date(now.valueOf() + (hour >= 12 ? 86400000 : 0))).sunrise)}.`,
  };
  $("skyNote").textContent = notes[sky];
}

updateSky();
setInterval(updateSky, 30 * 1000); // check again every 30 seconds

// ---------- 2. Nav bar ----------
const nav = document.querySelector(".nav");
window.addEventListener("scroll", () => {
  nav.classList.toggle("scrolled", window.scrollY > 40);
}, { passive: true });

// ---------- 3. Slide sections in when they come into view ----------
const toReveal = document.querySelectorAll(
  ".section > h2, .about-grid, .project, .timeline li, .skill-grid, .school, .contact"
);
toReveal.forEach((el) => el.classList.add("reveal"));

if ("IntersectionObserver" in window) {
  const watcher = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("shown");
        watcher.unobserve(entry.target); // only animate once
      }
    });
  }, { threshold: 0.15 });
  toReveal.forEach((el) => watcher.observe(el));
} else {
  toReveal.forEach((el) => el.classList.add("shown"));
}

// ---------- 4. Tilt toward the mouse ----------
const calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
if (!calm) {
  document.querySelectorAll(".tilt").forEach((card) => {
    card.addEventListener("mousemove", (event) => {
      const box = card.getBoundingClientRect();
      const x = (event.clientX - box.left) / box.width - 0.5;   // -0.5 to 0.5
      const y = (event.clientY - box.top) / box.height - 0.5;
      card.style.setProperty("--ry", `${x * 8}deg`);
      card.style.setProperty("--rx", `${y * -8}deg`);
    });
    card.addEventListener("mouseleave", () => {
      card.style.setProperty("--ry", "0deg");
      card.style.setProperty("--rx", "0deg");
    });
  });
}

// ---------- 5. Copy email + year ----------
$("copyEmail").addEventListener("click", async () => {
  const button = $("copyEmail");
  try {
    await navigator.clipboard.writeText("alizalzale@hotmail.com");
    button.textContent = "Email copied";
  } catch {
    button.textContent = "alizalzale@hotmail.com";
  }
  setTimeout(() => (button.textContent = "Copy my email"), 2500);
});

$("year").textContent = new Date().getFullYear();

// ---------- 6. Floating languages and code snippets ----------
const field = $("codeField");

const TOKENS = [
  // [text, colour, kind]  kind "lang" = a pill with a dot, "code" = a snippet
  ["JavaScript", "#f7df1e", "lang"],
  ["Python", "#5aa9ff", "lang"],
  ["HTML", "#ff7a45", "lang"],
  ["CSS", "#3fa9ff", "lang"],
  ["SQL", "#34d3c1", "lang"],
  ["C#", "#a77bff", "lang"],
  ["Flask", "#eae6ff", "lang"],
  ["Git", "#ff6b4a", "lang"],
  ["Linux", "#ffd36e", "lang"],
  ['<b>def</b> outfit_for(feels):', "#5aa9ff", "code"],
  ['<b>const</b> pay = hours * rate;', "#f7df1e", "code"],
  ['fetch(<b>"/api/weather"</b>)', "#ffb38a", "code"],
  ['<b>SELECT</b> * <b>FROM</b> shifts;', "#34d3c1", "code"],
  ['<b>@app</b>.route("/api/search")', "#5aa9ff", "code"],
  ['<b>if</b> (hours &gt; 44) overtime();', "#f7df1e", "code"],
  ['localStorage.<b>setItem</b>(key, data)', "#ff8fb1", "code"],
  ['<b>&lt;section</b> class="hero"<b>&gt;</b>', "#ff7a45", "code"],
  ['.sky { <b>animation</b>: drift 26s; }', "#3fa9ff", "code"],
  ['<b>return</b> jsonify(report)', "#5aa9ff", "code"],
  ['git commit -m <b>"ship it"</b>', "#ff6b4a", "code"],
  ['<b>public class</b> Shift { }', "#a77bff", "code"],
  ['<b>=&gt;</b>', "#c792ff", "code"],
  ['<b>{ }</b>', "#ffd36e", "code"],
  ['<b>&lt;/&gt;</b>', "#ff8fb1", "code"],
];

const small = window.innerWidth < 700;
const list = small ? TOKENS.filter((_, i) => i % 2 === 0) : TOKENS;

// Mix the order so languages and snippets are spread out
const shuffled = list.map((t) => [Math.random(), t]).sort((a, b) => a[0] - b[0]).map((x) => x[1]);

const floaters = shuffled.map(([text, colour, kind], i) => {
  const el = document.createElement("span");
  el.className = `token ${kind}`;
  el.style.setProperty("--glow", colour);
  el.innerHTML = kind === "lang" ? `<i></i>${text}` : text;
  field.appendChild(el);

  // depth: 0.35 = far away (small, faint, blurry), 1 = close (big, bright)
  // Every other token is far away; the rest are close.
  const far = i % 2 === 0;
  const depth = far ? 0.35 + Math.random() * 0.15 : 0.6 + Math.random() * 0.4;

  // Spread them out in columns so they don't clump together.
  // Close ones stay on the right side, so your name and text stay easy to read.
  const share = Math.floor(i / 2) / Math.ceil(shuffled.length / 2);
  let x = far ? share + Math.random() * 0.1 : 0.6 + share * 0.36;
  if (small) x = (i + 0.5) / shuffled.length;

  const f = {
    el, depth,
    x: Math.min(0.95, Math.max(0.02, x)),
    y: Math.random(),
    speed: 0.6 + Math.random() * 0.8,
    phase: Math.random() * Math.PI * 2,
  };

  el.style.opacity = small ? (0.08 + depth * 0.22).toFixed(2) : far ? "0.28" : (0.45 + (depth - 0.6) * 1.1).toFixed(2);
  el.style.filter = far ? "blur(1.6px)" : "none";
  el.style.zIndex = Math.round(depth * 10);
  return f;
});

// Mouse position (-0.5 to 0.5), smoothed so the movement glides
let mouseX = 0, mouseY = 0, smoothX = 0, smoothY = 0;
window.addEventListener("mousemove", (e) => {
  mouseX = e.clientX / window.innerWidth - 0.5;
  mouseY = e.clientY / window.innerHeight - 0.5;
}, { passive: true });

function placeFloaters(time) {
  const w = field.clientWidth;
  const h = field.clientHeight;
  smoothX += (mouseX - smoothX) * 0.05;
  smoothY += (mouseY - smoothY) * 0.05;

  for (const f of floaters) {
    // Slowly rise, sway side to side, and lean away from the mouse (closer = moves more)
    const rise = (time * 0.000012 * f.speed * f.depth) % 1;
    const y = (f.y - rise + 1) % 1;
    const px = f.x * w + Math.sin(time * 0.00025 * f.speed + f.phase) * 30 * f.depth - smoothX * 70 * f.depth;
    const py = y * (h + 120) - 60 - smoothY * 50 * f.depth;
    const scale = 0.7 + f.depth * 0.45;
    f.el.style.transform = `translate3d(${px.toFixed(1)}px, ${py.toFixed(1)}px, 0) scale(${scale.toFixed(3)})`;
  }
}

if (calm) {
  placeFloaters(0); // still picture for people who turned off motion
} else {
  const loop = (time) => {
    // Only animate while the hero is on screen (saves battery)
    if (window.scrollY < window.innerHeight) placeFloaters(time);
    requestAnimationFrame(loop);
  };
  requestAnimationFrame(loop);
}

// ---------- 7. Typing line under the name ----------
const phrases = [
  "build web apps",
  "write Python and JavaScript",
  "design clean, fast interfaces",
  "make tools people use every day",
];
const typed = $("typed");

if (!calm) {
  let phrase = 0, letters = phrases[0].length, deleting = true;
  const step = () => {
    const word = phrases[phrase];
    letters += deleting ? -1 : 1;
    typed.textContent = word.slice(0, letters);

    let wait = deleting ? 35 : 70;
    if (!deleting && letters === word.length) { deleting = true; wait = 2200; }
    else if (deleting && letters === 0) { deleting = false; phrase = (phrase + 1) % phrases.length; wait = 350; }
    setTimeout(step, wait);
  };
  setTimeout(step, 2600);
}