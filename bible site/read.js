// Bible reading mode. Builds itself from kjv.json:
//   { "Genesis": { "1": { "1": "In the beginning...", ... }, ... }, ... }
//
// Link to a verse with:  read.html?book=Genesis&chapter=14&verse=2
// (book names like "Psalms" / "Psalm" and "Song of Solomon" / "Song Of Solomon" both work)

let bible = null;
let books = [];          // kjv.json book keys, in order
let currentBook = null;
let currentChapter = 1;

// Friendlier names for display; kjv.json uses the keys on the left
const DISPLAY_NAMES = { "Psalm": "Psalms", "Song Of Solomon": "Song of Solomon" };

function displayName(book) {
    return DISPLAY_NAMES[book] || book;
}

// Match "psalms", "Psalm", "song of solomon", etc. to a kjv.json key
function findBook(name) {
    if (!name) return null;
    const wanted = name.trim().toLowerCase();
    return books.find(b => b.toLowerCase() === wanted || displayName(b).toLowerCase() === wanted) || null;
}

function chapterCount(book) {
    return Object.keys(bible[book]).length;
}

function chapterNumbers(book) {
    return Object.keys(bible[book]).map(Number).sort((a, b) => a - b);
}

function verseEntries(book, chapter) {
    const verses = bible[book][String(chapter)] || {};
    return Object.keys(verses)
        .map(Number)
        .sort((a, b) => a - b)
        .map(n => [n, verses[String(n)]]);
}

/* ---------------- Drawing ---------------- */

function fillBookSelect() {
    const select = document.getElementById("bookSelect");
    select.innerHTML = "";
    books.forEach(book => {
        const option = document.createElement("option");
        option.value = book;
        option.textContent = displayName(book);
        select.appendChild(option);
    });
}

function fillChapterSelect(book) {
    const select = document.getElementById("chapterSelect");
    select.innerHTML = "";
    chapterNumbers(book).forEach(n => {
        const option = document.createElement("option");
        option.value = n;
        option.textContent = n;
        select.appendChild(option);
    });
}

function showChapter(book, chapter, verse, updateHistory = true) {
    currentBook = book;
    currentChapter = chapter;

    document.getElementById("bookSelect").value = book;
    fillChapterSelect(book);
    document.getElementById("chapterSelect").value = chapter;

    const title = `${displayName(book)} ${chapter}`;
    document.getElementById("chapterTitle").textContent = title;
    document.title = `${title} (KJV) - Bible Commands Database`;

    const container = document.getElementById("verses");
    container.innerHTML = "";

    verseEntries(book, chapter).forEach(([n, text]) => {
        const p = document.createElement("p");
        p.className = "verse";
        p.id = "v" + n;

        const num = document.createElement("a");
        num.className = "verse-num";
        num.href = "#v" + n;
        num.textContent = n;
        num.setAttribute("aria-label", `Verse ${n}`);
        num.addEventListener("click", (e) => {
            e.preventDefault();
            highlightVerse(n, true);
            setUrl(book, chapter, n);
        });

        p.appendChild(num);
        p.appendChild(document.createTextNode(" " + text));
        container.appendChild(p);
    });

    updateStepButtons();

    if (updateHistory) setUrl(book, chapter, verse);

    if (verse) {
        highlightVerse(verse, true);
    } else {
        window.scrollTo({ top: 0 });
    }
}

function highlightVerse(n, scroll) {
    document.querySelectorAll(".verse.highlight").forEach(el => el.classList.remove("highlight"));
    const el = document.getElementById("v" + n);
    if (!el) return;
    el.classList.add("highlight");
    if (scroll) el.scrollIntoView({ block: "center" });
}

function setUrl(book, chapter, verse) {
    const params = new URLSearchParams({ book: displayName(book), chapter: chapter });
    if (verse) params.set("verse", verse);
    history.replaceState(null, "", "?" + params.toString() + (verse ? "#v" + verse : ""));
}

/* ---------------- Previous / next chapter ---------------- */

function neighbour(step) {
    const chapters = chapterNumbers(currentBook);
    const i = chapters.indexOf(currentChapter);

    if (chapters[i + step] !== undefined) return [currentBook, chapters[i + step]];

    const b = books.indexOf(currentBook) + step;
    if (b < 0 || b >= books.length) return null;
    const nextChapters = chapterNumbers(books[b]);
    return [books[b], step > 0 ? nextChapters[0] : nextChapters[nextChapters.length - 1]];
}

function updateStepButtons() {
    const prev = neighbour(-1);
    const next = neighbour(1);
    ["prevBtn", "prevBtnBottom"].forEach(id => {
        const btn = document.getElementById(id);
        btn.disabled = !prev;
        btn.textContent = prev ? `← ${displayName(prev[0]).toUpperCase()} ${prev[1]}` : "← PREVIOUS";
    });
    ["nextBtn", "nextBtnBottom"].forEach(id => {
        const btn = document.getElementById(id);
        btn.disabled = !next;
        btn.textContent = next ? `${displayName(next[0]).toUpperCase()} ${next[1]} →` : "NEXT →";
    });
}

function step(direction) {
    const target = neighbour(direction);
    if (target) showChapter(target[0], target[1], null);
}

/* ---------------- Start ---------------- */

function readStartFromUrl() {
    const params = new URLSearchParams(location.search);
    const book = findBook(params.get("book")) || books[0];
    let chapter = parseInt(params.get("chapter"), 10);
    if (!bible[book][String(chapter)]) chapter = chapterNumbers(book)[0];

    let verse = parseInt(params.get("verse"), 10);
    if (!verse && location.hash.startsWith("#v")) verse = parseInt(location.hash.slice(2), 10);
    if (!verse || !bible[book][String(chapter)][String(verse)]) verse = null;

    return [book, chapter, verse];
}

async function init() {
    try {
        const response = await fetch("kjv.json");
        bible = await response.json();
    } catch (err) {
        document.getElementById("chapterTitle").textContent = "Couldn't load the Bible text.";
        return;
    }

    books = Object.keys(bible);
    fillBookSelect();

    document.getElementById("bookSelect").addEventListener("change", (e) => {
        showChapter(e.target.value, chapterNumbers(e.target.value)[0], null);
    });
    document.getElementById("chapterSelect").addEventListener("change", (e) => {
        showChapter(currentBook, parseInt(e.target.value, 10), null);
    });
    ["prevBtn", "prevBtnBottom"].forEach(id =>
        document.getElementById(id).addEventListener("click", () => step(-1)));
    ["nextBtn", "nextBtnBottom"].forEach(id =>
        document.getElementById(id).addEventListener("click", () => step(1)));

    // Left / right arrow keys change chapter (unless you're in a dropdown)
    document.addEventListener("keydown", (e) => {
        if (e.target.tagName === "SELECT" || e.altKey || e.ctrlKey || e.metaKey) return;
        if (e.key === "ArrowLeft") step(-1);
        if (e.key === "ArrowRight") step(1);
    });

    const [book, chapter, verse] = readStartFromUrl();
    showChapter(book, chapter, verse, false);
}

init();
