"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TrialSuite = exports.ApiTrial = exports.TestResult = exports.Test = void 0;
var log_1 = require("../src/log");
var Test = /** @class */ (function () {
    function Test(name, runnable) {
        this.name = name;
        this.runnable = runnable;
    }
    Test.prototype.getName = function () { return String; };
    Test.prototype.run = function () { this.runnable(); };
    return Test;
}());
exports.Test = Test;
var TestResult = /** @class */ (function () {
    function TestResult(test, pass, errorMessage) {
        this.test = test;
        if (pass == undefined) {
            this.pass = true;
        }
        else {
            this.pass = pass;
        }
        if (errorMessage == undefined) {
            this.errorMessage = '';
        }
        else {
            this.errorMessage = errorMessage;
        }
    }
    TestResult.prototype.isPass = function () { return this.pass; };
    TestResult.prototype.getErrorMessage = function () { return this.errorMessage; };
    TestResult.prototype.getName = function () { return this.test.getName(); };
    return TestResult;
}());
exports.TestResult = TestResult;
var ApiTrial = /** @class */ (function () {
    function ApiTrial(name, tests) {
        this.results = [];
        this.failures = 0;
        this.name = name;
        this.tests = tests;
    }
    ApiTrial.prototype.getFailureCount = function () { return this.failures; };
    ApiTrial.prototype.getName = function () { return this.name; };
    ApiTrial.prototype.getTestCount = function () { return this.tests.length; };
    ApiTrial.prototype.getTestResults = function () { return this.results; };
    ApiTrial.prototype.run = function () {
        var _this = this;
        this.tests.forEach(function (t) {
            var e = '';
            try {
                t.run();
            }
            catch (x) {
                e = '' + x;
            }
            if (e == '') {
                _this.results.push(new TestResult(t));
            }
            else {
                _this.results.push(new TestResult(t, false, e));
                _this.failures++;
            }
        });
    };
    return ApiTrial;
}());
exports.ApiTrial = ApiTrial;
var TrialSuite = /** @class */ (function () {
    function TrialSuite(name, trials, out) {
        this.name = name;
        if (out == undefined) {
            this.out = function (s) { return console.log(s); };
        }
        else {
            this.out = out;
        }
        this.trials = trials;
    }
    TrialSuite.prototype.run = function () {
        var _this = this;
        this.out('TrialSuite: ' + this.name);
        this.trials.forEach(function (t) {
            t.run();
            _this.out('\t' + t.getName() + _this.name);
            _this.out('\t\tFailures: ' + t.getFailureCount());
            _this.out('\t\tTests: ' + t.getTestCount());
            if (t.getFailureCount() != 0) {
                t.getTestResults().forEach(function (r) {
                    if (!r.isPass()) {
                        _this.out('\t\t\t' + r.getName() + " : " + r.getErrorMessage());
                    }
                });
            }
        });
    };
    return TrialSuite;
}());
exports.TrialSuite = TrialSuite;
console.log('starting log tests suite');
new TrialSuite('log tests suite', [
    new ApiTrial('LogManagerTrial', [
        new Test('testConstructor', function () {
            new log_1.LogManager();
        })
    ])
]).run();
console.log('tests finished');
//# sourceMappingURL=log.tests.js.map