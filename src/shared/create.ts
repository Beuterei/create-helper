import type { BuildInQuestions } from '../config/buildInQuestions';
import type { AfterHookHelper } from '../helper/AfterHookHelper';
import type { HookHelper } from '../helper/HookHelper';
import type { UIHelper } from '../helper/PromptHelper';
import type { TemplateHelper } from '../helper/TemplateHelper';

interface Answers {
    [index: string]: unknown;
}

type AnswerArguments = Answers;

export interface CreateOptions {
    /**
     * Hook run after all files are copied
     */
    afterCreationHook?: (afterCreationHookObject: AfterCreationHookObject) => Promise<void>;
    /**
     * Function to parse/modify argument from the command line. Good for mapping falsy value to JS false.
     */
    argumentAnswerParsing?: (toParseAnswerArguments: AnswerArguments) => AnswerArguments;
    /**
     * Hook run before all files are copied
     */
    beforeCreationHook?: (beforeCreationHookObject: BeforeCreationHookObject) => Promise<Answers>;
    /**
     * Default template to be used if not specified by arguments
     */
    defaultTemplate: string;
    /**
     * A directory or an array of directories from where to resolve layout templates. If it's an array, the files are looked up in the order they occur in the array. Defaults to the selected templates directory
     */
    layouts?: string[] | string;
    /**
     * Dangerous option: Gets the user selected create path to modify. Returned string will be used as new create path. Can be useful for temp directories or already full paths in certain situations
     */
    modifyCreatePath?: (originalCreatePath: string) => string;
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
     * Regex patterns to ignore while templating files with liquidjs. Default: `[/\.(gif|jpe?g|tiff?|png|webp|bmp)$/u]`
     */
    templateIgnorePattern?: RegExp[];
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

export interface HookHelperObject {
    /**
     * All given answers
     */
    answers: Answers;
    /**
     * Used create options
     */
    createOptions: Omit<
        CreateOptions,
        'afterCreationHook' | 'setupInteractiveUI' | 'setupTemplateEngine'
    >;
    /**
     * Used create path
     */
    resolvedCreatePath: string;
    /**
     * Original create path before modification
     */
    resolvedOriginalCreatePath: string;
    /**
     * Used template directory
     */
    resolvedTemplateDirectory: string;
}

export interface AfterCreationHookObject extends HookHelperObject {
    /**
     * Helper to do some predefined actions
     */
    getAfterHookHelper: (afterCreationHookOptions?: AfterCreationHookOptions) => AfterHookHelper;
}

export interface BeforeCreationHookObject extends HookHelperObject {
    /**
     * Helper to do some predefined actions
     */
    getBeforeHookHelper: () => HookHelper;
}
