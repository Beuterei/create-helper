import { existsSync } from 'fs';
import { chmod, mkdir, readdir, stat, writeFile } from 'fs/promises';
import { resolve, dirname } from 'path';
import { gray, green, underline } from 'colorette';
import parseArgs from 'minimist';
import { buiInQuestions } from './config/buiInQuestions';
import { AfterHookHelper } from './helper/AfterHookHelper';
import { UIHelper } from './helper/PromptHelper';
import { TemplateHelper } from './helper/TemplateHelper';
import type { CreateOptions } from './shared/create';
import { getAllFiles, logAndFail } from './util/helper.util';

export const create = async (options: CreateOptions) => {
    try {
        // Prepare interactive ui engine
        const uiHelper = new UIHelper();

        // eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-var-requires
        uiHelper.registerPrompt('search-list', require('inquirer-search-list'));

        // Expose internal instance for modifications
        if (options.setupInteractiveUI) {
            options.setupInteractiveUI(uiHelper, buiInQuestions);
        }

        // Parse args for mixed use, template selection and creation path
        // Also filter the resulting object from yargs to prevent pollution later in the initial answers
        const {
            _: [createPath],
            template,
            ...initialAnswers
        } = parseArgs(process.argv.slice(2));

        // Check if first param was given -> first param is the creation path. Since we do not require any questions to be set this needs to be required.
        if (!createPath) {
            logAndFail(
                'No create path was given.',
                `Script usage: ${gray('./cli')} ${green('<create_path>')}`,
            );
        }

        // Resolve create path
        const resolvedCreatePath = resolve(process.cwd(), createPath);

        // Check if create path is empty to prevent accidental overrides
        if (existsSync(resolvedCreatePath) && (await readdir(resolvedCreatePath)).length !== 0) {
            logAndFail('Create path is not empty.');
        }

        // Decide if we have a prefix or not
        const templatePrefix = options.templatesPrefix ? options.templatesPrefix : '';

        // Resolve final template path
        const resolvedTemplateDirectory = template
            ? resolve(options.templatesDirectory, `${templatePrefix}${template}`)
            : resolve(options.templatesDirectory, `${templatePrefix}${options.defaultTemplate}`);

        // Check if template exists
        if (!existsSync(resolvedTemplateDirectory)) {
            logAndFail(
                `Template path: ${underline(resolvedTemplateDirectory)} does not exist.`,
                `Try to select another template`,
            );
        }

        // Prompt all selected questions. Pass down initialAnswers from yargs for mix use
        const answers = await uiHelper.prompt({
            ...initialAnswers,
            template: template ? template : options.defaultTemplate,
        });

        // Prepare template engine
        const templateHelper = new TemplateHelper({
            globals: answers, // Collected answers are globally available
            root: resolvedTemplateDirectory, // Root is our selected template directory
            partials: options.partials, // Will fallback to root if not set
            layouts: options.layouts, // Will fallback to root if not set
        });

        // expose internal instance for modifications
        if (options.setupTemplateEngine) {
            // options.setupTemplateEngine(templateHelper);
        }

        // Context aware helper function to create a file creation promise
        const createRenderedFile = async (filePath: string) => {
            try {
                // Render file path to support templating in the paths.
                const renderedFilePath = (
                    (await templateHelper.parseAndRender(filePath)) as string
                ).replace(/\.liquid$/u, '');

                // Resolve source file path with provided resolved template directory
                const resolvedSourceFilePath = resolve(resolvedTemplateDirectory, filePath);

                // Resolve target file path with provided create path
                const resolvedTargetFilePath = resolve(resolvedCreatePath, renderedFilePath);

                // Create all parent directories
                await mkdir(dirname(resolvedTargetFilePath), { recursive: true });

                // Get source file stats to catch stuff like execution permissions for scripts
                const sourceFileStats = await stat(resolvedSourceFilePath);

                // Parse them to unix
                const targetFileUnixPermissions = '0' + (sourceFileStats.mode && 0o777).toString(8);

                // Render file content. Give only filePath since the engine is already template root aware
                const renderedFileContent = await templateHelper.renderFile(filePath);

                // Write file with rendered content
                await writeFile(resolvedTargetFilePath, renderedFileContent, 'utf8');

                // Apply unix permissions to newly created files
                await chmod(resolvedTargetFilePath, targetFileUnixPermissions);
            } catch (error: unknown) {
                if (error instanceof Error) {
                    // Catch here to have a filePath context in the error message
                    logAndFail(
                        `Unexpected error occurred during the processing of ${underline(filePath)}`,
                        error.message,
                    );
                }

                // If the error is not an Error instance we rethrow to be catched by the default handler
                throw error;
            }
        };

        console.log(`Creating a new project in: ${underline(green(resolvedCreatePath))}`);

        // Iterate the template directory and build a promise array to process the files
        const createRenderedFilesPromises = (await getAllFiles(resolvedTemplateDirectory)).map(
            async filePath => await createRenderedFile(filePath),
        );

        // Start all promises
        await Promise.all(createRenderedFilesPromises);

        // Check if the after creation hook was defined
        if (options.afterCreationHook) {
            // Filter some options we don't want to expose
            const {
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                setupInteractiveUI,
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                setupTemplateEngine,
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                afterCreationHook,
                ...filteredOptions
            } = options;

            // Build after hook object to be used by the helper and hook itself
            const afterHookCreationObject = {
                resolvedCreatePath,
                resolvedTemplateDirectory,
                createOptions: filteredOptions,
                answers,
            };

            await options.afterCreationHook({
                // Function to return the helper class instance with possibility to define options
                getAfterHookHelper: afterCreationHookOptions =>
                    new AfterHookHelper(afterHookCreationObject, afterCreationHookOptions),
                ...afterHookCreationObject,
            });
        }
    } catch (error: unknown) {
        // Catch everything else and log it nice
        if (error instanceof Error) {
            logAndFail('Unexpected error occurred', error.message);
        }

        logAndFail('Unexpected error occurred');
    }
};
