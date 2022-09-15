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
            buildInQuestions.license
        ])
    },
    afterCreationHook: async ({ getAfterHookHelper }) => {
        const helper = getAfterHookHelper();
        await helper.runCommand('echo', ['hello world']);
    },
});
