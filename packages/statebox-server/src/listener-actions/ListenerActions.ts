class ListenerActions {
    public removeJob(_listenerId: string, _monitorId: string, _jobId: string) {
        // test
        console.log(arguments);
    }
}

export const listenerActions = new ListenerActions();
