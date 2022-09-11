#!/usr/bin/node

import { resolve } from 'path';
import { create } from '../src';

create({
    questionsSelectors: ['name', 'description', 'license'],
    templatesDirectory: resolve(__dirname, 'templates'),
    defaultTemplate: 'test',
    templatesPrefix: 'test-',
    afterCreationHook: async ({ getAfterHookHelper }) => {
        const helper = getAfterHookHelper();
        await helper.runCommand('echo', ['hello world']);
    },
});
