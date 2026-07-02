function parseCSV(csvText) {
    const lines = csvText.trim().split("\n");
    
    // Parse first line (headers) with quote handling
    const headers = parseCSVLine(lines[0]);

    return lines.slice(1).map(line => {
        const values = parseCSVLine(line);
        let obj = {};
        headers.forEach((h, i) => {
            obj[h.trim()] = values[i]?.trim();
        });
        return obj;
    });
}

function parseCSVLine(line) {
    const values = [];
    let current = "";
    let insideQuotes = false;

    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        const nextChar = line[i + 1];

        if (char === '"') {
            // Escaped quote: "" represents a literal quote
            if (nextChar === '"') {
                current += '"';
                i++; // Skip next quote
            } else {
                // Toggle quote state
                insideQuotes = !insideQuotes;
            }
        } else if (char === "," && !insideQuotes) {
            // Only split on comma if not inside quotes
            values.push(current);
            current = "";
        } else {
            current += char;
        }
    }

    // Add last value
    values.push(current);

    // Remove surrounding quotes and trim
    return values.map(val => {
        val = val.trim();
        if (val.startsWith('"') && val.endsWith('"')) {
            val = val.slice(1, -1);
        }
        return val;
    });
}