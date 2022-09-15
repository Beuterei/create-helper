import type { BuildInQuestions } from '../config/buiInQuestions';
import type { AfterHookHelper } from '../helper/AfterHookHelper';
import type { UIHelper } from '../helper/PromptHelper';
import type { TemplateHelper } from '../helper/TemplateHelper';

export interface CreateOptions {
    /**
     * Hook run after all files are copied
     */
    afterCreationHook?: (afterCreationHookObject: AfterCreationHookObject) => Promise<void>;
    /**
     * Default template to be used if not specified by arguments
     */
    defaultTemplate: string;
    /**
     * A directory or an array of directories from where to resolve layout templates. If it's an array, the files are looked up in the order they occur in the array. Defaults to the selected templates directory
     */
    layouts?: string[] | string;
    /**
     * A directory or an array of directories from where to resolve included templates. If it's an array, the files are looked up in the order they occur in the array. Defaults to the selected templates directory
     */
    partials?: string[] | string;
    /**
     * Exposed the internal used interactive UI engine helper for modifications and buildInQuestions to be used
     */
    setupInteractiveUI?: (engine: UIHelper, buildInQuestions: BuildInQuestions) => void;
    /**
     * Exposed the internal used template engine helper for modifications
     */
    setupTemplateEngine?: (engine: TemplateHelper) => void;
    /**
     * Directory to lookup template folders
     */
    templatesDirectory: string;

    /**
     * Prefix for the template folders
     */
    templatesPrefix?: string;
}

export interface AfterCreationHookOptions {
    /**
     * Package manager to use. Defaults to npm
     */
    packageManager: 'npm' | 'yarn';
}

export interface AfterCreationHookObject {
    /**
     * All given answers
     */
    answers: { [index: string]: unknown };
    /**
     * Used create options
     */
    createOptions: Omit<
        CreateOptions,
        'afterCreationHook' | 'setupInteractiveUI' | 'setupTemplateEngine'
    >;
    /**
     * Helper to do some predefined actions
     */
    getAfterHookHelper: (afterCreationHookOptions?: AfterCreationHookOptions) => AfterHookHelper;
    /**
     * Used create path
     */
    resolvedCreatePath: string;
    /**
     * Used template directory
     */
    resolvedTemplateDirectory: string;
}
