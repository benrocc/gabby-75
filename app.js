const STORAGE_KEY = "gabby-75-v1";
const TASKS = [
  { id: "diet", name: "Follow your diet", hint: "no cheat meals", glyph: "♡" },
  { id: "alcohol", name: "No alcohol", hint: "not a drop", glyph: "✧" },
  { id: "w1", name: "Workout 1", hint: "45 min", glyph: "✶" },
  { id: "w2", name: "Workout 2 · outside", hint: "45 min, any weather", glyph: "☼" },
  { id: "water", name: "1 gallon of water", hint: "", glyph: "◌" },
  { id: "read", name: "10 pages", hint: "non-fiction · no audiobook", glyph: "¶" },
  { id: "photo", name: "Progress photo", hint: "every day", glyph: "◉" },
];

const QUOTES = [
  { t: "Be so completely yourself that everyone else feels safe to be themselves too.", a: "Unknown" },
  { t: "You do not have to be perfect. You do have to show up.", a: "Gabby · 75 HARD" },
  { t: "Discipline is choosing what you want most over what you want now.", a: "Unknown" },
  { t: "She remembered who she was, and the game changed.", a: "Lalah Delia" },
  { t: "A river cuts through rock not because of its power, but because of its persistence.", a: "James N. Watkins" },
  { t: "The only way out is through.", a: "Robert Frost" },
  { t: "Protect your peace like it is part of the program. It is.", a: "Gabby · 75 HARD" },
  { t: "Little by little, one travels far.", a: "J.R.R. Tolkien" },
  { t: "Do it tired. Do it unsure. Do it anyway.", a: "Gabby · 75 HARD" },
  { t: "What you do every day matters more than what you do once in a while.", a: "Gretchen Rubin" },
  { t: "Soft does not mean weak. Soft means she still has a heart in the work.", a: "Gabby · 75 HARD" },
  { t: "Start where you are. Use what you have. Do what you can.", a: "Arthur Ashe" },
  { t: "The secret of getting ahead is getting started.", a: "Mark Twain" },
  { t: "You are allowed to be a masterpiece and a work in progress at the same time.", a: "Unknown" },
  { t: "75 HARD is a love letter to future Gabby.", a: "Gabby · 75 HARD" },
  { t: "Courage is not the absence of fear, but the triumph over it.", a: "Nelson Mandela" },
  { t: "Make it pretty. Make it honest. Make it done.", a: "Gabby · 75 HARD" },
  { t: "We are what we repeatedly do.", a: "Will Durant" },
  { t: "One day or day one. You decide.", a: "Unknown" },
  { t: "Keep a notebook. The page will hold what the day cannot.", a: "Gabby · 75 HARD" },
  { t: "It always seems impossible until it is done.", a: "Nelson Mandela" },
  { t: "Your future self is watching. Don't leave her hanging.", a: "Gabby · 75 HARD" },
  { t: "The wound is the place where the light enters you.", a: "Rumi" },
  { t: "Done is prettier than perfect.", a: "Gabby · 75 HARD" },
  { t: "Fall seven times, stand up eight.", a: "Japanese proverb" },
  { t: "Be stubborn about your goals and flexible about your methods.", a: "Unknown" },
  { t: "She is in the middle of becoming. That is the point.", a: "Gabby · 75 HARD" },
  { t: "An inch of movement will bring you closer than a mile of intention.", a: "Unknown" },
  { t: "Drink the water. Take the walk. Write the page.", a: "Gabby · 75 HARD" },
  { t: "No one can make you feel inferior without your consent.", a: "Eleanor Roosevelt" },
  { t: "The best time to plant a tree was twenty years ago. The second best is now.", a: "Chinese proverb" },
  { t: "Quiet consistency beats loud motivation.", a: "Gabby · 75 HARD" },
  { t: "You must do the thing you think you cannot do.", a: "Eleanor Roosevelt" },
  { t: "Stars cannot shine without darkness.", a: "Unknown" },
  { t: "This is not a punishment. This is a promise.", a: "Gabby · 75 HARD" },
];

const main = document.getElementById("main");
const sheet = document.getElementById("sheet");
const sheetTitle = document.getElementById("sheet-title");
const sheetBody = document.getElementById("sheet-body");
const sheetActions = document.getElementById("sheet-actions");

let tab = "today";
let diaryDraft = "";
let todoDraft = "";
const now0 = new Date();
let calCursor = { y: now0.getFullYear(), m: now0.getMonth() };

function todayYmd(d = new Date()) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function parseYmd(s) {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function addDays(ymd, n) {
  const d = parseYmd(ymd);
  d.setDate(d.getDate() + n);
  return todayYmd(d);
}

function dayIndex(start, ymd) {
  return Math.round((parseYmd(ymd) - parseYmd(start)) / 86400000);
}

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (_) { /* ignore */ }
  return {
    attempts: [],
    currentId: null,
    diary: [],
    todos: [],
  };
}

let state = load();

function save() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function currentAttempt() {
  return state.attempts.find((a) => a.id === state.currentId) || null;
}

function emptyDay() {
  return Object.fromEntries(TASKS.map((t) => [t.id, false]));
}

function isComplete(day) {
  if (!day) return false;
  return TASKS.every((t) => day[t.id]);
}

function quoteFor(ymd) {
  const n = ymd.split("-").join("");
  return QUOTES[Number(n) % QUOTES.length];
}

function startAttempt() {
  const id = crypto.randomUUID ? crypto.randomUUID() : String(Date.now());
  state.attempts.push({
    id,
    startedOn: todayYmd(),
    endedOn: null,
    reason: null,
    days: {},
  });
  state.currentId = id;
  save();
}

function failAttempt(onYmd, reason) {
  const a = currentAttempt();
  if (!a) return;
  a.endedOn = onYmd;
  a.reason = reason;
  state.currentId = null;
  save();
}

function enforceStreak() {
  const a = currentAttempt();
  if (!a) return null;
  const today = todayYmd();
  const start = a.startedOn;
  if (today < start) return null;
  const idx = dayIndex(start, today);
  for (let i = 0; i < idx; i++) {
    const ymd = addDays(start, i);
    if (!isComplete(a.days[ymd])) {
      failAttempt(ymd, "missed");
      return { missed: ymd, dayNum: i + 1 };
    }
  }
  if (idx >= 75) {
    const all = [];
    for (let i = 0; i < 75; i++) all.push(addDays(start, i));
    if (all.every((d) => isComplete(a.days[d]))) {
      a.endedOn = addDays(start, 74);
      a.reason = "finished";
      state.currentId = null;
      save();
      return { finished: true };
    }
  }
  return null;
}

function openSheet(title, bodyHtml, actions) {
  sheetTitle.textContent = title;
  sheetBody.innerHTML = bodyHtml;
  sheetActions.innerHTML = "";
  actions.forEach((act) => {
    const b = document.createElement("button");
    b.className = "btn " + (act.solid ? "btn-solid" : "btn-ghost");
    b.textContent = act.label;
    b.addEventListener("click", act.onClick);
    sheetActions.appendChild(b);
  });
  sheet.hidden = false;
}

function closeSheet() {
  sheet.hidden = true;
}

sheet.addEventListener("click", (e) => {
  if (e.target === sheet) closeSheet();
});

function rulesBlockHtml() {
  return `
    <ol class="rules">
      <li><strong>Follow a diet.</strong> You choose the diet. Stick to it. No cheat meals. No alcohol.</li>
      <li><strong>Two 45-minute workouts.</strong> One must be outdoors. Rain, snow, or heat does not cancel it. Walks count if that is your level.</li>
      <li><strong>Drink 1 gallon of water.</strong> Every single day.</li>
      <li><strong>Read 10 pages of non-fiction.</strong> With your eyes. Audiobooks do not count.</li>
      <li><strong>Take a progress photo.</strong> Every day. Keep it in your camera roll.</li>
    </ol>
    <p class="rules-fail">Miss one task and you start 75 HARD over at Day 1. No edits. No swaps. No “I’ll do it tomorrow.”</p>`;
}

function goTab(name) {
  tab = name;
  document.querySelectorAll(".menu-btn").forEach((x) => x.classList.toggle("is-on", x.dataset.tab === name));
  render();
}

function bindTiles() {
  main.querySelectorAll("[data-go]").forEach((el) => {
    el.addEventListener("click", () => goTab(el.dataset.go));
  });
}

function quoteCardHtml(q) {
  return `<div class="quote-card">
    <span class="orn">✦ · ✦</span>
    <p>“${escapeHtml(q.t)}”</p>
    <cite>${escapeHtml(q.a)}</cite>
  </div>`;
}

function toggleDayComplete(ymd) {
  const a = currentAttempt();
  if (!a) return;
  const today = todayYmd();
  if (ymd > today) return;
  const idx = dayIndex(a.startedOn, ymd);
  if (idx < 0 || idx >= 75) return;
  if (!a.days[ymd]) a.days[ymd] = emptyDay();
  const on = !isComplete(a.days[ymd]);
  TASKS.forEach((t) => { a.days[ymd][t.id] = on; });
  save();
}

function calendarHtml() {
  const a = currentAttempt();
  const today = todayYmd();
  const { y, m } = calCursor;
  const label = new Date(y, m, 1).toLocaleDateString(undefined, { month: "long", year: "numeric" });
  const pad = new Date(y, m, 1).getDay();
  const last = new Date(y, m + 1, 0).getDate();
  const week = ["s", "m", "t", "w", "t", "f", "s"].map((d) => `<span>${d}</span>`).join("");
  let days = "";
  for (let i = 0; i < pad; i++) days += `<span class="cal-day"></span>`;
  for (let d = 1; d <= last; d++) {
    const ymd = `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    const cls = ["cal-day", "num"];
    let inRun = false;
    if (a) {
      const idx = dayIndex(a.startedOn, ymd);
      inRun = idx >= 0 && idx < 75;
    }
    if (ymd === today) cls.push("today");
    if (inRun && isComplete(a.days[ymd])) cls.push("done");
    else if (inRun && ymd < today) cls.push("miss");
    else if (inRun) cls.push("in");
    const can = a ? (inRun && ymd <= today) : ymd === today;
    days += `<button type="button" class="${cls.join(" ")}" data-ymd="${ymd}" ${can ? "" : "disabled"}>${d}</button>`;
  }
  return `<section class="cal" aria-label="75 HARD calendar">
    <div class="cal-head">
      <button type="button" class="cal-nav" id="cal-prev" aria-label="Previous month">‹</button>
      <h3>${label}</h3>
      <button type="button" class="cal-nav" id="cal-next" aria-label="Next month">›</button>
    </div>
    <div class="cal-week">${week}</div>
    <div class="cal-grid">${days}</div>
    <p class="cal-hint">Tap a day to mark 75 HARD complete. Tap again to undo.</p>
  </section>`;
}

function bindCalendar() {
  const prev = document.getElementById("cal-prev");
  const next = document.getElementById("cal-next");
  if (prev) prev.onclick = () => {
    calCursor.m -= 1;
    if (calCursor.m < 0) { calCursor.m = 11; calCursor.y -= 1; }
    render();
  };
  if (next) next.onclick = () => {
    calCursor.m += 1;
    if (calCursor.m > 11) { calCursor.m = 0; calCursor.y += 1; }
    render();
  };
  main.querySelectorAll(".cal-day.num").forEach((btn) => {
    btn.addEventListener("click", () => {
      const ymd = btn.dataset.ymd;
      if (!currentAttempt()) {
        if (ymd !== todayYmd()) return;
        startAttempt();
      }
      toggleDayComplete(ymd);
      render();
    });
  });
}

function bentoHtml() {
  return `<div class="bento">
    <button type="button" class="tile tile-path" data-go="path"><em>map</em><strong>Path</strong><small>Day 1 through 75</small></button>
    <button type="button" class="tile tile-diary" data-go="diary"><em>write</em><strong>Diary</strong><small>a page for the mess</small></button>
    <button type="button" class="tile tile-todo" data-go="todo"><em>list</em><strong>To-do</strong><small>little stuff that counts</small></button>
    <button type="button" class="tile tile-spark" data-go="spark"><em>words</em><strong>Spark</strong><small>quotes when you dip</small></button>
  </div>`;
}

function todayListHtml(day, live) {
  const d = day || emptyDay();
  const n = TASKS.filter((t) => d[t.id]).length;
  return `<aside class="rules-panel today-list">
    <h3>Today</h3>
    <div class="tasks">
      ${TASKS.map((t) => `
        <button type="button" class="task ${d[t.id] ? "is-on" : ""}" data-task="${t.id}">
          <span class="glyph">${t.glyph}</span>
          <span>
            <span class="task-name">${t.name}</span>
            ${t.hint ? `<span class="task-hint">${t.hint}</span>` : ""}
          </span>
          <span class="dot">✓</span>
        </button>`).join("")}
    </div>
    <div class="progress"><span style="width:${(n / 7) * 100}%"></span></div>
  </aside>`;
}

function renderToday() {
  const miss = enforceStreak();
  const a = currentAttempt();
  const q = quoteFor(todayYmd());
  const today = todayYmd();

  let cta = `<button class="home-begin is-lit" id="begin">Start 75 HARD</button>`;
  let day = emptyDay();
  let live = false;

  if (miss?.finished) {
    cta = `<div class="home-status is-win">75 HARD complete</div>`;
  } else if (miss?.missed) {
    cta = `<button class="home-begin is-lit" id="begin">Start 75 HARD again</button>
      <p class="cal-hint">Day ${miss.dayNum} did not close. That is a restart.</p>`;
  } else if (a) {
    const idx = dayIndex(a.startedOn, today) + 1;
    if (!a.days[today]) a.days[today] = emptyDay();
    day = a.days[today];
    const done = TASKS.filter((t) => day[t.id]).length;
    const n = Math.max(1, Math.min(idx, 75));
    cta = `<div class="home-status">Day ${n} · 75 HARD · ${done}/7 today</div>`;
    live = idx >= 1 && idx <= 75;
  }

  main.innerHTML = `<div class="home">
    <div class="home-intro">
      <p class="note-hi">hey gabby — this is 75 HARD.</p>
      ${quoteCardHtml(q)}
    </div>
    <div class="home-split">
      <div class="home-col">
        ${calendarHtml()}
        ${cta}
      </div>
      ${todayListHtml(day, live)}
    </div>
  </div>`;

  const begin = document.getElementById("begin");
  if (begin) begin.onclick = () => { startAttempt(); render(); };
  bindTiles();
  bindCalendar();
  main.querySelectorAll(".task").forEach((btn) => {
    btn.addEventListener("click", () => {
      let att = currentAttempt();
      if (!att) {
        startAttempt();
        att = currentAttempt();
      }
      if (!att.days[today]) att.days[today] = emptyDay();
      att.days[today][btn.dataset.task] = !att.days[today][btn.dataset.task];
      save();
      render();
    });
  });
}

function attemptHistoryHtml(exceptId) {
  return state.attempts
    .filter((x) => x.id !== exceptId && x.endedOn)
    .slice()
    .reverse()
    .map((x) => {
      const label = x.reason === "finished" ? "finished" : x.reason === "missed" ? "broke" : "ended";
      return `<div class="attempt">${x.startedOn} → ${x.endedOn} · ${label}</div>`;
    })
    .join("");
}

function renderPath() {
  const a = currentAttempt();
  const today = todayYmd();
  const history = attemptHistoryHtml(a?.id);
  const legend = `<div class="legend">
      <span><i class="l-done"></i>done</span>
      <span><i class="l-today"></i>today</span>
      <span><i class="l-wait"></i>ahead</span>
      <span><i class="l-miss"></i>miss</span>
    </div>`;
  if (!a) {
    main.innerHTML = `<div class="section-h"><h2>Path</h2><span>not started</span></div>
      <p class="flourish">75 HARD</p>
      <p class="empty">Start 75 HARD on Today. The grid lives here.</p>
      ${history ? `<div class="attempts">${history}</div>` : ""}`;
    return;
  }
  let cells = "";
  for (let i = 0; i < 75; i++) {
    const ymd = addDays(a.startedOn, i);
    const cls = [];
    if (ymd === today) cls.push("today");
    if (ymd > today) cls.push("future");
    else if (isComplete(a.days[ymd])) cls.push("done");
    else if (ymd < today) cls.push("fail");
    cells += `<div class="cell ${cls.join(" ")}" title="${ymd}">${i + 1}</div>`;
  }

  main.innerHTML = `
    <div class="section-h"><h2>Path</h2><span>from ${a.startedOn}</span></div>
    ${legend}
    <div class="grid-75">${cells}</div>
    ${history ? `<div class="attempts">${history}</div>` : ""}`;
}

function renderDiary() {
  const entries = [...state.diary].reverse();
  main.innerHTML = `
    <div class="section-h"><h2>Diary</h2><span>this device only</span></div>
    <p class="flourish">dear page</p>
    <div class="journal">
      <textarea class="diary-compose" id="diary-text" placeholder="Write it ugly. Keep it true.">${escapeHtml(diaryDraft)}</textarea>
      <div class="row-btns">
        <button class="btn btn-solid" id="save-diary">Keep this</button>
      </div>
    </div>
    <div class="entries">
      ${entries.length ? entries.map((e) => `
        <article class="entry">
          <time>${prettyDate(e.date)} · ${e.time || ""}</time>
          <p>${escapeHtml(e.text)}</p>
        </article>`).join("") : `<p class="empty">Nothing yet. Write badly. Write true.</p>`}
    </div>`;
  const ta = document.getElementById("diary-text");
  ta.addEventListener("input", () => { diaryDraft = ta.value; });
  document.getElementById("save-diary").onclick = () => {
    const text = ta.value.trim();
    if (!text) return;
    const now = new Date();
    state.diary.push({
      id: String(now.getTime()),
      date: todayYmd(),
      time: now.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }),
      text,
    });
    diaryDraft = "";
    save();
    render();
  };
}

function renderSpark() {
  const daily = quoteFor(todayYmd());
  const rest = QUOTES.filter((q) => q !== daily).slice(0, 8);
  main.innerHTML = `
    <div class="section-h"><h2>Spark</h2><span>today’s line</span></div>
    ${quoteCardHtml(daily)}
    <p class="flourish">more light</p>
    <div class="spark-stack">
      ${rest.map((q) => `<article class="spark-mini"><p>“${escapeHtml(q.t)}”</p><cite>${escapeHtml(q.a)}</cite></article>`).join("")}
    </div>`;
}

function renderTodo() {
  main.innerHTML = `
    <div class="section-h"><h2>To-do</h2><span>${state.todos.filter((t) => !t.done).length} open</span></div>
    <p class="flourish">little mercies</p>
    <div class="todo-add">
      <input id="todo-in" placeholder="Something small…" value="${escapeAttr(todoDraft)}" />
      <button class="btn btn-solid" id="todo-add">Add</button>
    </div>
    <div class="todo-list">
      ${state.todos.length ? state.todos.map((t) => `
        <div class="todo-item ${t.done ? "is-on" : ""}" data-id="${t.id}">
          <span class="dot">${t.done ? "✓" : ""}</span>
          <span>${escapeHtml(t.text)}</span>
          <button class="x" data-del="${t.id}" aria-label="Delete">×</button>
        </div>`).join("") : `<p class="empty">No list yet. Errands, calls, little mercies.</p>`}
    </div>`;
  const input = document.getElementById("todo-in");
  input.addEventListener("input", () => { todoDraft = input.value; });
  const add = () => {
    const text = input.value.trim();
    if (!text) return;
    state.todos.push({ id: String(Date.now()), text, done: false });
    todoDraft = "";
    save();
    render();
  };
  document.getElementById("todo-add").onclick = add;
  input.addEventListener("keydown", (e) => { if (e.key === "Enter") add(); });
  main.querySelectorAll(".todo-item").forEach((row) => {
    row.addEventListener("click", (e) => {
      if (e.target.dataset.del) return;
      const item = state.todos.find((t) => t.id === row.dataset.id);
      if (item) { item.done = !item.done; save(); render(); }
    });
  });
  main.querySelectorAll("[data-del]").forEach((b) => {
    b.addEventListener("click", (e) => {
      e.stopPropagation();
      state.todos = state.todos.filter((t) => t.id !== b.dataset.del);
      save();
      render();
    });
  });
}

function prettyDate(ymd) {
  return parseYmd(ymd).toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

function escapeHtml(s) {
  return s.replace(/[&<>"']/g, (c) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  }[c]));
}

function escapeAttr(s) {
  return escapeHtml(s || "").replace(/\n/g, "&#10;");
}

function renderRules() {
  main.innerHTML = `
    <div class="section-h"><h2>75 HARD</h2><span>the program</span></div>
    <p class="note-hi">Not a fitness challenge. Mental toughness. Zero compromise.</p>
    ${rulesBlockHtml()}
    <div class="card" style="margin-top:16px">
      <p class="status"><b>If you fail:</b> start over at Day 1. Changing a rule so you can “finish” is not finishing.</p>
      <p class="status"><b>Diet &amp; workouts:</b> yours to choose. 75 HARD does not pick the meal plan or the exercises. It does pick no cheats, no alcohol, two 45-minute sessions, one outside.</p>
      <p class="status"><b>Outside:</b> backyard, driveway, or a walk. Kids can do it with you. Weather is not a skip.</p>
      <p class="status"><b>Too out of shape?</b> Two 45-minute walks still count. The program is built to start where you are.</p>
      <p class="status"><b>Doctor first.</b> Talk to a physician before you start if you have any health questions.</p>
      <p class="rules-note">75 HARD is Andy Frisella’s program. This page is Gabby’s personal tracker, not the official app. <a href="https://andyfrisella.com/pages/75hard-info" target="_blank" rel="noopener">Official info</a></p>
    </div>`;
}

function render() {
  document.body.dataset.tab = tab;
  if (tab === "today") renderToday();
  else if (tab === "path") renderPath();
  else if (tab === "diary") renderDiary();
  else if (tab === "spark") renderSpark();
  else if (tab === "rules") renderRules();
  else renderTodo();
}

document.querySelectorAll(".menu-btn").forEach((b) => {
  b.addEventListener("click", () => goTab(b.dataset.tab));
});

document.getElementById("btn-home").addEventListener("click", () => goTab("today"));

document.getElementById("btn-rules").addEventListener("click", () => goTab("rules"));

document.getElementById("btn-settings").addEventListener("click", () => {
  openSheet(
    "This journal",
    `<p>Everything lives in this browser, for Gabby only. Clearing Safari data erases the streak, the diary, and the list.</p>
     <p>On iPhone: Share → Add to Home Screen.</p>
     <div class="settings-list"></div>`,
    [
      {
        label: "Save backup",
        solid: true,
        onClick: () => {
          const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
          const a = document.createElement("a");
          a.href = URL.createObjectURL(blob);
          a.download = `gabby-75-${todayYmd()}.json`;
          a.click();
        },
      },
      {
        label: "Load backup",
        onClick: () => {
          const inp = document.createElement("input");
          inp.type = "file";
          inp.accept = "application/json";
          inp.onchange = () => {
            const file = inp.files[0];
            if (!file) return;
            file.text().then((t) => {
              state = JSON.parse(t);
              save();
              closeSheet();
              render();
            });
          };
          inp.click();
        },
      },
      { label: "Close", onClick: closeSheet },
    ]
  );
});

render();

if ("serviceWorker" in navigator && location.protocol.startsWith("http")) {
  navigator.serviceWorker.register("./sw.js").catch(() => {});
}
