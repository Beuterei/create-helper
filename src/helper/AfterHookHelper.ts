import { SpawnOptions } from 'child_process';
import { blueBright } from 'colorette';
import { AfterCreationHookObject, AfterCreationHookOptions } from '../shared/create';
import { execute } from '../util/command.util';

export class AfterHookHelper {
    private options: AfterCreationHookOptions;

    constructor(
        // Make the hook object available to have context
        private afterCreationHookObject: Omit<AfterCreationHookObject, 'getAfterHookHelper'>,
        options?: AfterCreationHookOptions,
    ) {
        // Deconstruct options to apply defaults
        const { packageManager = 'npm' } = options || {};

        // Make the options available and override with deconstruct to have potential defaults
        this.options = {
            ...options,
            packageManager,
        };
    }

    /** Runs a command in the new created project */
    public runCommand(command: string, args: string[] = [], options?: SpawnOptions) {
        return execute(command, args, {
            cwd: this.afterCreationHookObject.resolvedCreatePath,
            ...options,
        });
    }

    /** Initialize git repository */
    public async initGit() {
        await this.runCommand('git', ['init']);
        console.log(blueBright('Repository Initialized'));
    }

    /** Install dependencies */
    public async installDependencies() {
        await this.runCommand(`${this.options.packageManager}`, ['install']);
        console.log(blueBright('Dependencies installed'));
    }
}
