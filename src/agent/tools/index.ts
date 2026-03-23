import { dateTimeTool } from './dateTime.js';
import { deleteFileTool, listFilesTool, readFileTool, writeFileTool } from './file.js';
import { runShellCommandTool } from './shell.js';
import { webSearchTool } from './webSearch.js';

// All tools combined for the agent
export const tools = {
    dateTimeTool,
    deleteFileTool,
    listFilesTool,
    readFileTool,
    runShellCommandTool,
    webSearchTool,
    writeFileTool,
};
