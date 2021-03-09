export enum LogLevel {
    debug,
    info,
    notice,
    warning,
    error,
    critical,
    alert,
    emergency,
    never,
}

const LogLevelNames = ["debug", "info", "notice", "warning", "error", "critical", "alert", "emergency"];

export enum LogFormat {
    SYSLOG,
    JSON,
}

//export const chalk;

export type LogListener = (log: {
    name: string;
    level: string;
    date: string;
    msg: string;
    context: Record<string, any> | string[] | null;
}) => any;

export class Logger {
    private _logLevel = LogLevel.info;
    private _format: LogFormat = LogFormat.SYSLOG;
    private _listeners: LogListener[] = [];

    private _dateFormat: "none" | "short" | "full" = "short";

    get format(): LogFormat {
        return this._format;
    }

    set format(value: LogFormat) {
        this._format = value;
    }

    get logLevel(): LogLevel {
        return this._logLevel;
    }

    set logLevel(value: LogLevel) {
        this._logLevel = value;
    }

    constructor(private name: string = "") {}

    public addLogListener = (listener: LogListener) => {
        this._listeners.push(listener);
    };

    public debug(msg: string, context: Record<string, any> | null = null) {
        this.out(LogLevel.debug, msg, context);
    }

    public info(msg: string, context: Record<string, any> | null = null) {
        this.out(LogLevel.info, msg, context);
    }

    public critical(msg: string, context: Record<string, any> | null = null) {
        this.out(LogLevel.critical, msg, context);
    }

    public error(msg: string, context: Record<string, any> | null = null) {
        this.out(LogLevel.error, msg, context);
    }

    private out(level: LogLevel, msg: string, context: Record<string, any> | string[] | null = null) {
        if (level >= this._logLevel) {
            let date = "";
            if (this._dateFormat !== "none") {
                date = new Date().toISOString().slice(0, 19).replace("T", " ");
                if (this._dateFormat === "short") {
                    date = date.split(" ")[1];
                }
            }

            const entry = {
                logName: this.name,
                level: LogLevelNames[level],
                date,
                msg,
                context: context ?? [],
            };

            for (const listener of this._listeners) {
                listener({
                    name: entry.logName,
                    level: entry.level,
                    date,
                    msg,
                    context: entry.context,
                });
            }

            if (this._format == LogFormat.JSON) {
                console.log(entry);
            } else {
                process.stdout.write(
                    (this.name !== "" ? this.name + " | " : "") +
                        entry.date +
                        " " +
                        entry.level.padEnd(6) +
                        " " +
                        msg +
                        (context ? " (" + JSON.stringify(context) + " )" : "") +
                        "\n",
                );
            }
        }
    }
}
