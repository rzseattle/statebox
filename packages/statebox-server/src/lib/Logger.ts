export class Logger {
    log(el: string, context: unknown = null) {
        if (true) {
            if (context !== null) {
                console.log(el, context);
            } else {
                console.log(el);
            }
        }
    }
}
