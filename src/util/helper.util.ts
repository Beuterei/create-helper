import { red } from 'colorette';
import { readdir, stat } from 'fs/promises';
import { join } from 'path';

// Helper function to print nice errors
export const logAndFail = (error: string, trivia?: string): never => {
    // Log error text in red
    console.error(red(error));
    if (trivia) {
        // Log trivia (Explaining text for example) if given
        console.log(`└─ ${trivia}`);
    }

    // Exit process with error code
    process.exit(1);
};

// Helper function to get all files in directory relative
export const getAllFiles = async (
    directoryPath: string,
    parentDirectory: string = '',
    arrayOfFiles: string[] = [],
) => {
    // Read all files
    const files = await readdir(directoryPath);

    // Iterate over them
    for (const file of files) {
        // Check if we need to call self, for recursive behavior, based on if we currently looking at a directory
        if ((await stat(join(directoryPath, file))).isDirectory()) {
            // Call self to retrieve all files
            arrayOfFiles = await getAllFiles(join(directoryPath, file), file, arrayOfFiles);
        } else {
            // Push result if we are looking at a file
            arrayOfFiles.push(join(parentDirectory, file));
        }
    }

    return arrayOfFiles;
};
