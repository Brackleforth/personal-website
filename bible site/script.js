let bibleCommands = [];
let filteredCommands = [];

let currentPage = 1;
let pageSize = 10;

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

        div.innerHTML = `
            <h3>${command.reference}</h3>

            <p><strong>Verse:</strong> ${command.verse_text}</p>
            <p><strong>Instruction:</strong> ${command.instruction}</p>
            <p><strong>Giver:</strong> ${command.command_giver}</p>
            <p><strong>Receiver:</strong> ${command.command_receiver}</p>
            <p><strong>Category:</strong> ${command.category.join(", ")}</p>
            <p><strong>Type:</strong> ${command.command_type}</p>
        `;

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

    if (book && command.book !== book) return false;
    if (testament && command.testament !== testament) return false;
    if (giver && command.command_giver !== giver) return false;
    if (receiver && command.command_receiver !== receiver) return false;

    if (category &&
        !command.category.includes(category)) return false;

    return true;
}

/* ---------------- INIT ---------------- */

loadData();