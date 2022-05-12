export class Logger {
    log(el: string, context: unknown = null) {
        if (false) {
            if (context !== null) {
                console.log(el, context);
            } else {
                console.log(el);
            }
        }
    }
}
