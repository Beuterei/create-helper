import { DistinctQuestionModified } from '../shared/inquirer';
import spdxLicenseList from '@ovyerus/licenses';

// Export all default questions to register
export const defaultQuestions: DistinctQuestionModified[] = [
    {
        type: 'input',
        message: 'What is the name of your project?',
        name: 'name',
    },
    {
        type: 'input',
        message: 'What is the description of your project?',
        name: 'description',
        default: 'description',
    },
    {
        type: 'list',
        message: 'What license do you want to use?',
        name: 'license',
        choices: Object.keys(spdxLicenseList),
        default: 'MIT',
    },
];
