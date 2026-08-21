import fs from "fs";
import { fileURLToPath } from "url";
import path from "path";
import dotenv from "dotenv";

import { errorOut, warning, success } from "../utils/chalkUtils.js";
import { taskValidator } from "./schema/taskSchema.js";

// Getting the task DB file path
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const __taskDBName = String(process.env.DB_NAME);
const __taskDBPath = path.join(__dirname, __taskDBName);

// Configuring the dotenv path
dotenv.config({ path: path.join(__dirname, "..", "..", ".env") });

export default class taskDB {
  static taskId = 0;
  static async readTaskDB() {
    try {
      const data = JSON.parse(await fs.readFileSync(__taskDBPath));
      if (!taskValidator(data)) {
        console.log(
          warning("The data from task DB doesn't match the schema : "),
          errorOut(taskValidator.errors),
        );
      }
      return data;
    } catch (error) {
      console.log(
        errorOut("There has been an error reading from task DB file : "),
        errorOut(error.message),
      );
      return [];
    }
  }
  static async writeOrResetTaskDB(data) {
    if (!data) {
      try {
        await fs.writeFileSync(__taskDBPath, JSON.stringify([]));
        console.log(success("Task DB has been reset successfully."));
        return true;
      } catch (error) {
        console.log(
          errorOut(
            "There has been an error resetting or creating the task DB file : ",
          ),
          errorOut(error.message),
        );
        return false;
      }
    } else {
      try {
        if (!taskValidator(data)) {
          console.log(
            warning(
              "The data to be written to task DB doesn't match the schema : ",
            ),
            errorOut(taskValidator.errors),
          );
          return false;
        }
        await fs.writeFileSync(__taskDBPath, JSON.stringify(data));
        return true;
      } catch (error) {
        console.log(
          errorOut("There has been an error writing to the task DB file : "),
          errorOut(error.message),
        );
        return false;
      }
    }
  }
  static async createTaskDB() {
    let taskDBExists = false;
    try {
      taskDBExists = fs.existsSync(__taskDBPath);
    } catch (error) {
      console.log(
        errorOut(
          "There has been an error checking whether task DB file exists or not : ",
          errorOut(error.message),
        ),
      );
    }
    if (!taskDBExists) {
      await this.writeOrResetTaskDB();
      console.log(success("The task DB created successfully."));
      return true;
    } else {
      const data = await this.readTaskDB();
      const maxId = data.reduce(
        (max, task) => (task.id > max ? task.id : max),
        0,
      );
      this.taskId = maxId;
      console.log(
        success(
          "The task DB already existed and the maximum id was calculated and assigned to the static property of class.",
        ),
      );
      return true;
    }
  }
  static async addTask(title, description, status) {
    const task = {
      id: ++this.taskId,
      title: title,
      description: description,
      status: status,
      createAt: new Date().toString(),
      updatedAt: null,
    };
    if (!taskValidator([task])) {
      console.log(
        warning("The task to be added doesn't match the schema : "),
        errorOut(taskValidator.errors),
      );
      return false;
    }
    const data = await this.readTaskDB();
    data.push(task);
    await this.writeOrResetTaskDB(data);
    return true;
  }
  static async editTask(
    taskId,
    title = null,
    description = null,
    status = null,
  ) {
    const data = await this.readTaskDB();
    const taskIndex = data.findIndex((task) => task.id === taskId);
    if (taskIndex === -1) {
      console.log(`The task with ${taskId} doesn't exist in the task DB.`);
      return false;
    }
    const updatedTask = {
      ...data[taskIndex],
      title: title || data[taskIndex].title,
      description: description || data[taskIndex].description,
      status: status || data[taskIndex].status,
      updatedAt: new Date().toString(),
    };
    if (!taskValidator([updatedTask])) {
      console.log(
        errorOut("The updated task doesn't match the schema : ")  ,
        taskValidator.errors,
      );
      return false;
    }
    data[taskIndex] = updatedTask;
    await this.writeOrResetTaskDB(data);
    return true;
  }
  static async deleteTask(taskId) {
    const data = await this.readTaskDB();
    const taskIndex = data.findIndex((task) => task.id === taskId);
    data.splice(taskIndex, 1);
    await this.writeOrResetTaskDB(data);
    return true;
  }
}
