const TOTAL_KJV_VERSES = 31102;

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

async function loadData() {
    try {
        // Load master index
        const masterResponse = await fetch("data-index-master.json");
        const indexFiles = await masterResponse.json();

        for (const indexFile of indexFiles) {

            // Load book index
            const indexResponse = await fetch(indexFile);
            const jsonFiles = await indexResponse.json();

            // Determine folder path
            const folderPath = indexFile.substring(
                0,
                indexFile.lastIndexOf("/") + 1
            );

            // Load command files
            for (const jsonFile of jsonFiles) {

                const fullPath = folderPath + jsonFile;

                const response = await fetch(fullPath);

                if (!response.ok) {
                    console.error("Failed to load:", fullPath);
                    continue;
                }

                const command = await response.json();
                bibleCommands.push(command);
            }
        }

        console.log(`Loaded ${bibleCommands.length} commands`);
        updateProgress();

        bibleCommands = bibleCommands.filter(
            c => c.instruction &&
                String(c.instruction).trim() !== ""
        );

        buildDropdowns();
        attachEvents();

        filteredCommands = bibleCommands;
        render();

    } catch (err) {
        console.error("Load error:", err);
    }
}

function updateProgress() {
    const loaded = new Set(bibleCommands.map(c => `${c.book}|${c.chapter}|${c.verse}`)).size;

    const percent = (loaded / TOTAL_KJV_VERSES) * 100;

    document.getElementById("progressBar").style.width = percent.toFixed(4) + "%";

    document.getElementById("progressText").innerText =
        `${loaded} / ${TOTAL_KJV_VERSES} verses mapped (${percent.toFixed(4)}%)`;

    document.getElementById("verseCount").innerText =
        `${loaded.toLocaleString()} verses cataloged`;
}

function attachEvents() {

    // Compile Results Button
    document.getElementById("compileBtn").addEventListener("click", () => {
        currentPage = 1;
        applyFilters();

        // Reset to normal view
        document.getElementById("sortedTableContainer").style.display = "none";
        document.getElementById("results").style.display = "block";
        document.getElementById("pagination").style.display = "block";
    });

    // Sort Results Button
    document.getElementById("sortBtn").addEventListener("click", () => {
        renderSortedInstructions();
    });

    // Page Size Filter
    document.getElementById("pageSizeFilter").addEventListener("change", (e) => {
        pageSize = e.target.value === "all" ? "all" : parseInt(e.target.value);
        currentPage = 1;
        render();
    });

    // Filters (no auto-render)
    document.querySelectorAll("select").forEach(select => {
        select.addEventListener("change", () => { });
    });

    // Sidebar Toggle
    document.getElementById("sidebarToggle").addEventListener("click", () => {
        document.getElementById("sidebar").classList.toggle("hidden");
    });

    // Display toggles
    document.querySelectorAll('.display-toggle').forEach(checkbox => {
        checkbox.addEventListener('change', (e) => {
            const field = e.target.dataset.field;
            displayConfig[field] = e.target.checked;

            if (document.getElementById("results").style.display !== "none") {
                if (filteredCommands.length > 0) renderResults();
            }
        });
    });

    // Toggle button for references in sorted table
    document.addEventListener("click", (e) => {
        if (e.target.classList.contains("toggle-ref-btn")) {
            const index = parseInt(e.target.dataset.index);
            const refList = document.querySelector(`.ref-list[data-index="${index}"]`);

            if (refList) {
                if (refList.style.display === "none" || refList.style.display === "") {
                    refList.style.display = "block";
                    e.target.textContent = "Hide references";
                } else {
                    refList.style.display = "none";
                    e.target.textContent = `Show ${frequencyData[index].references.length} references`;
                }
            }
        }
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

    // Exclude entries with no instruction
    if (
        command.instruction === null ||
        command.instruction === undefined ||
        String(command.instruction).trim() === ""
    ) {
        return false;
    }

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

    if (applicable !== "") {
        if (String(command.applicable_today) !== applicable) return false;
    }
    if (instructionType === "do" && !command.things_to_do) return false;
    if (instructionType === "dont" && !command.things_not_to_do) return false;
    if (commandType && command.command_type !== commandType) return false;

    return true;
}

function buildDropdowns() {
    const books = [...new Set(bibleCommands.map(c => c.book))].sort();
    const bookSelect = document.getElementById("bookFilter");
    books.forEach(book => {
        const opt = document.createElement("option");
        opt.value = book; opt.textContent = book;
        bookSelect.appendChild(opt);
    });

    const givers = [...new Set(bibleCommands.map(c => c.command_giver))].sort();
    const giverSelect = document.getElementById("giverFilter");
    givers.forEach(giver => {
        const opt = document.createElement("option");
        opt.value = giver; opt.textContent = giver;
        giverSelect.appendChild(opt);
    });

    const receivers = [...new Set(bibleCommands.map(c => c.command_receiver))].sort();
    const receiverSelect = document.getElementById("receiverFilter");
    receivers.forEach(receiver => {
        const opt = document.createElement("option");
        opt.value = receiver; opt.textContent = receiver;
        receiverSelect.appendChild(opt);
    });

    const categories = [...new Set(bibleCommands.flatMap(c => c.category))].sort();
    const catSelect = document.getElementById("categoryFilter");
    categories.forEach(cat => {
        const opt = document.createElement("option");
        opt.value = cat; opt.textContent = cat;
        catSelect.appendChild(opt);
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

document.getElementById("enterAppBtn").addEventListener("click", () => {
    document.getElementById("homeView").style.display = "none";
    document.getElementById("appView").style.display = "block";
});

document.getElementById("homeBtn").addEventListener("click", () => {
    document.getElementById("appView").style.display = "none";
    document.getElementById("homeView").style.display = "block";
});

/* ---------------- INIT ---------------- */
loadData();