export function extend(obj1: unknown, obj2: unknown) {
    const keys = Object.keys(obj2);
    for (let i = 0; i < keys.length; i += 1) {
        const val = obj2[keys[i]];
        obj1[keys[i]] =
            ["string", "number", "array", "boolean"].indexOf(typeof val) === -1
                ? extend(obj1[keys[i]] || {}, val)
                : val;
    }
    return obj1;
}
