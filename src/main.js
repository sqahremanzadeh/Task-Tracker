import { program } from "commander";

import taskDB from "./db/taskDB.js";
import {
    addTaskCommand,
    editTaskCommand,
    deleteTaskCommand,
    listTasksCommand,
} from "./utils/commander/taskCommander.js";
import { errorOut, warning, success, tableOutput } from "./utils/chalkUtils.js";
import { renderTaskTable } from "./utils/tableOptions/taskTableOptions.js";

// Initializing the task DB
await taskDB.createTaskDB();

// Adding a new task command action
addTaskCommand.action(async (options) => {
    const { title, description, status } = options;
    const result = await taskDB.addOrEditTask(title, description, status);
    if (result) {
        console.log(success(`Task "${title}" added successfully.`));
    } else {
        console.log(errorOut(`Failed to add task "${title}".`));
    }
});

// Editing an existing task command action
editTaskCommand.action(async (options) => {
    const { id, title, description, status } = options;
    const result = await taskDB.addOrEditTask(title, description, status, parseInt(id, 10));
    if (result) {
        console.log(success(`Task with ID ${id} updated successfully.`));
    } else {
        console.log(errorOut(`Failed to update task with ID ${id}.`));
    }
});

// Deleting an existing task command action
deleteTaskCommand.action(async (options) => {
    const { id } = options;
    const result = await taskDB.deleteTask(parseInt(id, 10));
    if (result) {
        console.log(success(`Task with ID ${id} deleted successfully.`));
    } else {
        console.log(errorOut(`Failed to delete task with ID ${id}.`));
    }
});

// Listing existing tasks command action
listTasksCommand.action(async () => {
    const tasks = await taskDB.listTasks();
    if (tasks.length === 0) {
        console.log(warning("No tasks found in the task DB."));
    } else {
        const table = renderTaskTable(tasks);
        console.log(tableOutput(table));
    }
});
program.parse(process.argv);
