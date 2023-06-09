/**
  * Copyright 2023 Adligo Inc / Scott Morgan
  *
  * Licensed under the Apache License, Version 2.0 (the "License");
  * you may not use this file except in compliance with the License.
  * You may obtain a copy of the License at
  *
  *     http://www.apache.org/licenses/LICENSE-2.0
  *
  * Unless required by applicable law or agreed to in writing, software
  * distributed under the License is distributed on an "AS IS" BASIS,
  * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  * See the License for the specific language governing permissions and
  * limitations under the License.
  */

export const DEFAULT_FORMAT = '<logName/> <level/>: <message/>';
export const INVALID_LOG_FORMAT = 'Invalid log format ';
export const LEVEL = '<level/>';
export const LOGNAME = '<logname/>';
export const MESSAGE = '<message/>';
export const ROOT = 'ROOT';


export interface I_Log {
  debug(message : string): void
  error(message : string): void
  getFormat(): string
  getLevel(): LogLevel
  getName(): string
  info(message : string): void
  isDebug(): boolean
  isError(): boolean
  isInfo(): boolean
  isTrace(): boolean
  isWarn(): boolean
  trace(message : string): void
  warn(message : string): void
}
export interface I_LogConfig {
  getLevel(logName: string): LogLevel | undefined
  getFormat(): string
}

export type I_StringSupplier = () => string;
export type I_Out  = (message: string) => void;
export function format(log: I_Log, level: LogLevel, message: string): string {
    let format: string = log.getFormat();
    var outBuffer: string[] = [];
    var tagBuffer: string[] = [];
    var inTagBuffer: boolean = false;
    for (var i = 0; i < format.length; i ++ ) {
      let c = format.charAt(i);
      if (inTagBuffer) {
        if (c == '>') {
          tagBuffer.push(c);
          let tag: string = tagBuffer.join("").toLowerCase();
          tagBuffer = [];
          inTagBuffer = false;
          //console.log('tag is ' + tag);
          if (tag == LOGNAME) {
              outBuffer.push(log.getName());
          } else if (tag == LEVEL) {
            switch(level) {
              case LogLevel.DEBUG: outBuffer.push('Debug'); break;
              case LogLevel.ERROR: outBuffer.push('Error'); break;
              case LogLevel.INFO: outBuffer.push('Info'); break;
              case LogLevel.TRACE: outBuffer.push('Trace'); break;
              case LogLevel.WARN: outBuffer.push('Warn'); break; 
            }
          } else if (tag == MESSAGE) {
            outBuffer.push(message)
          } else {
              throw Error(INVALID_LOG_FORMAT + format);
          }
        } else {
          tagBuffer.push(c)
        }          
      } else {
        if (c == '<') {
          if (inTagBuffer) {
            throw Error('Invalid log format ' + format);
          }
          inTagBuffer = true;
          tagBuffer.push(c)
        } else {
          outBuffer.push(c)
        }
      }
    }
    return outBuffer.join("")
  }
  
export class Log implements I_Log {
  private format: string;
  private name: string;
  private level: LogLevel;
  private out: I_Out;
  
  constructor(name: string, format: string, level: LogLevel, out: I_Out) {
    this.name = name;
    this.level = level;
    this.out = out;
    this.format = format;
  }
  debug(message: string): void {
    if (this.isDebug()) {
      this.log(LogLevel.DEBUG, message);
    }
  }
  error(message: string): void {
    if (this.isError()) {
      this.log(LogLevel.ERROR, message);
    }
  }
  getFormat(): string {
     return this.format;
  }
  getLevel(): LogLevel {
     return this.level;
  }  
  getName(): string {
     return this.name;
  }
  info(message: string): void {
    if (this.isInfo()) {
      this.log(LogLevel.INFO, message);
    }
  }
  isWarn(): boolean {
    if (this.level <= LogLevel.WARN) {
      return true;
    }
    return false;
  }
  isTrace(): boolean {
    if (this.level <= LogLevel.TRACE) {
      return true;
    }
    return false;
  }
  isInfo(): boolean {
    if (this.level >= LogLevel.INFO) {
      return true;
    }
    return false;
  }
  isError(): boolean {
    if (this.level >= LogLevel.ERROR) {
      return true;
    }
    return false;
  }
  isDebug(): boolean {
    if (this.level >= LogLevel.DEBUG) {
      return true;
    }
    return false;
  }
  trace(message: string): void {
    if (this.isTrace()) {
      this.log(LogLevel.TRACE, message);
    }
  }
  warn(message: string): void {
    if (this.isWarn()) {
      this.log(LogLevel.WARN, message);
    }
  }
  
  private log(level: LogLevel, message: string) {
    this.out(format(this, level, message));
  }
}

export enum LogLevel {
  TRACE = 0,
  DEBUG = 1,
  INFO = 2,
  WARN = 3,
  ERROR = 4
}
export class LogConfig implements I_LogConfig {
  private format: string;
  private levels: Map<string,LogLevel>;
  /**
   * @param format this is the format of the text to append
   *   before the messages in the log, currently only <logName/>, <level/>
   *   and </message> are supported.  This defaults to;
   * <logName/> <level>: <message/>
   * @param levels these are the log levels, note these do NOT
   *    need to match up with the class names exactly.  They can
   *    be package names etc, also ROOT is the name of the root logger
   *    and is set to info by default.
   */
  constructor(format: string, levels: Map<string,LogLevel>) {
      this.format = format;
      this.levels = new Map(levels);    
      if (levels.get(ROOT) == undefined) {
        this.levels.set(ROOT, LogLevel.INFO);
      }
  }
  getFormat(): string {
      return this.format;
  }
  getLevel(logName: string): LogLevel | undefined {
      return this.levels.get(logName);
  }
  
}

export class LogManager {
  private config: LogConfig;
  private out: I_Out;
      
  constructor(config?: LogConfig, out?: I_Out) {
    if (config == undefined) {
      let levels: Map<string, LogLevel> = new Map();
      levels.set(ROOT, LogLevel.INFO);
      this.config = new LogConfig(DEFAULT_FORMAT, levels);
    } else {
      this.config = config;
    }
    if (out == undefined) {
      this.out = (m) => console.log(m); 
    } else {
      this.out = out;
    }
    this.getLog(ROOT).warn('LogManager is constructed!');
  }

  getLog(logName: string) {
    let l: Log =  new Log(logName, this.config.getFormat(), 
        this.getLogLevel(logName), this.out);
    return l;
  }

  private getLogLevel(logName: string): LogLevel {
    var level: LogLevel | undefined = this.config.getLevel(logName);
    if (level == undefined) {
      let names = logName.split('.');
      for (var i = names.length - 1; i >= 0; i --) {
        let nameBuf: string[] = []
        for (var j = 0; j <= i; j ++) {
          if (j == 0) {
            nameBuf.push(names[j]);
          } else {
            nameBuf.push('.');
            nameBuf.push(names[j]);
          }
        }
        let nn : string = nameBuf.toString();
        level = this.config.getLevel(nn);
        if (level != undefined) {
            break;
        }
      }
    }
    if (level == undefined) {
      level = this.config.getLevel(ROOT);
    }
    if (level == undefined) {
      return LogLevel.INFO;
    } else {
      return level;
    }
  }
}