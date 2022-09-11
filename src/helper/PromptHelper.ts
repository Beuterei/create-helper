import { underline } from 'colorette';
import inquirer, { Answers } from 'inquirer';
import { DistinctQuestionModified } from '../shared/inquirer';
import { logAndFail } from '../util/helper.util';

// Class for all interactive related stuff. Wrapper class to have a somewhat replaceable interface
export class UIHelper {
    private inquirer = inquirer;
    // Array of registered questions. We need that to enable default questions but still give the possibility to configure what questions to actually ask and in what order
    private questionsSelection: DistinctQuestionModified[] = [];

    /** Registers a new prompt type */
    public registerPrompt(...args: Parameters<typeof inquirer['registerPrompt']>) {
        this.inquirer.registerPrompt(...args);
    }

    /** Registers a new question with name as selector */
    public registerQuestion(question: DistinctQuestionModified, override?: boolean) {
        // Check if we already have this question
        const selectedQuestion = this.questionsSelection.find(
            currentQuestion => currentQuestion.name === question.name,
        );
        if (selectedQuestion) {
            // Check if we want to override it
            if (override) {
                const index = this.questionsSelection.indexOf(selectedQuestion);
                // Try to delete it if override
                if (index > -1) {
                    this.questionsSelection.splice(index, 1);
                } else {
                    throw logAndFail(
                        `Override failed unexpected`,
                        'Try to add your question under a different name or set override to true',
                    );
                }
            } else {
                throw logAndFail(
                    `Question with name '${underline(question.name)}' exists already.`,
                    'Try to add your question under a different name or set override to true',
                );
            }
        }

        // Push question to registered questions array
        this.questionsSelection.push(question);
    }

    /** Bulk register new questions with name as selector */
    public registerQuestions(questions: DistinctQuestionModified[], override?: boolean) {
        // Wrap registerQuestion but with a loop around o.O
        Object.values(questions).forEach(question => {
            this.registerQuestion(question, override);
        });
    }

    /** Prompts the user with selected questions. Will skip question if found in initialAnswers */
    public prompt(questionsSelectors?: string[], initialAnswers?: Partial<Answers>) {
        // Sorted array of questions to be asked
        let promptQuestions: DistinctQuestionModified[] = [];

        if (questionsSelectors) {
            // Loop over selectors
            Object.values(questionsSelectors).forEach(selector => {
                // Check if we find a question based on the given selector
                const selectedQuestion = this.questionsSelection.find(
                    question => question.name === selector,
                );

                // If not found throw an error
                if (!selectedQuestion) {
                    throw logAndFail(
                        `Question with name '${underline(selector)}' could not be found.`,
                        'Did you register it?',
                    );
                }

                // If found push into array
                promptQuestions.push(selectedQuestion);
            });
        }

        // Prompt the questions but skip based on initialAnswers
        return this.inquirer.prompt(promptQuestions, initialAnswers);
    }
}
