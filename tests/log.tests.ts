import { DEFAULT_FORMAT, I_Log, Log, LogConfig, LogLevel, LogManager, ROOT, format } from '../src/log';

export interface I_AssertionCounter {
  add(): void
}
export type AssertionCounterConsumer = (assertionCounter: I_AssertionCounter) => void;

export type I_Out  = (message: string) => void;

export function equals(assertionCounter: I_AssertionCounter, expected: string, actual: string) {
  assertionCounter.add()
  if (expected != actual) {
    throw Error('The expected string is; \n\t\'' + expected + '\'\n\tHowever the actual string is;\n\t\'' + 
      actual + '\'');
  }
}

export function isTrue(assertionCounter: I_AssertionCounter, check: boolean, message: string) {
  assertionCounter.add()
  if (!check) {
    throw Error(message);
  }
}

export function isFalse(assertionCounter: I_AssertionCounter, check: boolean, message: string) {
  assertionCounter.add()
  if (check) {
    throw Error(message);
  }
}

export class AssertionCounter implements I_AssertionCounter {
  private count: number =0;
  public add() { this.count++}
  public getCount(): number { return this.count}
}

export class Test {
  private name: string;
  private acConsumer: AssertionCounterConsumer;

  constructor(name: string, assertionCounterConsumer: AssertionCounterConsumer) {
    this.name = name;
    this.acConsumer = assertionCounterConsumer;
  }

  public getName() { return this.name; }
  public run(assertionCounter: I_AssertionCounter) { this.acConsumer(assertionCounter); }
}

export class TestResult {
  private assertionCount : number;
  private test: Test;
  private pass: boolean;
  private errorMessage: string;

  constructor(assertionCount: number, test: Test, pass?: boolean, errorMessage?: string) {
    this.assertionCount = assertionCount;
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
  public getAssertionCount() { return this.assertionCount }
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
  public getAssertionCount() { return this.results.map(r => r.getAssertionCount()).reduce((sum, current) => sum + current, 0); }
  public getFailureCount() { return this.failures; }
  public getName() { return this.name; }
  public getTestCount() { return this.tests.length; }
  public getTestResults() { return this.results; }
  public run() {
    this.tests.forEach(t => {
      var e: string = '';
      let ac: AssertionCounter = new AssertionCounter();
      try {
        t.run(ac)
      } catch (x: any) {
        e = '' + x;
      }
      if (e == '') {
        this.results.push(new TestResult(ac.getCount(), t))
      } else {
        this.results.push(new TestResult(ac.getCount(), t, false, e));
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
      this.out('\t\tAssertions: ' + t.getAssertionCount());
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

function testFormat(assertionCounter: I_AssertionCounter, level: LogLevel, levelString: string, message: string) {
  let out = (message: string) => {};//does nothing!
  let m = format(new Log('testFormatFun', DEFAULT_FORMAT, LogLevel.INFO, out), level, message)
  equals(assertionCounter, 'testFormatFun ' + levelString + ': '+ message, m);
}

function checkRootConstructorOutput(ac: I_AssertionCounter, level: LogLevel, levelString: string): LogManager {
  var checkedOut: boolean = false;
  let out = (message: string) => {
    equals(ac, 'ROOT ' + levelString + ': LogManager is constructed!', message);
    checkedOut = true;
  };
  let levels: Map<string,LogLevel> =  new Map();
  levels.set(ROOT, level)
  let lm: LogManager = new LogManager(new LogConfig(DEFAULT_FORMAT, levels), out);
  isTrue(ac, checkedOut, 'The output should be checked!');
  return lm;
}

function newLogManager(levels: Map<string,LogLevel>, out: I_Out): LogManager {
  let lm: LogManager = new LogManager(new LogConfig(DEFAULT_FORMAT, levels), out);
  return lm;
}

console.log('starting log tests suite');
new TrialSuite('log tests suite',[
  new ApiTrial('LogFunctionsTrial', [
    new Test('testFormatFunTrace',(ac) => {
      testFormat(ac, LogLevel.TRACE, 'Trace', '1test log message');
    }),
    new Test('testFormatFunDebug',(ac) => {
      testFormat(ac, LogLevel.DEBUG, 'Debug',  '2test log message')
    }),
    new Test('testFormatFunInfo',(ac) => {
      testFormat(ac, LogLevel.INFO, 'Info', '3test log message')
    }),
    new Test('testFormatFunWarn',(ac) => {
      testFormat(ac, LogLevel.WARN, 'Warn', '4test log message')
    }),
    new Test('testFormatFunError',(ac) => {
      testFormat(ac, LogLevel.ERROR, 'Error', '5test log message')
    })
  ]),
  new ApiTrial('LogWritingTrial', [
    new Test('testConstructorDefault',(ac) => {
      let logMessage: string = '';
      let out: I_Out = (m: string) => { logMessage = m;};
      let levels: Map<string,LogLevel> = new Map();
      levels.set('models.active', LogLevel.DEBUG);
      levels.set('models.passive', LogLevel.INFO);
      levels.set('views.login.logging.insecure', LogLevel.TRACE);
      let lm = newLogManager(levels, out);
      let logMa: I_Log = lm.getLog('models.active');
      isTrue(ac, logMa.getLevel() == LogLevel.DEBUG, 'The models.active log SHOULD be at DEBUG');
      let logMp: I_Log = lm.getLog('models.passive');
      isTrue(ac, logMp.getLevel() == LogLevel.INFO, 'The models.passive log SHOULD be at DEBUG');
      let logVlli: I_Log = lm.getLog('views.login.logging.insecure');
      isTrue(ac, logVlli.getLevel() == LogLevel.TRACE, 'The models.passive log SHOULD be at TRACE');

      //test wild cards above;
      let logM: I_Log = lm.getLog('models');
      isTrue(ac, logM.getLevel() == LogLevel.INFO, 'The models log SHOULD be at INFO');
      let logVll: I_Log = lm.getLog('views.login.logging');
      isTrue(ac, logVll.getLevel() == LogLevel.INFO, 'The views.login.logging log SHOULD be at INFO');
    })
  ]),
  new ApiTrial('LogManagerTrial', [
    new Test('testConstructorDefault',(ac) => {
      var checkedOut: boolean = false;
      let out = (message: string) => {
        equals(ac, 'ROOT Warn: LogManager is constructed!', message);
        checkedOut = true;
      };
      new LogManager(new LogConfig(DEFAULT_FORMAT, new Map()), out);
      isTrue(ac, checkedOut, 'The output should be checked!');
    }),
    new Test('testConstructorRootTrace',(ac) => {
      checkRootConstructorOutput(ac,LogLevel.TRACE,'Warn');
    }),
    new Test('testConstructorRootDebug',(ac) => {
      checkRootConstructorOutput(ac,LogLevel.DEBUG,'Warn');
    }),
    new Test('testConstructorRootWarn',(ac) => {
      checkRootConstructorOutput(ac,LogLevel.WARN,'Warn');
    }),
    new Test('testConstructorDefaultError',(ac) => {
      var checkedOut: boolean = false;
      let out = (message: string) => {
        checkedOut = true;
      };
      let levels: Map<string,LogLevel> =  new Map();
      levels.set(ROOT, LogLevel.ERROR)
      new LogManager(new LogConfig(DEFAULT_FORMAT, levels), out);
      isFalse(ac, checkedOut, 'The output NOT occur!');
    })
  ])
]).run();
console.log('tests finished');

