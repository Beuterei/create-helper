[![Contributors][contributors-shield]][contributors-url]
[![Forks][forks-shield]][forks-url]
[![Stargazers][stars-shield]][stars-url]
[![Issues][issues-shield]][issues-url]

<!-- PROJECT HEADER -->
<br />
<p align="center">
  <h3 align="center">create-helper</h3>

  <p align="center">
    A helper to create your own create-something app
    <br />
    <br />
    ·
    <a href="https://github.com/Beuterei/create-helper/issues">Report Bug</a>
    ·
    <a href="https://github.com/Beuterei/create-helper/issues">Request Feature</a>
    ·
  </p>
</p>

<!-- ABOUT THE PROJECT -->

## About The Project

A helper to create your own `create-something` app. Inspired by [create-initializer](https://www.npmjs.com/package/create-initializer).

## Installation

```bash
npm i @beuluis/create-helper
```

### Unstable installation

The `next` dist-tag is kept in sync with the latest commit on main. So this contains always the latest changes but is highly unstable.

```bash
npm i @beuluis/create-helper@next
```

## Usage

This pack is meant to be used with the [npm init](https://docs.npmjs.com/cli/v8/commands/npm-init) which runs the main bin of a pack when provided as parameter.

Use [@beuluis/create-something](https://www.npmjs.com/package/@beuluis/create-something) or

1. Create a new `create-something` pack.

2. Create a bin script in the desired destination. (Make sure to set [main](https://docs.npmjs.com/cli/v8/configuring-npm/package-json#main) and [bin](https://docs.npmjs.com/cli/v8/configuring-npm/package-json#bin))

3. Call the `create` helper function and configure it.

4. Publish your pack. The pack name has to be prefixed with `create-` for `npm create` to work.

5. Run

    ```bash
    npm create @scope/your-pack <create_path>
    # or
    npx @scope/create-your-pack <create_path>
    ```

## Functions

### Create helper function

Create helper function accepts [CreateOptions](#CreateOptions) as parameter.

Example:

```typescript
#!/usr/bin/node

import { resolve } from 'path';
import { create } from '@beuluis/create-helper';
import autocomplete, { AutocompleteQuestionOptions } from 'inquirer-autocomplete-prompt';

// needed if you register a new prompt type
declare module 'inquirer' {
    interface QuestionMap<T> {
        autocomplete: AutocompleteQuestionOptions<T>;
    }
}

const fetchTotallyDynamicReactVersion = () => '1.0.0';

create({
    templatesDirectory: resolve(__dirname, 'templates'),
    templatesPrefix: 'test-',
    defaultTemplate: 'test',
    partials: resolve(__dirname, 'templates', 'partials'),
    layouts: resolve(__dirname, 'templates', 'layouts'),
    argumentAnswerParsing: toParseAnswerArguments => {
        const result = toParseAnswerArguments;

        // Only map the argument isEarthling to a JS boolean if provided
        // You probably want to do this for every boolean type to use non interactive mode correctly
        if ('isEarthling' in result) {
            result.isEarthling = Boolean(result.isEarthling);
        }

        return result;
    },
    setupInteractiveUI: (engine, buildInQuestions) => {
        // exposes the internal used interactive UI engine helper and build in questions for modifications/usage
        engine.registerPrompt('autocomplete', autocomplete);

        // This is just to show this function you can also combine this with registerQuestions
        engine.registerQuestion({
            type: 'input',
            message: 'Message was overridden?',
            name: 'name',
        });

        engine.registerQuestions([
            buildInQuestions.name,
            buildInQuestions.description,
            buildInQuestions.license,
            {
                type: 'input',
                message: 'World?',
                name: 'hello',
            },
            {
                type: 'autocomplete',
                name: 'from',
                message: 'Select a state to travel from',
                source: (answersSoFar, input) => myApi.searchStates(input),
            },
            {
                type: 'confirm',
                name: 'isEarthling',
                message: 'Are you from earth?',
            },
        ]);
    },
    setupTemplateEngine: engine => {
        engine.registerFilter('upper', v => v.toUpperCase());
        engine.registerTag('upper', myTag);
    },
    beforeCreationHook: async ({ getBeforeHookHelper, answers }) => {
        console.log(`I run before ${answers.template} scaffold being created.`);

        const helper = getBeforeHookHelper();
        await helper.runCommand('echo', ['hello world']);

        // Could be used to inject some dynamic values
        return { ...answers, reactVersion: fetchTotallyDynamicReactVersion() };
    },
    afterCreationHook: async ({ getAfterHookHelper, answers }) => {
        console.log(`${answers.name} is a perfect name for a new project!`);

        const helper = getAfterHookHelper();
        await helper.runCommand('echo', ['hello world']);
    },
});
```

### Template variable

A `template` variable is always injected into the answers hash to use it in answer validation or when conditions.

```typescript
engine.registerQuestions([
    {
        type: 'input',
        message: 'World?',
        name: 'hello',
        when: ({ template }) => template === 'abc',
    },
]);
```

### setupInteractiveUI

Setup function that exposes the internal used helper instance and build in questions for modifications/usage. Gets [UIHelper](#UIHelper) and a indexed object of the [inquire](https://www.npmjs.com/package/inquirer) question type as parameter. See [build in questions](#build-in-questions)

### setupTemplateEngine

Setup function that exposes the internal used helper instance for modifications. Gets [TemplateHelper](#TemplateHelper) as parameter

### beforeCreationHook

Hook run before all files are copied. Gets [BeforeCreationHookObject](#BeforeCreationHookObject) as parameter and returns new answerers to be used

### afterCreationHook

Hook run after all files are copied. Gets [AfterCreationHookObject](#AfterCreationHookObject) as parameter

### argumentAnswerParsing

Function to parse/modify argument from the command line. Good for mapping falsy value to JS false.

```typescript
void create({
    argumentAnswerParsing: toParseAnswerArguments => {
        const result = toParseAnswerArguments;

        if ('isEarthling' in result) {
            result.isEarthling = Boolean(result.isEarthling);
        }

        return result;
    },
});
```

```bash
npm create something --isEarthling
```

Results in `{ isEarthling: true }`.

```bash
npm create something --isEarthling 0 # or other falsy values
```

Results in `{ isEarthling: false }`.

We need to do enable an explicit true/false like that since simply not providing `--isEarthling` is confusion the library.
There is no way to tell if you simply want it to be traded as `false` or not answered to trigger the prompting.

### getAfterHookHelper

Get function to get a helper to run predefined actions. Gets [AfterCreationHookOptions](#AfterCreationHookOptions) as parameter and returns [AfterHookHelper](#AfterHookHelper)

### getBeforeHookHelper

Get function to get a helper to run predefined actions. Returns [HookHelper](#HookHelper)

## Interfaces

### CreateOptions

-   `templatesDirectory` - Directory for template lookup

-   `templatesPrefix` - Prefix for template lookup. Can be useful if you want to mix other directories in the template directory.

-   `defaultTemplate` - Default template without the prefix.

-   `templateIgnorePattern` - Regex patterns to ignore while templating files with liquidjs. Default: `[/\.(gif|jpe?g|tiff?|png|webp|bmp)$/u]`

-   `partials` - Partials directory. See [partials-and-layouts](https://liquidjs.com/tutorials/partials-and-layouts.html)

-   `layouts` - layouts directory. See [partials-and-layouts](https://liquidjs.com/tutorials/partials-and-layouts.html)

-   `setupInteractiveUI` - Exposed the internal used interactive UI engine helper and build in questions for modifications/usage. See [setupInteractiveUI](#setupInteractiveUI) and [build in questions](#build-in-questions).

-   `setupTemplateEngine` - Exposed the internal used template engine helper for modifications. See [setupTemplateEngine](#setupIsetupTemplateEnginenteractiveUI)

-   `afterCreationHook` - Hook run after all files are copied. See [afterCreationHook](#afterCreationHook)

-   `argumentAnswerParsing` - Function to parse/modify argument from the command line. Good for mapping falsy value to JS false.

-   `beforeCreationHook` - Hook run before all files are copied. See [beforeCreationHook](#beforeCreationHook)

-   `modifyCreatePath` - Dangerous option: Gets the user selected create path to modify. Returned string will be used as new create path. Can be useful for temp directories or already full paths in certain situations

### UIHelper

-   `registerPrompt` - Registered a new prompt. See [documentation of inquirer](https://www.npmjs.com/package/inquirer)

-   `registerQuestion` - Registers a new question with name as selector. See [documentation of inquirer](https://www.npmjs.com/package/inquirer) for question examples and types

-   `registerQuestions` - Bulk register new questions with name as selector. See [documentation of inquirer](https://www.npmjs.com/package/inquirer) for question examples and types

-   `prompt` - internal use

### TemplateHelper

-   `registerTag` - Registered a new tag. See [register-filters-tags](https://liquidjs.com/tutorials/register-filters-tags.html)

-   `registerFilter` - Registered a new filter. See [register-filters-tags](https://liquidjs.com/tutorials/register-filters-tags.html)

-   `parseAndRender` - internal use

-   `renderFile` - internal use

### AfterCreationHookOptions

-   `packageManager` - Packagemanager to be used for actions

### HookHelperObject

-   `resolvedCreatePath` - Used create path

-   `resolvedTemplateDirectory` - Used template directory

-   `createOptions` - Used create options. See [CreateOptions](#CreateOptions)

-   `answers` - All given answers

### AfterCreationHookObject extends [HookHelperObject](#HookHelperObject)

-   `getAfterHookHelper` - Get function to configure the after hook helper and to run predefined actions. See [getAfterHookHelper](#getAfterHookHelper)

### BeforeCreationHookObject extends [HookHelperObject](#HookHelperObject)

-   `getBeforeHookHelper` - Get function to configure the before hook helper and to run predefined actions. See [getBeforeHookHelper](#getBeforeHookHelper)

### AfterHookHelper extends [HookHelper](#HookHelper)

-   `initGit` - Initialize a empty git repository.

-   `installDependencies` - Installs all dependencies with the configured package manager. See [AfterCreationHookOptions](#AfterCreationHookOptions)

### HookHelper

-   `runCommand` - runs a command with the new project root ad cwd.

## Templating

For templating this pack internally use [liquidjs](https://liquidjs.com/).

## Build in questions

-   `name` - Name for the new project

-   `description` - Description of the new project

-   `license` - License of the new project

## Mix use

The [Create helper function](#Create-helper-function) uses [minimist](https://www.npmjs.com/package/minimist) to parse provided arguments.

Those can be used to answer questions via arguments.

## Select template

Templates are provided via arguments: `--template <template_name>` will do the trick.

If nothing is provided that helper function wil, fallback to the defined default template

<!-- USEFUL -->

## Local testing

```bash
npm run test-cli
```

It will create a project from test templates

## Tips & Tricks

-   File permissions are preserved

-   The template engine is also run for file and directory names

-   NPM renames `.gitignore` to `.npmignore` during publish. To prevent this you can use echo in the filename: `{% echo '.gitignore' %}`

-   NPM processed every `package.json` during publish and applied the `files` filter. To prevent this you can use echo in the filename: `{% echo 'package' %}.json` and add the `$schema` to the file for 'linting':

    ```json
    {
        "$schema": "https://json.schemastore.org/package.json"
    }
    ```

-   Seeing something like `Unexpected error occurred during the processing of test.png`? This file cannot be parsed by liquidjs. Try to adapt the `templateIgnorePattern` to ignore those files.

<!-- MARKDOWN LINKS & IMAGES -->
<!-- https://www.markdownguide.org/basic-syntax/#reference-style-links -->

[contributors-shield]: https://img.shields.io/github/contributors/Beuterei/create-helper.svg?style=flat-square
[contributors-url]: https://github.com/Beuterei/create-helper/graphs/contributors
[forks-shield]: https://img.shields.io/github/forks/Beuterei/create-helper.svg?style=flat-square
[forks-url]: https://github.com/Beuterei/create-helper/network/members
[stars-shield]: https://img.shields.io/github/stars/Beuterei/create-helper.svg?style=flat-square
[stars-url]: https://github.com/Beuterei/create-helper/stargazers
[issues-shield]: https://img.shields.io/github/issues/Beuterei/create-helper.svg?style=flat-square
[issues-url]: https://github.com/Beuterei/create-helper/issues
[license-shield]: https://img.shields.io/github/license/Beuterei/create-helper.svg?style=flat-square
