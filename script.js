const COLUMNS = {
    prescription: 5,
    otc: 5,
    supplies: 6,
    parking: 5,
    mileage: 4,
    taxi: 5
};

const DATA = {
    original: {
        prescription: [
            ["Naproxen", "February 28, 2024", "February 29, 2024", "Dr. Best", "$20.00"]
        ],
        otc: [
            ["Advil", "March 28, 2024", "$8.00", "Shoppers Drug Mart", "Pain"]
        ],
        supplies: [
            ["Tensor", "February 28, 2024", "Yes", "Dr. Best", "$10.00", "Shoppers Drug Mart"]
        ],
        parking: [
            ["333 St Mary Ave, Winnipeg MB R3C 4A5, Canada", "March 28, 2024", "$10.00", "yes", "12245"]
        ],
        mileage: [
            ["March 28, 2024", "HSC, 820 Sherbrook St, Winnipeg MB R3A 1R9, Canada", "WCB, 333 Broadway, Winnipeg MB R3C 4W3, Canada", "20 km"]
        ],
        taxi: [
            ["March 28, 2024", "", "HSC Winnipeg Women’s Hospital, 665 William Ave, Winnipeg MB R3E 0Z2, Canada", "Bus", "$3.00"],
            ["March 27, 2024", "25 Furby St, Winnipeg MB R3C 2A2, Canada", "440 Edmonton St, Winnipeg MB R3B 2M4, Canada", "Taxi", "$15.00"]
        ]
    }
};

function blankRow(section) {
    return Array(COLUMNS[section]).fill("");
}

function escapeHtml(value) {
    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
}

function makeEditableCell(value, section, rowIndex, colIndex) {
    const td = document.createElement("td");
    td.className = "editable";

    const editor = document.createElement("div");
    editor.className = "cell-editor";
    editor.contentEditable = "true";
    editor.spellcheck = false;
    editor.dataset.placeholder = "Type here";
    editor.dataset.section = section;
    editor.dataset.row = rowIndex;
    editor.dataset.col = colIndex;
    editor.textContent = value ?? "";

    editor.addEventListener("input", saveCurrentState);
    editor.addEventListener("keydown", function (event) {
        if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
        }
    });

    td.appendChild(editor);
    return td;
}

function renderSection(section, rows) {
    const tbody = document.getElementById(section + "-body");
    tbody.innerHTML = "";

    rows.forEach(function (row, index) {
        const tr = document.createElement("tr");

        for (let column = 0; column < COLUMNS[section]; column++) {
            tr.appendChild(makeEditableCell(row[column] ?? "", section, index, column));
        }

        const action = document.createElement("td");
        action.className = "row-actions";

        const remove = document.createElement("button");
        remove.type = "button";
        remove.className = "remove-row";
        remove.title = "Remove row";
        remove.textContent = "×";
        remove.addEventListener("click", function () {
            removeRow(section, index);
        });

        action.appendChild(remove);
        tr.appendChild(action);
        tbody.appendChild(tr);
    });
}

function readSection(section) {
    return [...document.querySelectorAll(`#${section}-body tr`)].map(function (tr) {
        return [...tr.querySelectorAll(".cell-editor")].map(function (editor) {
            return editor.textContent;
        });
    });
}

function readAll() {
    const output = {};
    Object.keys(COLUMNS).forEach(function (section) {
        output[section] = readSection(section);
    });
    return output;
}

function saveCurrentState() {
    try {
        sessionStorage.setItem("wcbFormData", JSON.stringify(readAll()));
    } catch (error) {
        console.error("Unable to save form data:", error);
    }
}

function addRow(section) {
    const rows = readSection(section);
    rows.push(blankRow(section));
    renderSection(section, rows);
    saveCurrentState();

    const editors = document.querySelectorAll(`#${section}-body tr:last-child .cell-editor`);
    if (editors.length) {
        editors[0].focus();
    }
}

function removeRow(section, index) {
    const rows = readSection(section);
    if (rows.length <= 1) {
        rows[0] = blankRow(section);
    } else {
        rows.splice(index, 1);
    }
    renderSection(section, rows);
    saveCurrentState();
}

function addRowToAll() {
    Object.keys(COLUMNS).forEach(function (section) {
        const rows = readSection(section);
        rows.push(blankRow(section));
        renderSection(section, rows);
    });
    saveCurrentState();
}

function clone(object) {
    return JSON.parse(JSON.stringify(object));
}

function loadDataset(name) {
    let data;

    if (name === "original") {
        data = clone(DATA.original);
    } else if (name === "one") {
        data = {};
        Object.keys(COLUMNS).forEach(function (section) {
            data[section] = [blankRow(section)];
        });
    } else {
        data = {};
        Object.keys(COLUMNS).forEach(function (section) {
            data[section] = Array.from({ length: 10 }, function (_, row) {
                return Array.from({ length: COLUMNS[section] }, function (_, column) {
                    return `Sample ${row + 1}-${column + 1}`;
                });
            });
        });
    }

    Object.keys(COLUMNS).forEach(function (section) {
        renderSection(section, data[section]);
    });

    saveCurrentState();
    window.scrollTo({ top: 0, behavior: "smooth" });
}

function init() {
    let stored = null;

    try {
        stored = JSON.parse(sessionStorage.getItem("wcbFormData") || "null");
    } catch (error) {
        stored = null;
    }

    const data =
        stored && Object.keys(COLUMNS).every(function (section) {
            return Array.isArray(stored[section]);
        })
            ? stored
            : DATA.original;

    Object.keys(COLUMNS).forEach(function (section) {
        renderSection(section, data[section]);
    });
}

init();