import { BuildInQuestions } from '../config/buiInQuestions';
import { AfterHookHelper } from '../helper/AfterHookHelper';
import { UIHelper } from '../helper/PromptHelper';
import { TemplateHelper } from '../helper/TemplateHelper';

export interface CreateOptions {
    /** Exposed the internal used interactive UI engine helper for modifications and buildInQuestions to be used */
    setupInteractiveUI?: (engine: UIHelper, buildInQuestions: BuildInQuestions) => void;
    /** Exposed the internal used template engine helper for modifications */
    setupTemplateEngine?: (engine: TemplateHelper) => void;
    /** A directory or an array of directories from where to resolve included templates. If it's an array, the files are looked up in the order they occur in the array. Defaults to the selected templates directory */
    partials?: string | string[];
    /** A directory or an array of directories from where to resolve layout templates. If it's an array, the files are looked up in the order they occur in the array. Defaults to the selected templates directory */
    layouts?: string | string[];
    /** Directory to lookup template folders */
    templatesDirectory: string;
    /** Prefix for the template folders */
    templatesPrefix?: string;
    /** Default template to be used if not specified by arguments */
    defaultTemplate: string;

    /** Hook run after all files are copied */
    afterCreationHook?: (afterCreationHookObject: AfterCreationHookObject) => Promise<void>;
}

export interface AfterCreationHookOptions {
    /** Package manager to use. Defaults to npm */
    packageManager: 'npm' | 'yarn';
}

export interface AfterCreationHookObject {
    /** Helper to do some predefined actions */
    getAfterHookHelper: (afterCreationHookOptions?: AfterCreationHookOptions) => AfterHookHelper;
    /** Used create path */
    resolvedCreatePath: string;
    /** Used template directory */
    resolvedTemplateDirectory: string;
    /** Used create options */
    createOptions: Omit<
        CreateOptions,
        'setupInteractiveUI' | 'setupTemplateEngine' | 'afterCreationHook'
    >;
    /** All given answers */
    answers: { [index: string]: unknown };
}
