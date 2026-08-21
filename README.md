# Task Tracker CLI

A simple command-line task tracker for creating, editing, listing, and deleting tasks. Tasks are stored locally in a JSON file, so the tool requires no external database or service.

This project was completed and submitted as part of the [roadmap.sh Task Tracker project](https://roadmap.sh/projects/task-tracker).

## Features

- Add new tasks
- Edit existing tasks
- Delete tasks by ID
- List all tasks in a formatted terminal table
- Track task status with `todo`, `in-progress`, or `done`
- Persist tasks in `src/db/taskDB.json`
- Validate task data with AJV
- Display colored CLI output with Chalk
- Wrap table content to fit the current terminal width

## Technologies

- Node.js
- JavaScript ES modules
- Commander.js for CLI commands
- Chalk for terminal colors
- Chalk Table for terminal table formatting
- AJV and AJV Formats for data validation
- dotenv for configuration

## Prerequisites

- Node.js 20 or newer
- npm
- Git

Check your installed versions:

```bash
node --version
npm --version
git --version
```

## Installation

Clone the repository and install its dependencies:

```bash
git clone https://github.com/sqahremanzadeh/Task-Tracker.git
cd Task-Tracker
npm install
```

The repository includes sample tasks in `src/db/taskDB.json`. The application uses the `DB_NAME` value from `.env` to locate the database file. The default configuration is:

```env
DB_NAME=taskDB.json
```

## Usage

You can use the npm command aliases below instead of typing `node src/main.js` each time.

Show the available commands:

```bash
npm run help
```

List all tasks:

```bash
npm run list-tasks
```

Start the CLI directly:

```bash
npm run start
```

### Add a task

The title and status are required. The description is optional.

```bash
npm run add-task -- --title "Plan weekly workout" --description "Choose exercises and schedule sessions" --status todo
```

Valid statuses are:

- `todo`
- `in-progress`
- `done`

### Edit a task

Provide the task ID and the values to update:

```bash
npm run edit-task -- --id 1 --title "Plan weekly workout" --status in-progress
```

To update the description as well:

```bash
npm run edit-task -- --id 1 --description "Schedule three sessions this week" --status done
```

### Delete a task

Provide the task ID:

```bash
npm run delete-task -- --id 1
```

### Use the generic script

The generic `task` script forwards arguments to the CLI:

```bash
npm run task -- list-tasks
npm run task -- add-task --title "Read a book" --status todo
```

## Data Storage

Tasks are saved in [`src/db/taskDB.json`](src/db/taskDB.json). Each task contains:

- `id`: Numeric task identifier
- `title`: Task title
- `description`: Optional task description
- `status`: `todo`, `in-progress`, or `done`
- `createdAt`: Creation timestamp
- `updatedAt`: Last update timestamp, or `null`

The database file is updated whenever a task is added, edited, or deleted. The next task ID is calculated from the highest existing ID.

## Available npm Scripts

| Script | Description |
| --- | --- |
| `npm run start` | Start the CLI |
| `npm run task -- <command>` | Run any CLI command |
| `npm run help` | Show CLI help |
| `npm run add-task -- <options>` | Add a task |
| `npm run edit-task -- <options>` | Edit a task |
| `npm run delete-task -- <options>` | Delete a task |
| `npm run list-tasks` | List all tasks |

## Project Structure

```text
Task-Tracker/
├── src/
│   ├── main.js                         CLI entry point
│   ├── db/
│   │   ├── taskDB.js                   Task persistence and operations
│   │   ├── taskDB.json                 Local task database
│   │   └── schema/taskSchema.js        Task data schema and validation
│   └── utils/
│       ├── chalkUtils.js               Terminal output styles
│       ├── commander/taskCommander.js  CLI command definitions
│       └── tableOptions/               Task table rendering options
├── .env                                Database filename configuration
├── package.json
└── README.md
```

## License

This project is licensed under the ISC License.
