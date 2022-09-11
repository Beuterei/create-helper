import parseArgs from 'minimist';
import { resolve, dirname } from 'path';
import { existsSync } from 'fs';
import { chmod, mkdir, readdir, stat, writeFile } from 'fs/promises';
import { gray, green, underline } from 'colorette';

import { UIHelper } from './helper/PromptHelper';
import { defaultQuestions } from './config/defaultQuestions';
import { TemplateHelper } from './helper/TemplateHelper';
import { getAllFiles, logAndFail } from './util/helper.util';
import { CreateOptions } from './shared/create';
import { AfterHookHelper } from './helper/AfterHookHelper';

export const create = async (options: CreateOptions) => {
    try {
        // Prepare interactive ui engine
        const uiHelper = new UIHelper();

        // Register build in questions
        uiHelper.registerQuestions(defaultQuestions);

        // Expose internal instance for modifications
        if (options.setupInteractiveUI) {
            options.setupInteractiveUI(uiHelper);
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
            throw logAndFail(
                'No create path was given.',
                `Script usage: ${gray('./cli')} ${green('<create_path>')}`,
            );
        }

        // Resolve create path
        const resolvedCreatePath = resolve(process.cwd(), createPath);

        // Check if create path is empty to prevent accidental overrides
        if (existsSync(resolvedCreatePath) && (await readdir(resolvedCreatePath)).length !== 0) {
            throw logAndFail('Create path is not empty.');
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
        const answers = await uiHelper.prompt(options.questionsSelectors, initialAnswers);

        // Prepare template engine
        const templateHelper = new TemplateHelper({
            globals: answers, // Collected answers are globally available
            root: resolvedTemplateDirectory, // Root is our selected template directory
            partials: options.partials, // Will fallback to root if not set
            layouts: options.layouts, // Will fallback to root if not set
        });

        // expose internal instance for modifications
        if (options.setupTemplateEngine) {
            //options.setupTemplateEngine(templateHelper);
        }

        // Context aware helper function to create a file creation promise
        const createRenderedFile = async (filePath: string) => {
            try {
                // Render file path to support templating in the paths.
                const renderedFilePath = await templateHelper.parseAndRender(filePath);

                // Resolve source file path with provided resolved template directory
                const resolvedSourceFilePath = resolve(resolvedTemplateDirectory, filePath);

                // Resolve target file path with provided create path
                const resolvedTargetFilePath = resolve(resolvedCreatePath, renderedFilePath);

                // Create all parent directories
                await mkdir(dirname(resolvedTargetFilePath), { recursive: true });

                // Get source file stats to catch stuff like execution permissions for scripts
                const sourceFileStats = await stat(resolvedSourceFilePath);

                // Parse them to unix
                var targetFileUnixPermissions =
                    '0' + (sourceFileStats.mode & parseInt('777', 8)).toString(8);

                // Render file content. Give only filePath since the engine is already template root aware
                const renderedFileContent = await templateHelper.renderFile(filePath);

                // Write file with rendered content
                await writeFile(resolvedTargetFilePath, renderedFileContent, 'utf-8');

                // Apply unix permissions to newly created files
                await chmod(resolvedTargetFilePath, targetFileUnixPermissions);
            } catch (error: unknown) {
                if (error instanceof Error) {
                    // Catch here to have a filePath context in the error message
                    throw logAndFail(
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
            filePath => createRenderedFile(filePath),
        );

        // Start all promises
        await Promise.all(createRenderedFilesPromises);

        // Check if the after creation hook was defined
        if (options.afterCreationHook) {
            // Filter some options we don't want to expose
            const {
                setupInteractiveUI,
                setupTemplateEngine,
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
                getAfterHookHelper: options =>
                    new AfterHookHelper(afterHookCreationObject, options),
                ...afterHookCreationObject,
            });
        }
    } catch (error: unknown) {
        // Catch everything else and log it nice
        if (error instanceof Error) {
            throw logAndFail('Unexpected error occurred', error.message);
        }

        throw logAndFail('Unexpected error occurred');
    }
};
