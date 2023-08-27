import type { HookHelperObject } from '../shared/create';
import { execute } from '../util/command.util';
import type { SpawnOptions } from 'child_process';

export class HookHelper {
    public constructor(
        // Make the hook object available to have context
        protected readonly hookHelperObject: HookHelperObject,
    ) {}

    /**
     * Runs a command in the new created project
     */
    public async runCommand(command: string, args: string[] = [], options?: SpawnOptions) {
        return await execute(command, args, {
            cwd: this.hookHelperObject.resolvedCreatePath,
            ...options,
        });
    }
}
