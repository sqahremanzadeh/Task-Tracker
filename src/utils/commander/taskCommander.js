import { program } from "commander";

program.name("task-cli").description("CLI for managing tasks").version("1.0.0");

// Adding a task command
const addTaskCommand = program
  .command("add-task")
  .description("Add a new task")
  .requiredOption("-t, --title <title>", "Title of the task")
  .option("-d, --description <description>", "Description of the task")
  .option(
    "-s, --status <status>",
    "Status of the task (todo, in-progress, done)",
    "todo",
  );

export { addTaskCommand };
