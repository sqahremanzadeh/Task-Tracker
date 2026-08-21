import ajv from "ajv";

const ajvInstance = new ajv({ allErrors: true, useDefaults: true });

const taskSchema = {
  type: "array",
  items: {
    type: "object",
    properties: {
      id: { type: "integer" },
      title: { type: "string" },
      description: { type: "string", nullable: true },
      status: { type: "string", enum: ["todo", "in-progress", "done"] },
      createdAt: { type: "string", format: "date-time" },
      updatedAt: { type: "string", format: "date-time", nullable: true },
    },
  },
  required: ["id", "title", "status", "createdAt", "updatedAt"],
  additionalProperties: false,
};

const taskValidator = ajvInstance.compile(taskSchema);

export { taskValidator };
