import { underline } from 'colorette';
import type { Answers } from 'inquirer';
import inquirer from 'inquirer';
import type { DistinctQuestionModified } from '../shared/inquirer';
import { logAndFail } from '../util/helper.util';

// Class for all interactive related stuff. Wrapper class to have a somewhat replaceable interface
export class UIHelper {
    private inquirer = inquirer;

    // Array of registered questions. Order in this array is order questions are being asked
    private registeredQuestions: DistinctQuestionModified[] = [];

    /**
     * Registers a new prompt type
     */
    public registerPrompt(...args: Parameters<typeof inquirer['registerPrompt']>) {
        this.inquirer.registerPrompt(...args);
    }

    /**
     * Registers a new question with name as selector
     */
    public registerQuestion(question: DistinctQuestionModified) {
        // Check if we already have this question
        const selectedQuestion = this.registeredQuestions.find(
            currentQuestion => currentQuestion.name === question.name,
        );
        if (selectedQuestion) {
            logAndFail(
                `Question with name '${underline(question.name)}' exists already.`,
                'Try to add your question under a different name',
            );
        }

        // Push question to registered questions array
        this.registeredQuestions.push(question);
    }

    /**
     * Bulk register new questions with name as selector
     */
    public registerQuestions(questions: DistinctQuestionModified[]) {
        // Wrap registerQuestion but with a loop around o.O
        for (const question of Object.values(questions)) {
            this.registerQuestion(question);
        }
    }

    /**
     * Prompts the user with registered questions in order. Will skip question if found in initialAnswers
     */
    public prompt(initialAnswers?: Partial<Answers>) {
        // Prompt the questions but skip based on initialAnswers
        return this.inquirer.prompt(this.registeredQuestions, initialAnswers);
    }
}
