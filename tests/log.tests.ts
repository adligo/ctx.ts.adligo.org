import {LogManager} from '../src/log';

export type Runnable = () => void;

export type I_Out  = (message: string) => void;
export class Test {
  private name: string;
  private runnable: Runnable;

  constructor(name: string, runnable: Runnable) {
    this.name = name;
    this.runnable = runnable;
  }

  public getName() { return String; }
  public run() { this.runnable(); }
}

export class TestResult {
  private test: Test;
  private pass: boolean;
  private errorMessage: string;


  constructor(test: Test, pass?: boolean, errorMessage?: string) {
    this.test = test;
    if (pass == undefined) {
      this.pass = true
    } else {
      this.pass = pass;
    }
    if (errorMessage == undefined) {
      this.errorMessage = '';
    } else {
      this.errorMessage = errorMessage;
    }
  }

  public isPass() { return this.pass}
  public getErrorMessage() { return this.errorMessage; }
  public getName() { return this.test.getName(); }
}

export class ApiTrial {
  private name: string;
  private tests: Test[];
  private results: TestResult[] = [];
  private failures: number = 0;

  constructor(name: string, tests: Test[]) {
    this.name = name;
    this.tests = tests;
  }
  public getFailureCount() { return this.failures; }
  public getName() { return this.name; }
  public getTestCount() { return this.tests.length; }
  public getTestResults() { return this.results; }
  public run() {
    this.tests.forEach(t => {
      var e: string = '';
      try {
        t.run()
      } catch (x: any) {
        e = '' + x;
      }
      if (e == '') {
        this.results.push(new TestResult(t))
      } else {
        this.results.push(new TestResult(t, false, e));
        this.failures++;
      }
    });
  }
}

export class TrialSuite {
  private name: string;
  private out: I_Out;
  private trials: ApiTrial[];


  constructor(name: string, trials: ApiTrial[], out? : I_Out) {
    this.name = name;
    if (out == undefined) {
     this.out = (s) => console.log(s);
    } else {
      this.out = out;
    }
    this.trials = trials;
  }

  public run() {
    this.out('TrialSuite: ' + this.name);
    this.trials.forEach(t => {
      t.run();
      this.out('\t' + t.getName() + this.name);
      this.out('\t\tFailures: ' + t.getFailureCount());
      this.out('\t\tTests: ' + t.getTestCount());
      if (t.getFailureCount() != 0) {
        t.getTestResults().forEach(r => {
          if ( !r.isPass()) {
            this.out('\t\t\t' + r.getName() + " : " + r.getErrorMessage());
          }
        });
      }
    });
  }

}

console.log('starting log tests suite');
new TrialSuite('log tests suite',[
  new ApiTrial('LogManagerTrial', [
    new Test('testConstructor',() => {
      new LogManager()
    })
  ])
]).run();
console.log('tests finished');

