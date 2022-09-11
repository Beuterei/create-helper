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
    <a href="https://github.com/beuluis/create-helper/issues">Report Bug</a>
    ·
    <a href="https://github.com/beuluis/create-helper/issues">Request Feature</a>
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

## Usage

This pack is meant to be used with the [npm init](https://docs.npmjs.com/cli/v8/commands/npm-init) which runs the main bin of a pack when provided as parameter.

1. Create a new `create-something` pack.

2. Create a bin script in the desired destination. (Make sure to set [main](https://docs.npmjs.com/cli/v8/configuring-npm/package-json#main))

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

create({
    questionsSelectors: ['name', 'description', 'license'],
    templatesDirectory: resolve(__dirname, 'templates'),
    templatesPrefix: 'test-',
    defaultTemplate: 'test',
    partials: resolve(__dirname, 'templates', 'partials'),
    layouts: resolve(__dirname, 'templates', 'layouts'),
    setupInteractiveUI: engine => {
        // exposes the internal used interactive UI engine helper for modifications
        engine.registerPrompt('autocomplete', autocomplete);

        // This is just to show this function you can also combine this with registerQuestions
        engine.registerQuestion(
            {
                type: 'input',
                message: 'Message was overridden?',
                name: 'name',
            },
            true,
        );

        engine.registerQuestions([
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
        ]);
    },
    setupTemplateEngine: engine => {
        engine.registerFilter('upper', v => v.toUpperCase());
        engine.registerTag('upper', myTag);
    },
    afterCreationHook: async ({ getAfterHookHelper, answers }) => {
        console.log(`${answers.name} is a perfect name for a new project!`);

        const helper = getAfterHookHelper();
        await helper.runCommand('echo', ['hello world']);
    },
});
```

### setupInteractiveUI

Setup function that exposes the internal used helper instance for modifications. Gets [UIHelper](#UIHelper) as parameter

### setupTemplateEngine

Setup function that exposes the internal used helper instance for modifications. Gets [TemplateHelper](#TemplateHelper) as parameter

### afterCreationHook

Hook run after all files are copied. Gets [AfterCreationHookObject](#AfterCreationHookObject) as parameter

### getAfterHookHelper

Get function to get a helper to run predefined actions. Gets [AfterCreationHookOptions](#AfterCreationHookOptions) as parameter and returns []()

## Interfaces

### CreateOptions

-   `questionsSelectors` - What questions to ask in what order. See [Build in questions](#Build in questions)

-   `templatesDirectory` - Directory for template lookup

-   `templatesPrefix` - Prefix for template lookup. Can be useful if you want to mix other directories in the template directory.

-   `defaultTemplate` - Default template without the prefix.

-   `partials` - Partials directory. See [partials-and-layouts](https://liquidjs.com/tutorials/partials-and-layouts.html)

-   `layouts` - layouts directory. See [partials-and-layouts](https://liquidjs.com/tutorials/partials-and-layouts.html)

-   `setupInteractiveUI` - Exposed the internal used interactive UI engine helper for modifications. See [setupInteractiveUI](#setupInteractiveUI)

-   `setupTemplateEngine` - Exposed the internal used template engine helper for modifications. See [setupTemplateEngine](#setupIsetupTemplateEnginenteractiveUI)

-   `afterCreationHook` - Hook run after all files are copied. See [afterCreationHook](#afterCreationHook)

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

### AfterCreationHookObject

-   `getAfterHookHelper` - Get function to configure the after hook helper and to run predefined actions. See [getAfterHookHelper](#getAfterHookHelper)

-   `resolvedCreatePath` - Used create path

-   `resolvedTemplateDirectory` - Used template directory

-   `createOptions` - Used create options. See [CreateOptions](#CreateOptions)

-   `answers` - All given answers

### AfterHookHelper

-   `runCommand` - runs a command with the new project root ad cwd.

-   `initGit` - Initialize a empty git repository.

-   `installDependencies` - Installs all dependencies with the configured package manager. See [AfterCreationHookOptions](#AfterCreationHookOptions)

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

<!-- CONTRIBUTING -->

## Contributing

Contributions are what make the open source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

<!-- TODO -->

## TODOs:

-   [ ] Make tha types on some point safer

<!-- CONTACT -->

## Contact

Luis Beu - me@luisbeu.de

<!-- MARKDOWN LINKS & IMAGES -->
<!-- https://www.markdownguide.org/basic-syntax/#reference-style-links -->

[contributors-shield]: https://img.shields.io/github/contributors/beuluis/create-helper.svg?style=flat-square
[contributors-url]: https://github.com/beuluis/create-helper/graphs/contributors
[forks-shield]: https://img.shields.io/github/forks/beuluis/create-helper.svg?style=flat-square
[forks-url]: https://github.com/beuluis/create-helper/network/members
[stars-shield]: https://img.shields.io/github/stars/beuluis/create-helper.svg?style=flat-square
[stars-url]: https://github.com/beuluis/create-helper/stargazers
[issues-shield]: https://img.shields.io/github/issues/beuluis/create-helper.svg?style=flat-square
[issues-url]: https://github.com/beuluis/create-helper/issues
[license-shield]: https://img.shields.io/github/license/beuluis/create-helper.svg?style=flat-square
