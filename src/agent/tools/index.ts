import { dateTimeTool } from './dateTime.js';
import { deleteFileTool, listFilesTool, readFileTool, writeFileTool } from './file.js';

// All tools combined for the agent
export const tools = {
    dateTimeTool,
    deleteFileTool,
    listFilesTool,
    readFileTool,
    writeFileTool,
};
