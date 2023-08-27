import type { AfterCreationHookOptions, HookHelperObject } from '../shared/create';
import { HookHelper } from './HookHelper';
import { blueBright } from 'colorette';

export class AfterHookHelper extends HookHelper {
    public constructor(
        // Make the hook object available to have context
        hookHelperObject: HookHelperObject,
        options?: AfterCreationHookOptions,
    ) {
        super(hookHelperObject);
        // Deconstruct options to apply defaults
        const { packageManager = 'npm' } = options ?? {};

        // Make the options available and override with deconstruct to have potential defaults
        this.options = {
            ...options,
            packageManager,
        };
    }

    /**
     * Initialize git repository
     */
    public async initGit() {
        await this.runCommand('git', ['init']);
        console.log(blueBright('Repository Initialized'));
    }

    /**
     * Install dependencies
     */
    public async installDependencies() {
        await this.runCommand(`${this.options.packageManager}`, ['install']);
        console.log(blueBright('Dependencies installed'));
    }

    private readonly options: AfterCreationHookOptions;
}
