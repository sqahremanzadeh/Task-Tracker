import { program } from "commander";

import taskDB from "./db/taskDB.js";
import { addTaskCommand } from "./utils/commander/taskCommander.js";

// Initializing the task DB
await taskDB.createTaskDB();


// Adding a new task command action 
addTaskCommand.action(async (options) => {
  const { title, description, status } = options;
  const result = await taskDB.addTask(title, description, status);
  if (result) {
    console.log(success(`Task "${title}" added successfully.`));
  } else {
    console.log(error(`Failed to add task "${title}".`));
  }
});

program.parse(process.argv);
