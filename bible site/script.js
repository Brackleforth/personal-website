const TOTAL_KJV_VERSES = 31102;
const BOOK_FILES = [
    "Genesis",
    "Exodus",
    "Leviticus",
    "Numbers",
    "Deuteronomy",
    "Joshua",
    "Judges",
    "Ruth",
    "1 Samuel",
    "2 Samuel",
    "1 Kings",
    "2 Kings",
    "1 Chronicles",
    "2 Chronicles",
    "Ezra",
    "Nehemiah",
    "Esther",
    "Job",
    "Psalms",
    "Proverbs",
    "Ecclesiastes",
    "Song of Solomon",
    "Isaiah",
    "Jeremiah",
    "Lamentations",
    "Ezekiel",
    "Daniel",
    "Hosea",
    "Joel",
    "Amos",
    "Obadiah",
    "Jonah",
    "Micah",
    "Nahum",
    "Habakkuk",
    "Zephaniah",
    "Haggai",
    "Zechariah",
    "Malachi",
    "Matthew",
    "Mark",
    "Luke",
    "John",
    "Acts",
    "Romans",
    "1 Corinthians",
    "2 Corinthians",
    "Galatians",
    "Ephesians",
    "Philippians",
    "Colossians",
    "1 Thessalonians",
    "2 Thessalonians",
    "1 Timothy",
    "2 Timothy",
    "Titus",
    "Philemon",
    "Hebrews",
    "James",
    "1 Peter",
    "2 Peter",
    "1 John",
    "2 John",
    "3 John",
    "Jude",
    "Revelation"
];

// KJV Verse counts per book (standard)
const BOOK_VERSE_COUNTS = {
    "Genesis": 1533,
    "Exodus": 1213,
    "Leviticus": 859,
    "Numbers": 1288,
    "Deuteronomy": 959,
    "Joshua": 658,
    "Judges": 618,
    "Ruth": 85,
    "1 Samuel": 810,
    "2 Samuel": 695,
    "1 Kings": 816,
    "2 Kings": 719,
    "1 Chronicles": 942,
    "2 Chronicles": 822,
    "Ezra": 280,
    "Nehemiah": 406,
    "Esther": 167,
    "Job": 1070,
    "Psalms": 2461,
    "Proverbs": 915,
    "Ecclesiastes": 222,
    "Song of Solomon": 117,
    "Isaiah": 1292,
    "Jeremiah": 1364,
    "Lamentations": 154,
    "Ezekiel": 1273,
    "Daniel": 357,
    "Hosea": 197,
    "Joel": 73,
    "Amos": 146,
    "Obadiah": 21,
    "Jonah": 48,
    "Micah": 105,
    "Nahum": 47,
    "Habakkuk": 56,
    "Zephaniah": 53,
    "Haggai": 38,
    "Zechariah": 211,
    "Malachi": 55,

    "Matthew": 1071,
    "Mark": 678,
    "Luke": 1151,
    "John": 879,
    "Acts": 1007,
    "Romans": 433,
    "1 Corinthians": 437,
    "2 Corinthians": 257,
    "Galatians": 149,
    "Ephesians": 155,
    "Philippians": 104,
    "Colossians": 95,
    "1 Thessalonians": 89,
    "2 Thessalonians": 47,
    "1 Timothy": 113,
    "2 Timothy": 83,
    "Titus": 46,
    "Philemon": 25,
    "Hebrews": 303,
    "James": 108,
    "1 Peter": 105,
    "2 Peter": 61,
    "1 John": 105,
    "2 John": 13,
    "3 John": 14,
    "Jude": 25,
    "Revelation": 404
};

const OLD_TESTAMENT = [
    "Genesis", "Exodus", "Leviticus", "Numbers", "Deuteronomy", "Joshua", "Judges", "Ruth",
    "1 Samuel", "2 Samuel", "1 Kings", "2 Kings", "1 Chronicles", "2 Chronicles", "Ezra",
    "Nehemiah", "Esther", "Job", "Psalms", "Proverbs", "Ecclesiastes", "Song of Solomon",
    "Isaiah", "Jeremiah", "Lamentations", "Ezekiel", "Daniel", "Hosea", "Joel", "Amos",
    "Obadiah", "Jonah", "Micah", "Nahum", "Habakkuk", "Zephaniah", "Haggai", "Zechariah", "Malachi"
];

const NEW_TESTAMENT = [
    "Matthew", "Mark", "Luke", "John", "Acts", "Romans", "1 Corinthians", "2 Corinthians",
    "Galatians", "Ephesians", "Philippians", "Colossians", "1 Thessalonians", "2 Thessalonians",
    "1 Timothy", "2 Timothy", "Titus", "Philemon", "Hebrews", "James", "1 Peter", "2 Peter",
    "1 John", "2 John", "3 John", "Jude", "Revelation"
];

let bibleCommands = [];
let filteredCommands = [];

let currentPage = 1;
let pageSize = 10;

// Display toggles
let displayConfig = {
    reference: true,
    verse_text: true,
    instruction: true,
    command_giver: true,
    command_receiver: true,
    category: true,
    command_type: true,
    covenant: true,        // ← changed to true by default
    applicable_to: true,   // ← new
    notes: false
};

let frequencyData = [];   // ← Important for reference toggling

let mappedVerseCount = 0;

function buildBookButtons() {
    const otContainer = document.getElementById("otBooks");
    const ntContainer = document.getElementById("ntBooks");

    otContainer.innerHTML = "";
    ntContainer.innerHTML = "";

    // Use the same count that the overall progress bar uses
    let remaining = mappedVerseCount;

    // Calculate sequential progress for every book
    const sequentialProgress = {};

    BOOK_FILES.forEach(book => {
        const total = BOOK_VERSE_COUNTS[book];

        let mapped;

        if (remaining >= total) {
            mapped = total;
            remaining -= total;
        } else {
            mapped = Math.max(remaining, 0);
            remaining = 0;
        }

        sequentialProgress[book] = {
            mapped,
            total,
            percentage: ((mapped / total) * 100).toFixed(4)
        };
    });

    function createButtons(books, container) {
        books.forEach(book => {
            const progress = sequentialProgress[book];

            const btn = document.createElement("button");
            btn.className = "book-progress-btn";

            btn.innerHTML = `
                <strong>${book}</strong><br>
                <small>${progress.mapped} / ${progress.total} verses • ${progress.percentage}%</small>
            `;

            if (progress.percentage === 100)
                btn.style.borderColor = "#4caf50";
            else if (progress.percentage > 0)
                btn.style.borderColor = "#ff9800";

            btn.addEventListener("click", () => openBook(book));

            container.appendChild(btn);
        });
    }

    createButtons(OLD_TESTAMENT, otContainer);
    createButtons(NEW_TESTAMENT, ntContainer);
}

function openBook(bookName) {
    document.getElementById("homeView").style.display = "none";
    document.getElementById("appView").style.display = "block";

    resetAllFilters();
    activeFilters.book = bookName;           // ← Updated
    updateFilterButton("book");

    document.getElementById("sortedTableContainer").style.display = "none";
    document.getElementById("results").style.display = "block";
    document.getElementById("pagination").style.display = "block";

    currentPage = 1;
    applyFilters();
}

function resetAllFilters() {
    Object.keys(activeFilters).forEach(key => activeFilters[key] = "");
    document.querySelectorAll(".current-value").forEach(el => el.textContent = "All");
}

function openFilteredView(filterType, value) {
    document.getElementById("homeView").style.display = "none";
    document.getElementById("appView").style.display = "block";

    resetAllFilters();

    if (filterType === "book") {
        activeFilters.book = value;
        updateFilterButton("book");
    } else if (filterType === "testament") {
        activeFilters.testament = value;
        updateFilterButton("testament");
    }

    document.getElementById("sortedTableContainer").style.display = "none";
    document.getElementById("results").style.display = "block";
    document.getElementById("pagination").style.display = "block";

    currentPage = 1;
    applyFilters();
}

async function loadData() {
    try {
        const promises = BOOK_FILES.map(async (book) => {
            const response = await fetch(`data/books/${book}.json`);
            if (!response.ok) {
                console.warn(`Missing file: ${book}.json`);
                return [];
            }
            return await response.json();
        });

        const books = await Promise.all(promises);
        bibleCommands = books.flat();

        console.log(`Loaded ${bibleCommands.length} commands`);

        updateProgress();

        bibleCommands = bibleCommands.filter(
            c => c.instruction && String(c.instruction).trim() !== ""
        );

        // NEW: Build everything
        buildBookButtons();
        attachFilterButtons();     // ← Important
        attachEvents();

        filteredCommands = bibleCommands;
        render();

    } catch (err) {
        console.error("Load error:", err);
        alert("Error loading data. Check console.");
    }
}

function updateProgress() {
    const uniqueVerses = new Set(
        bibleCommands.map(c => `${c.book}|${c.chapter}|${c.verse}`)
    );

    mappedVerseCount = uniqueVerses.size;

    const percent = (mappedVerseCount / TOTAL_KJV_VERSES) * 100;

    document.getElementById("progressBar").style.width = percent.toFixed(2) + "%";
    document.getElementById("progressText").innerHTML = `
        ${mappedVerseCount} / ${TOTAL_KJV_VERSES} verses mapped
        <span style="font-size:0.75em; color:#555;">(${percent.toFixed(4)}%)</span>
    `;
}

function attachEvents() {

    // Compile Results
    document.getElementById("compileBtn").addEventListener("click", () => {
        currentPage = 1;
        applyFilters();
        document.getElementById("sortedTableContainer").style.display = "none";
        document.getElementById("results").style.display = "block";
        document.getElementById("pagination").style.display = "block";
    });

    // Sort Results
    document.getElementById("sortBtn").addEventListener("click", renderSortedInstructions);

    // Page Size
    document.getElementById("pageSizeFilter").addEventListener("change", (e) => {
        pageSize = e.target.value === "all" ? "all" : parseInt(e.target.value);
        currentPage = 1;
        render();
    });

    // Sidebar Toggle
    document.getElementById("sidebarToggle").addEventListener("click", () => {
        const sidebar = document.getElementById("sidebar");
        sidebar.classList.toggle("hidden");
        document.body.classList.toggle("sidebar-collapsed");
    });

    // Display toggles
    document.querySelectorAll('.display-toggle').forEach(checkbox => {
        checkbox.addEventListener('change', (e) => {
            const field = e.target.dataset.field;
            displayConfig[field] = e.target.checked;
            if (filteredCommands.length > 0) renderResults();
        });
    });

    // Click outside to close filter panel
    document.addEventListener("click", (e) => {
        const panel = document.getElementById("filterPanel");
        if (panel && !e.target.closest("#filterPanel") && !e.target.closest(".filter-btn")) {
            panel.style.display = "none";
        }
    });

    // Big Browse Buttons
    document.getElementById("browseAllBtn").addEventListener("click", () => {
        openFilteredView("book", "");
    });

    document.getElementById("browseOTBtn").addEventListener("click", () => {
        openFilteredView("testament", "Old Testament");
    });

    document.getElementById("browseNTBtn").addEventListener("click", () => {
        openFilteredView("testament", "New Testament");
    });
}

/* ====================== CORE FUNCTIONS ====================== */

function applyFilters() {
    filteredCommands = bibleCommands.filter(matchesFilters);
    render();
}

function render() {
    renderSummary();
    renderResults();
    renderPagination();
}

/* ---------------- SUMMARY ---------------- */
function renderSummary() {
    const summary = document.getElementById("summary");
    const filters = getActiveFilters();

    summary.innerHTML = `
        <strong>${filteredCommands.length}</strong> results found<br>
        Filters: ${filters.length ? filters.join(", ") : "None"}
    `;
}

function getActiveFilters() {
    const filters = [];

    if (activeFilters.book) filters.push("Book: " + activeFilters.book);
    if (activeFilters.testament) filters.push("Testament: " + activeFilters.testament);
    if (activeFilters.giver) filters.push("Giver: " + activeFilters.giver);
    if (activeFilters.receiver) filters.push("Receiver: " + activeFilters.receiver);
    if (activeFilters.category) filters.push("Category: " + activeFilters.category);
    if (activeFilters.covenant) filters.push("Covenant: " + activeFilters.covenant);

    return filters;
}

/* ---------------- NORMAL RESULTS ---------------- */
/* ---------------- RESULTS ---------------- */
function renderResults() {
    const results = document.getElementById("results");
    results.innerHTML = "";

    if (filteredCommands.length === 0) {
        results.innerHTML = "<p>No results to display. Click 'Compile Results'.</p>";
        return;
    }

    const pageData = getPageData();

    pageData.forEach(command => {
        const div = document.createElement("div");
        div.className = "command-card";

        let html = "";

        if (displayConfig.reference) html += `<h3>${command.reference}</h3>`;
        if (displayConfig.verse_text) html += `<p><strong>Verse:</strong> ${command.verse_text}</p>`;
        if (displayConfig.instruction) html += `<p><strong>Instruction:</strong> ${command.instruction}</p>`;
        if (displayConfig.command_giver) html += `<p><strong>Giver:</strong> ${command.command_giver}</p>`;
        if (displayConfig.command_receiver) html += `<p><strong>Receiver:</strong> ${command.command_receiver}</p>`;
        if (displayConfig.category) html += `<p><strong>Category:</strong> ${command.category.join(", ")}</p>`;
        if (displayConfig.command_type) html += `<p><strong>Type:</strong> ${command.command_type}</p>`;

        // Covenant
        if (displayConfig.covenant && command.covenant) {
            html += `<p><strong>Covenant:</strong> ${command.covenant}</p>`;
        }

        // Applicability
        if (displayConfig.applicable_to) {
            const applicableText = command.applicable_today ? "✅ Yes" : "❌ No";
            let toWhom = "";

            if (command.applicable_to && command.applicable_to.length > 0) {
                toWhom = `<br><strong>Applies to:</strong> ${command.applicable_to.join(", ")}`;
            }

            html += `
                <p><strong>Applicable Today:</strong> ${applicableText}${toWhom}</p>
            `;
        }

        if (displayConfig.notes && command.notes) {
            html += `<p><strong>Notes:</strong> ${command.notes}</p>`;
        }

        div.innerHTML = html || "<p>No fields selected to display.</p>";
        results.appendChild(div);
    });
}

/* ---------------- PAGINATION ---------------- */
function getPageData() {
    if (pageSize === "all") return filteredCommands;
    const start = (currentPage - 1) * pageSize;
    const end = start + pageSize;
    return filteredCommands.slice(start, end);
}

function renderPagination() {
    const pagination = document.getElementById("pagination");
    pagination.innerHTML = "";

    if (pageSize === "all") return;

    const totalPages = Math.ceil(filteredCommands.length / pageSize);
    for (let i = 1; i <= totalPages; i++) {
        const btn = document.createElement("span");
        btn.className = "page-link";
        if (i === currentPage) btn.classList.add("active");
        btn.textContent = i;
        btn.addEventListener("click", () => {
            currentPage = i;
            render();
        });
        pagination.appendChild(btn);
    }
}

/* ---------------- FILTER LOGIC ---------------- */
function matchesFilters(command) {
    if (!command.instruction || String(command.instruction).trim() === "") return false;

    if (activeFilters.book && command.book !== activeFilters.book) return false;
    if (activeFilters.testament && command.testament !== activeFilters.testament) return false;
    if (activeFilters.giver && command.command_giver !== activeFilters.giver) return false;
    if (activeFilters.receiver && command.command_receiver !== activeFilters.receiver) return false;
    if (activeFilters.covenant && command.covenant !== activeFilters.covenant) return false;
    if (activeFilters.category && !command.category.includes(activeFilters.category)) return false;

    if (activeFilters.applicable) {
        const isApplicable = command.applicable_today ? "Applicable Today" : "Not Applicable Today";
        if (isApplicable !== activeFilters.applicable) return false;
    }

    // Instruction Type
    if (activeFilters.instructionType) {
        if (activeFilters.instructionType === "Thing To Do" && !command.things_to_do) return false;
        if (activeFilters.instructionType === "Thing Not To Do" && !command.things_not_to_do) return false;
    }

    // Command Style
    if (activeFilters.commandStyle && command.command_type !== activeFilters.commandStyle) return false;

    // Example Type (if you have the field)
    if (activeFilters.exampleType) {
        // Add your logic here based on your data structure
    }

    return true;
}

// Active filters state
let activeFilters = {
    book: "",
    testament: "",
    giver: "",
    receiver: "",
    covenant: "",
    applicable: "",
    category: "",
    instructionType: "",
    exampleType: "",
    commandStyle: ""
};

// Reusable filter panel
let currentFilterKey = null;

function createFilterPanel() {
    let panel = document.getElementById("filterPanel");
    if (!panel) {
        panel = document.createElement("div");
        panel.id = "filterPanel";
        panel.innerHTML = `
            <div class="panel-header" id="panelTitle"></div>
            <input type="text" id="filterSearch" placeholder="Search..." autocomplete="off">
            <div class="options" id="filterOptions"></div>
        `;
        document.body.appendChild(panel);
    }
    return panel;
}

function showFilterPanel(filterKey, label, options) {
    currentFilterKey = filterKey;
    const panel = createFilterPanel();
    const titleEl = document.getElementById("panelTitle");
    const searchInput = document.getElementById("filterSearch");
    const optionsContainer = document.getElementById("filterOptions");

    titleEl.textContent = label;
    searchInput.value = "";
    optionsContainer.innerHTML = "";

    // "All" option
    const allOption = document.createElement("div");
    allOption.className = `filter-option all ${!activeFilters[filterKey] ? 'active' : ''}`;
    allOption.textContent = "All";
    allOption.onclick = () => selectFilterOption("");
    optionsContainer.appendChild(allOption);

    options.forEach(opt => {
        const div = document.createElement("div");
        div.className = `filter-option ${activeFilters[filterKey] === opt ? 'active' : ''}`;
        div.textContent = opt;
        div.onclick = () => selectFilterOption(opt);
        optionsContainer.appendChild(div);
    });

    // Position panel to the right of the button
    const btn = document.getElementById(`btn-${filterKey}`);
    const rect = btn.getBoundingClientRect();
    panel.style.top = `${rect.top}px`;
    panel.style.left = `${rect.right + 8}px`;
    panel.style.display = "flex";

    // Auto-filter on type
    searchInput.focus();
    searchInput.oninput = () => {
        const term = searchInput.value.toLowerCase().trim();
        Array.from(optionsContainer.children).forEach(el => {
            if (el.textContent === "All") return;
            el.style.display = el.textContent.toLowerCase().includes(term) ? "" : "none";
        });
    };
}

function selectFilterOption(value) {
    if (currentFilterKey) {
        activeFilters[currentFilterKey] = value;
        updateFilterButton(currentFilterKey);
        applyFilters();
    }
    document.getElementById("filterPanel").style.display = "none";
}

function updateFilterButton(key) {
    const btn = document.getElementById(`btn-${key}`);
    if (!btn) return;
    const span = btn.querySelector(".current-value");
    const value = activeFilters[key];
    span.textContent = value ? value : "All";
}

// Attach click listeners
function attachFilterButtons() {
    const filters = [
        {key: "book", label: "Book", getOptions: () => [...new Set(bibleCommands.map(c => c.book))].sort()},
        {key: "testament", label: "Testament", getOptions: () => ["Old Testament", "New Testament"]},
        {key: "giver", label: "Command Giver", getOptions: () => [...new Set(bibleCommands.map(c => c.command_giver))].sort()},
        {key: "receiver", label: "Command Receiver", getOptions: () => [...new Set(bibleCommands.map(c => c.command_receiver))].sort()},
        {key: "covenant", label: "Covenant", getOptions: () => [...new Set(bibleCommands.map(c => c.covenant).filter(Boolean))].sort()},
        {key: "applicable", label: "Applicability", getOptions: () => ["Applicable Today", "Not Applicable Today"]},
        {key: "category", label: "Category", getOptions: () => [...new Set(bibleCommands.flatMap(c => c.category || []))].sort()},
        {key: "instructionType", label: "Instruction Type", getOptions: () => ["Thing To Do", "Thing Not To Do"]},
        {key: "exampleType", label: "Example Type", getOptions: () => ["Person To Emulate", "Person Not To Emulate"]},
        {key: "commandStyle", label: "Command Style", getOptions: () => ["Direct Command", "Implied Command"]}
    ];

    filters.forEach(f => {
        const btn = document.getElementById(`btn-${f.key}`);
        if (btn) {
            btn.addEventListener("click", () => {
                showFilterPanel(f.key, f.label, f.getOptions());
            });
        }
    });
}

/* ==================== SORTED FREQUENCY TABLE ==================== */

function renderSortedInstructions() {
    const container = document.getElementById("sortedTableContainer");
    const tbody = document.getElementById("frequencyTableBody");
    tbody.innerHTML = "";

    if (filteredCommands.length === 0) {
        tbody.innerHTML = `<tr><td colspan="3" style="padding:20px; text-align:center; color:red;">
            No results. Please click "Compile Results" first.
        </td></tr>`;
        container.style.display = "block";
        document.getElementById("results").style.display = "none";
        document.getElementById("pagination").style.display = "none";
        return;
    }

    const map = new Map();

    filteredCommands.forEach(cmd => {
        const instr = (cmd.instruction || "").trim();
        if (!instr) return;

        if (!map.has(instr)) {
            map.set(instr, { instruction: instr, count: 0, references: [] });
        }
        const entry = map.get(instr);
        entry.count++;
        entry.references.push(cmd.reference);
    });

    frequencyData = Array.from(map.values()).sort((a, b) => b.count - a.count);

    frequencyData.forEach((item, index) => {
        const row = document.createElement("tr");
        row.style.borderBottom = "1px solid #ddd";

        row.innerHTML = `
            <td style="padding:12px; vertical-align:top;"><strong>${item.instruction}</strong></td>
            <td style="padding:12px; text-align:center; vertical-align:top; font-weight:bold; background:#f0f0f0;">
                ${item.count}
            </td>
            <td style="padding:12px; vertical-align:top;">
                <button class="toggle-ref-btn" data-index="${index}" style="padding:5px 10px; font-size:0.9em; cursor:pointer;">
                    Show ${item.references.length} references
                </button>
                <div class="ref-list" data-index="${index}" style="display:none; margin-top:8px; padding:10px; background:#f9f9f9; border-radius:4px; font-size:0.95em;">
                    ${item.references.map(ref => `<div>${ref}</div>`).join("")}
                </div>
            </td>
        `;
        tbody.appendChild(row);
    });

    container.style.display = "block";
    document.getElementById("results").style.display = "none";
    document.getElementById("pagination").style.display = "none";
}

document.getElementById("appView").style.display = "none";
document.getElementById("homeView").style.display = "block";

document.getElementById("homeBtn").addEventListener("click", () => {
    document.getElementById("appView").style.display = "none";
    document.getElementById("homeView").style.display = "block";
});

/* ---------------- INIT ---------------- */
loadData();