export class Logger {
    log(el: string, context: unknown = null) {
        //if (false) {
            console.log(el, context);
        //}
    }
    error(el: string, context: unknown = null) {
        if (context !== null) {
            console.error(el, context);
        } else {
            console.error(el);
        }
    }
    debug(el: string, context: unknown = null) {
        if (context !== null) {
            console.log(el, context);
        } else {
            console.log(el);
        }
    }
}
