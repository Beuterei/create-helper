// Require all given keys
export type RequiredProperty<Type, Key extends keyof Type> = Type & {
    [Property in Key]-?: Type[Property];
};
