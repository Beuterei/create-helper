import { Question } from "inquirer";

// TODO: move this to readme
declare module 'inquirer' {
    interface QuestionMap<T> {
        chalk: Question<T> & { Hello: string};
    }
}