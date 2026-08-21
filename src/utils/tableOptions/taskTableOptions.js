import chalk from "chalk";
import chalkTable from "chalk-table";

const tableListTasksOptions = {
    leftPad: 2,
    columns: [
        { field: "id", name: chalk.cyan("ID") },
        { field: "title", name: chalk.green("Title") },
        { field: "description", name: chalk.magenta("Description") },
        { field: "status", name: chalk.red("Status") },
        { field: "createdAt", name: chalk.yellow("Created At") },
        { field: "updatedAt", name: chalk.yellow("Updated At") },
    ],
};

const columnDefinitions = [
    { field: "id", name: chalk.cyan("ID"), color: chalk.cyan, minimum: 3, preferred: 4 },
    { field: "title", name: chalk.green("Title"), color: chalk.green, minimum: 8, preferred: 18 },
    {
        field: "description",
        name: chalk.magenta("Description"),
        color: chalk.magenta,
        minimum: 10,
        preferred: 28,
    },
    { field: "status", name: chalk.red("Status"), minimum: 11, preferred: 13 },
    {
        field: "createdAt",
        name: chalk.yellow("Created At"),
        color: chalk.yellow,
        minimum: 12,
        preferred: 20,
    },
    {
        field: "updatedAt",
        name: chalk.yellow("Updated At"),
        color: chalk.yellow,
        minimum: 12,
        preferred: 20,
    },
];

const stripAnsi = (value) => String(value).replace(/\u001B\[[0-?]*[ -/]*[@-~]/g, "");

const wrapText = (value, width) => {
    const words = String(value ?? "null").split(/\s+/);
    const lines = [];
    let line = "";

    for (const word of words) {
        if (word.length > width) {
            if (line) lines.push(line);
            for (let index = 0; index < word.length; index += width) {
                lines.push(word.slice(index, index + width));
            }
            line = "";
        } else if (!line) {
            line = word;
        } else if (`${line} ${word}`.length <= width) {
            line += ` ${word}`;
        } else {
            lines.push(line);
            line = word;
        }
    }
    if (line || lines.length === 0) lines.push(line);
    return lines;
};

const getColumnWidths = () => {
    const terminalWidth = process.stdout.columns || 100;
    const tableOverhead = columnDefinitions.length * 2 + (columnDefinitions.length - 1) + 2;
    const availableWidth = Math.max(1, terminalWidth - tableOverhead);
    const widths = columnDefinitions.map((column) => column.minimum);

    while (widths.reduce((total, width) => total + width, 0) > availableWidth) {
        const widestColumn = widths.indexOf(Math.max(...widths));
        if (widths[widestColumn] === 1) break;
        widths[widestColumn] -= 1;
    }

    let remaining = Math.max(0, availableWidth - widths.reduce((total, width) => total + width, 0));

    while (remaining > 0) {
        let expanded = false;
        for (let index = 0; index < columnDefinitions.length && remaining > 0; index += 1) {
            if (widths[index] < columnDefinitions[index].preferred) {
                widths[index] += 1;
                remaining -= 1;
                expanded = true;
            }
        }
        if (!expanded) break;
    }
    return widths;
};

const centerCell = (value, width) => {
    const text = String(value);
    const padding = Math.max(0, width - stripAnsi(text).length);
    const leftPadding = Math.floor(padding / 2);
    return `${" ".repeat(leftPadding)}${text}${" ".repeat(padding - leftPadding)}`;
};

const renderTaskTable = (tasks) => {
    const widths = getColumnWidths();
    const separator = `+${widths.map((width) => "-".repeat(width + 2)).join("+")}+`;
    const formatRow = (cells) =>
        `|${cells.map((cell, index) => ` ${centerCell(cell, widths[index])} `).join("|")}|`;
    const headerCells = columnDefinitions.map((column, index) =>
        wrapText(stripAnsi(column.name), widths[index]).map((line) => {
            const color = column.color || chalk.white;
            return color(line);
        }),
    );
    const headerHeight = Math.max(...headerCells.map((cell) => cell.length));
    const output = [separator];

    for (let lineIndex = 0; lineIndex < headerHeight; lineIndex += 1) {
        output.push(formatRow(headerCells.map((cell) => cell[lineIndex] || "")));
    }
    output.push(separator);

    for (const task of tasks) {
        const wrappedCells = columnDefinitions.map((column, index) => {
            const value = wrapText(task[column.field], widths[index]);
            const color =
                column.field === "status"
                    ? task.status === "done"
                        ? chalk.green
                        : task.status === "in-progress"
                          ? chalk.yellow
                          : chalk.blue
                    : column.color;
            return color ? value.map((line) => color(line)) : value;
        });
        const rowHeight = Math.max(...wrappedCells.map((cell) => cell.length));

        for (let lineIndex = 0; lineIndex < rowHeight; lineIndex += 1) {
            output.push(
                formatRow(
                    wrappedCells.map((cell) => {
                        const topPadding = Math.floor((rowHeight - cell.length) / 2);
                        const cellLineIndex = lineIndex - topPadding;
                        return cellLineIndex >= 0 && cellLineIndex < cell.length
                            ? cell[cellLineIndex]
                            : "";
                    }),
                ),
            );
        }
        output.push(separator);
    }

    return output.join("\n");
};

export { tableListTasksOptions, chalkTable, renderTaskTable };
