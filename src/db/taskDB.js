import fs from "fs";
import { fileURLToPath } from "url";
import path from "path";
import dotenv from "dotenv";

import { errorOut, warning, success } from "../utils/chalkUtils.js";
import { taskValidator } from "./schema/taskSchema.js";

// Getting the task DB file path
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuring the dotenv path
dotenv.config({ path: path.join(__dirname, "..", "..", ".env") });

const __taskDBName = String(process.env.DB_NAME);
const __taskDBPath = path.join(__dirname, __taskDBName);

const timestampWithTimezone = () => {
    const date = new Date();
    const offset = -date.getTimezoneOffset();
    const sign = offset >= 0 ? "+" : "-";
    const absoluteOffset = Math.abs(offset);
    const hours = String(Math.floor(absoluteOffset / 60)).padStart(2, "0");
    const minutes = String(absoluteOffset % 60).padStart(2, "0");
    return `${date.toISOString().slice(0, 19)}${sign}${hours}:${minutes}`;
};

const formatTimestamp = (timestamp) => {
    if (!timestamp) return null;

    const match = String(timestamp).match(/([+-])(\d{2}):(\d{2})$/);
    const offsetMinutes = match
        ? (Number(match[2]) * 60 + Number(match[3])) * (match[1] === "+" ? 1 : -1)
        : 0;
    const date = new Date(timestamp);
    if (Number.isNaN(date.getTime())) return timestamp;

    const localDate = new Date(date.getTime() + offsetMinutes * 60000);
    const day = localDate.getUTCDate();
    const suffix =
        day % 10 === 1 && day !== 11
            ? "st"
            : day % 10 === 2 && day !== 12
              ? "nd"
              : day % 10 === 3 && day !== 13
                ? "rd"
                : "th";
    const month = new Intl.DateTimeFormat("en-US", { month: "long", timeZone: "UTC" }).format(
        localDate,
    );
    const time = `${String(localDate.getUTCHours()).padStart(2, "0")}:${String(localDate.getUTCMinutes()).padStart(2, "0")}`;
    const timezone = match ? `GMT${match[1]}${match[2]}:${match[3]}` : "GMT";
    return `${month} ${day}${suffix}, ${localDate.getUTCFullYear()} - ${time} - Timezone(${timezone})`;
};

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
                await fs.writeFileSync(__taskDBPath, `${JSON.stringify([], null, 2)}\n`);
                console.log(success("Task DB has been reset successfully."));
                return true;
            } catch (error) {
                console.log(
                    errorOut("There has been an error resetting or creating the task DB file : "),
                    errorOut(error.message),
                );
                return false;
            }
        } else {
            try {
                if (!taskValidator(data)) {
                    console.log(
                        warning("The data to be written to task DB doesn't match the schema : "),
                        errorOut(taskValidator.errors),
                    );
                    return false;
                }
                await fs.writeFileSync(__taskDBPath, `${JSON.stringify(data, null, 2)}\n`);
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
            const maxId = data.reduce((max, task) => (task.id > max ? task.id : max), 0);
            this.taskId = maxId;
            console.log(
                success(
                    "The task DB already exist and the maximum id was calculated and assigned to the static property of class.",
                ),
            );
            return true;
        }
    }
    static async addOrEditTask(title, description, status, taskId = null) {
        if (taskId == null) {
            const task = {
                id: ++this.taskId,
                title: title,
                description: description,
                status: status,
                createdAt: timestampWithTimezone(),
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
        } else {
            const data = await this.readTaskDB();
            const taskIndex = data.findIndex((task) => task.id === taskId);
            if (taskIndex === -1) {
                console.log(errorOut(`The task with ${taskId} doesn't exist in the task DB.`));
                return false;
            }
            const updatedTask = {
                ...data[taskIndex],
                title: title || data[taskIndex].title,
                description: description || data[taskIndex].description,
                status: status || data[taskIndex].status,
                updatedAt: timestampWithTimezone(),
            };
            if (!taskValidator([updatedTask])) {
                console.log(
                    errorOut("The updated task doesn't match the schema : "),
                    errorOut(taskValidator.errors),
                );
                return false;
            }
            data[taskIndex] = updatedTask;
            await this.writeOrResetTaskDB(data);
            return true;
        }
    }

    static async deleteTask(taskId) {
        const data = await this.readTaskDB();
        const taskIndex = data.findIndex((task) => task.id === taskId);
        if (taskIndex === -1) {
            console.log(errorOut(`The task with ID ${taskId} doesn't exist in the task DB.`));
            return false;
        }
        data.splice(taskIndex, 1);
        await this.writeOrResetTaskDB(data);
        return true;
    }
    static async listTasks() {
        const data = await this.readTaskDB();
        if (data.length === 0) {
            console.log(warning("No tasks found in the task DB."));
            return [];
        }
        return data.map((task) => ({
            ...task,
            createdAt: formatTimestamp(task.createdAt),
            updatedAt: formatTimestamp(task.updatedAt),
        }));
    }
}
