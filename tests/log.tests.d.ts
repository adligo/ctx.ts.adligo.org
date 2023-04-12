export type Runnable = () => void;
export type I_Out = (message: string) => void;
export declare class Test {
    private name;
    private runnable;
    constructor(name: string, runnable: Runnable);
    getName(): StringConstructor;
    run(): void;
}
export declare class TestResult {
    private test;
    private pass;
    private errorMessage;
    constructor(test: Test, pass?: boolean, errorMessage?: string);
    isPass(): boolean;
    getErrorMessage(): string;
    getName(): StringConstructor;
}
export declare class ApiTrial {
    private name;
    private tests;
    private results;
    private failures;
    constructor(name: string, tests: Test[]);
    getFailureCount(): number;
    getName(): string;
    getTestCount(): number;
    getTestResults(): TestResult[];
    run(): void;
}
export declare class TrialSuite {
    private name;
    private out;
    private trials;
    constructor(name: string, trials: ApiTrial[], out?: I_Out);
    run(): void;
}
