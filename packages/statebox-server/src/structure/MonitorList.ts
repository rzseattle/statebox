import { Monitor } from "./Monitor";
import { multiplexer } from "../messenging/Multiplexer";
import { informator } from "../messenging/Informator";
import { MonitorOverwrite } from "../common-interface/IMessage";

export class MonitorList {
    monitors: Monitor[] = [];

    public add = (monitor: Monitor) => {
        this.monitors.push(monitor);
        // add monitor to routing
        multiplexer.addMonitor(monitor);
        // inform listeners about new monitor
        informator.monitorAdded(monitor);
    };
    public remove = (monitor: Monitor) => {
        const index = this.monitors.findIndex((el) => el.id === monitor.id);
        if (index !== -1) {
            // sending info about removed monitor
            informator.monitorRemoved(monitor);
            // removed monitor from routing
            multiplexer.removeMonitor(monitor);
            this.monitors.splice(index, 1);
        }
    };

    public findById = (id: string): Monitor | null => {
        const result = this.monitors.filter((el) => el.id === id);
        if (result.length === 1) {
            return result[0];
        } else {
            return null;
        }
    };

    findByLabels(labels: string[]): Monitor | null {
        const index = this.monitors.findIndex((el) => {
            if (el.labels.length > 0 && el.labels.length === labels.length && el.labels.join("") === labels.join("")) {
                return true;
            }
            return false;
        });

        if (index !== -1) {
            return this.monitors[index];
        }

        return null;
    }

    public getMonitorTODOANDREMOVE = (
        monitorId: string,
        labels: string[],
        overwriteStrategy: MonitorOverwrite | null,
    ): Monitor | null => {
        let index = this.monitors.findIndex((el) => el.id === monitorId);
        if (index !== -1) {
            return this.monitors[index];
        } else if (overwriteStrategy !== MonitorOverwrite.CreateNew) {
            index = this.monitors.findIndex((el) => {
                if (
                    el.labels.length > 0 &&
                    el.labels.length === labels.length &&
                    el.labels.join("") === labels.join("")
                ) {
                    return true;
                }

                return false;
            });

            if (index !== -1) {
                return this.monitors[index];
            }
        }
        return null;
    };
}

export const monitorList = new MonitorList();
