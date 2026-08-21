import { program } from "commander";

program.name("task-cli").description("CLI for managing tasks").version("1.0.0");

// Adding a task command
const addTaskCommand = program
    .command("add-task")
    .description("Add a new task")
    .requiredOption("-t, --title <title>", "Title of the task")
    .option("-d, --description <description>", "Description of the task")
    .requiredOption(
        "-s, --status <status>",
        "Status of the task (todo, in-progress, done)",
        "todo",
    );

// Editing a task command
const editTaskCommand = program
    .command("edit-task")
    .description("Edit an existing task")
    .requiredOption("-i, --id <id>", "ID of the task to edit")
    .option("-t, --title <title>", "New title of the task")
    .option("-d, --description <description>", "New description of the task")
    .requiredOption(
        "-s, --status <status>",
        "New status of the task (todo, in-progress, done)",
        "todo",
    );

export { addTaskCommand, editTaskCommand };
