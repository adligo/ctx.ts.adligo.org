import {I_Out} from '@ts.adligo.org/io';
import {ApiTrial, AssertionContext, Test, TrialSuite} from '@ts.adligo.org/tests4j';
import { DEFAULT_FORMAT, I_Log, Log, LogConfig, LogLevel, LogManager, ROOT, format } from '../src/log.js';


function testFormat(ac: AssertionContext, level: LogLevel, levelString: string, message: string) {
  let out = (message: string) => {};//does nothing!
  let m = format(new Log('testFormatFun', DEFAULT_FORMAT, LogLevel.INFO, out), level, message)
  ac.equals('testFormatFun ' + levelString + ': '+ message, m);
}

function checkRootConstructorOutput(ac: AssertionContext, level: LogLevel, levelString: string): LogManager {
  var checkedOut: boolean = false;
  let out = (message: string) => {
    ac.equals('ROOT ' + levelString + ': LogManager is constructed!', message);
    checkedOut = true;
  };
  let levels: Map<string,LogLevel> =  new Map();
  levels.set(ROOT, level)
  let lm: LogManager = new LogManager(new LogConfig(DEFAULT_FORMAT, levels), out);
  ac.isTrue(checkedOut, 'The output should be checked!');
  return lm;
}

function newLogManager(levels: Map<string,LogLevel>, out: I_Out): LogManager {
  let lm: LogManager = new LogManager(new LogConfig(DEFAULT_FORMAT, levels), out);
  return lm;
}

export function runLogTests() {
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
        ac.isTrue(logMa.getLevel() == LogLevel.DEBUG, 'The models.active log SHOULD be at DEBUG');
        let logMp: I_Log = lm.getLog('models.passive');
        ac.isTrue(logMp.getLevel() == LogLevel.INFO, 'The models.passive log SHOULD be at DEBUG');
        let logVlli: I_Log = lm.getLog('views.login.logging.insecure');
        ac.isTrue(logVlli.getLevel() == LogLevel.TRACE, 'The models.passive log SHOULD be at TRACE');

        //test wild cards above;
        let logM: I_Log = lm.getLog('models');
        ac.isTrue(logM.getLevel() == LogLevel.INFO, 'The models log SHOULD be at INFO');
        let logVll: I_Log = lm.getLog('views.login.logging');
        ac.isTrue(logVll.getLevel() == LogLevel.INFO, 'The views.login.logging log SHOULD be at INFO');
      })
    ]),
    new ApiTrial('LogManagerTrial', [
      new Test('testConstructorDefault',(ac) => {
        var checkedOut: boolean = false;
        let out = (message: string) => {
          ac.equals('ROOT Warn: LogManager is constructed!', message);
          checkedOut = true;
        };
        new LogManager(new LogConfig(DEFAULT_FORMAT, new Map()), out);
        ac.isTrue(checkedOut, 'The output should be checked!');
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
        ac.isFalse(checkedOut, 'The output NOT occur!');
      })
    ])
  ]).run();
  console.log('tests finished');
}
runLogTests();

