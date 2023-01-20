#!/usr/bin/node

import { resolve } from 'path';
import { create } from '../src';

create({
    templatesDirectory: resolve(__dirname, 'templates'),
    defaultTemplate: 'test',
    templatesPrefix: 'test-',
    setupInteractiveUI: (engine, buildInQuestions) => {
        engine.registerQuestions([
            buildInQuestions.name,
            buildInQuestions.description,
            buildInQuestions.license,
        ]);
    },
    beforeCreationHook: async ({ getBeforeHookHelper, answers }) => {
        const helper = getBeforeHookHelper();
        await helper.runCommand('echo', ['hello world']);

        console.log(`I run before ${answers.template} scaffold being created.`);

        return { ...answers, test: 'Yes!'} ;
    },
    afterCreationHook: async ({ getAfterHookHelper, answers }) => {
        const helper = getAfterHookHelper();
        await helper.runCommand('echo', ['hello world']);

        console.log(`You generated a ${answers.template} scaffold. Did the test var get injected? ${answers.test}`);
    },
});
