class ListenerActions {
    public removeJob(listenerId: string, monitorId: string, jobId: string) {
        // test
        console.log(arguments);
    }
}

export const listenerActions = new ListenerActions();
