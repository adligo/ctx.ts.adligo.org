import { ApiTrial, Test, TrialSuite } from '@ts.adligo.org/tests4j';
import {StringBuilder} from '@ts.adligo.org/io';


export function runIoTests() {
  console.log('starting io tests suite');
  new TrialSuite('io tests suite', [
    new ApiTrial('StringBuilderTrial', [
      new Test('testAppend', (ac) => {
        let sb: StringBuilder = new StringBuilder(4);
        var az: string = 'abcdefghijklmnopqrstuvwyzx0123456789';   
        az = az.concat(az.toUpperCase());   
        for (var i=0; i< az.length; i++) {
          let c = az.charAt(i);
          sb.append(c);
        }
        ac.equals(az, sb.toString())
      })
    ])
  ]).run();
  console.log('io tests finished');
}

runIoTests();