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
    covenant: false,
    notes: false
};

async function loadData() {

    const indexResponse = await fetch("data-index.json");
    const files = await indexResponse.json();

    for (const file of files) {
        const response = await fetch(file);
        const command = await response.json();
        bibleCommands.push(command);
    }

    buildDropdowns();
    attachEvents();

    filteredCommands = bibleCommands;
    render();
}

function attachEvents() {

    document.getElementById("compileBtn")
        .addEventListener("click", () => {
            currentPage = 1;
            applyFilters();
        });

    document.getElementById("pageSizeFilter")
        .addEventListener("change", (e) => {
            pageSize = e.target.value === "all"
                ? "all"
                : parseInt(e.target.value);

            currentPage = 1;
            render();
        });

    document.querySelectorAll("select")
        .forEach(select => {
            select.addEventListener("change", () => {
                // don't auto-render; wait for compile button
            });
        });

    document.getElementById("sidebarToggle")
        .addEventListener("click", () => {
            document.getElementById("sidebar")
                .classList.toggle("hidden");
        });

    // Display toggles
    document.querySelectorAll('.display-toggle').forEach(checkbox => {
        checkbox.addEventListener('change', (e) => {
            const field = e.target.dataset.field;
            displayConfig[field] = e.target.checked;

            // Auto re-render if results are already shown
            if (filteredCommands.length > 0) {
                renderResults();
            }
        });
    });
}

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

    const book = document.getElementById("bookFilter").value;
    const testament = document.getElementById("testamentFilter").value;
    const giver = document.getElementById("giverFilter").value;
    const receiver = document.getElementById("receiverFilter").value;
    const category = document.getElementById("categoryFilter").value;

    if (book) filters.push("Book: " + book);
    if (testament) filters.push("Testament: " + testament);
    if (giver) filters.push("Giver: " + giver);
    if (receiver) filters.push("Receiver: " + receiver);
    if (category) filters.push("Category: " + category);

    return filters;
}

/* ---------------- RESULTS ---------------- */

function renderResults() {
    const results = document.getElementById("results");
    results.innerHTML = "";

    const pageData = getPageData();

    pageData.forEach(command => {
        const div = document.createElement("div");
        div.className = "command-card";

        let html = "";

        if (displayConfig.reference) {
            html += `<h3>${command.reference}</h3>`;
        }

        if (displayConfig.verse_text) {
            html += `<p><strong>Verse:</strong> ${command.verse_text}</p>`;
        }

        if (displayConfig.instruction) {
            html += `<p><strong>Instruction:</strong> ${command.instruction}</p>`;
        }

        if (displayConfig.command_giver) {
            html += `<p><strong>Giver:</strong> ${command.command_giver}</p>`;
        }

        if (displayConfig.command_receiver) {
            html += `<p><strong>Receiver:</strong> ${command.command_receiver}</p>`;
        }

        if (displayConfig.category) {
            html += `<p><strong>Category:</strong> ${command.category.join(", ")}</p>`;
        }

        if (displayConfig.command_type) {
            html += `<p><strong>Type:</strong> ${command.command_type}</p>`;
        }

        if (displayConfig.covenant && command.covenant) {
            html += `<p><strong>Covenant:</strong> ${command.covenant}</p>`;
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

        if (i === currentPage) {
            btn.classList.add("active");
        }

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
    const book = document.getElementById("bookFilter").value;
    const testament = document.getElementById("testamentFilter").value;
    const giver = document.getElementById("giverFilter").value;
    const receiver = document.getElementById("receiverFilter").value;
    const category = document.getElementById("categoryFilter").value;
    const covenant = document.getElementById("covenantFilter").value;
    const applicable = document.getElementById("applicableFilter").value;
    const instructionType = document.getElementById("instructionFilter").value;
    const commandType = document.getElementById("commandTypeFilter").value;

    if (book && command.book !== book) return false;
    if (testament && command.testament !== testament) return false;
    if (giver && command.command_giver !== giver) return false;
    if (receiver && command.command_receiver !== receiver) return false;
    if (covenant && command.covenant !== covenant) return false;

    if (category && !command.category.includes(category)) return false;

    // Applicable Today
    if (applicable !== "") {
        if (String(command.applicable_today) !== applicable) return false;
    }

    // Instruction Type
    if (instructionType === "do" && !command.things_to_do) return false;
    if (instructionType === "dont" && !command.things_not_to_do) return false;

    // Command Style
    if (commandType && command.command_type !== commandType) return false;

    return true;
}

function buildDropdowns() {
    // Book filter
    const books = [...new Set(bibleCommands.map(c => c.book))].sort();
    const bookSelect = document.getElementById("bookFilter");
    books.forEach(book => {
        const opt = document.createElement("option");
        opt.value = book;
        opt.textContent = book;
        bookSelect.appendChild(opt);
    });

    // Command Giver
    const givers = [...new Set(bibleCommands.map(c => c.command_giver))].sort();
    const giverSelect = document.getElementById("giverFilter");
    givers.forEach(giver => {
        const opt = document.createElement("option");
        opt.value = giver;
        opt.textContent = giver;
        giverSelect.appendChild(opt);
    });

    // Command Receiver
    const receivers = [...new Set(bibleCommands.map(c => c.command_receiver))].sort();
    const receiverSelect = document.getElementById("receiverFilter");
    receivers.forEach(receiver => {
        const opt = document.createElement("option");
        opt.value = receiver;
        opt.textContent = receiver;
        receiverSelect.appendChild(opt);
    });

    // Category
    const categories = [...new Set(bibleCommands.flatMap(c => c.category))].sort();
    const catSelect = document.getElementById("categoryFilter");
    categories.forEach(cat => {
        const opt = document.createElement("option");
        opt.value = cat;
        opt.textContent = cat;
        catSelect.appendChild(opt);
    });
}

/* ---------------- INIT ---------------- */

loadData();