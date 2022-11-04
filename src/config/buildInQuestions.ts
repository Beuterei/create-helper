import spdxLicenseList from '@ovyerus/licenses';
import type { DistinctQuestionModified } from '../shared/inquirer';

// declare module inquire to add the new question type
declare module 'inquirer' {
    interface QuestionMap<T> {
        'search-list': ListQuestionOptions<T>;
    }
}

export interface BuildInQuestions {
    description: DistinctQuestionModified;
    license: DistinctQuestionModified;
    name: DistinctQuestionModified;
}

// Export all default questions to register
export const buildInQuestions: BuildInQuestions = {
    name: {
        type: 'input',
        message: 'What is the name of your project?',
        name: 'name',
    },
    description: {
        type: 'input',
        message: 'What is the description of your project?',
        name: 'description',
        default: 'description',
    },
    license: {
        type: 'search-list',
        message: 'What license do you want to use?',
        name: 'license',
        choices: ['MIT', ...Object.keys(spdxLicenseList).filter(element => element !== 'MIT')],
        default: 'MIT',
    },
};
