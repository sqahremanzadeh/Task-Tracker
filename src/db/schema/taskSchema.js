import Ajv from "ajv";
import addFormats from "ajv-formats";

const ajvInstance = new Ajv({ allErrors: true, useDefaults: true });
addFormats(ajvInstance);   // <-- this adds "date-time" and other common formats

// Your schema remains the same (with the fixes from earlier)
const taskSchema = {
  type: "array",
  items: {
    type: "object",
    properties: {
      id: { type: "integer" },
      title: { type: "string" },
      description: { type: ["string", "null"] },
      status: { type: "string", enum: ["todo", "in-progress", "done"] },
      createdAt: { type: "string", format: "date-time" },
      updatedAt: { type: ["string", "null"], format: "date-time" },
    },
    required: ["id", "title", "status", "createdAt", "updatedAt"],
    additionalProperties: false,
  },
};

const taskValidator = ajvInstance.compile(taskSchema);
export { taskValidator };