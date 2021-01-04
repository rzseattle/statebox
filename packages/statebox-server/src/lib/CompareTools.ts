export const compareLabels = (labels: string[], labelsToCompare: string[]): boolean => {
    if (
        labels.length > 0 &&
        labels.length === labelsToCompare.length &&
        labels.sort().join("") === labelsToCompare.sort().join("")
    ) {
        return true;
    }
    return false;
};

/**
 * Helper to look labels intersect
 */
export const intersectFilterHasThis = (a: string[], b: string[]) => {
    return a.filter(Set.prototype.has, new Set(b)).length > 0;
};

/**
 * Helper to check if one array is subset of sec array
 */

export const isSubset = (container: string[], toCheck: string[]): boolean => {
    if (toCheck.length === 0) {
        return false;
    }

    if (container.length < toCheck.length) {
        return false;
    }

    const obj = {};

    container.forEach((el, index) => {
        obj[el] = index;
    });

    return toCheck.every((el) => {
        return obj[el] !== undefined;
    });
};
