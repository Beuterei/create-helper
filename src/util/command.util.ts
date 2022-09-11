import { SpawnOptions, spawn } from 'child_process';

export interface ExecuteResolve {
    code: number;
    stdout: string;
    stderr: string;
}

// Extend error to have additional context
export class ExecuteError extends Error {
    constructor(readonly code: number | null, readonly stdout: string, readonly stderr: string) {
        super();
    }
}

/** Execute a command and collects the results */
export const execute = (
    command: string,
    args: string[] = [],
    options?: SpawnOptions,
): Promise<ExecuteResolve> =>
    new Promise((resolve, rejects) => {
        // Filter custom options and use deconstruct to apply defaults
        const { stdio = 'inherit', ...filteredOptions } = options || {};
        let stdout = '';
        let stderr = '';

        // Promisify exec
        const execution = spawn(command, args, { ...filteredOptions, stdio });

        // Collect all std outputs
        execution.stdout?.on('data', data => {
            stdout += data;
        });
        execution.stderr?.on('data', data => {
            stderr += data;
        });

        // wait for finish and resolve/reject based on exit code
        execution.on('exit', code =>
            code === 0
                ? resolve({ code, stdout, stderr })
                : rejects(new ExecuteError(code, stdout, stderr)),
        );
    });
