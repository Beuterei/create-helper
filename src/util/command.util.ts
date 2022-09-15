import type { SpawnOptions } from 'child_process';
import { spawn } from 'child_process';

export interface ExecuteResolve {
    code: number;
    stderr: string;
    stdout: string;
}

// Extend error to have additional context
export class ExecuteError extends Error {
    public constructor(
        public readonly code: number | null,
        public readonly stdout: string,
        public readonly stderr: string,
    ) {
        super();
    }
}

/**
 * Execute a command and collects the results
 */
export const execute = async (
    command: string,
    args: string[] = [],
    options?: SpawnOptions,
): Promise<ExecuteResolve> =>
    await new Promise((resolve, reject) => {
        // Filter custom options and use deconstruct to apply defaults
        const { stdio = 'inherit', ...filteredOptions } = options ?? {};
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
                : reject(new ExecuteError(code, stdout, stderr)),
        );
    });
