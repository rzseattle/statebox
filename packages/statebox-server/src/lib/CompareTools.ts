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
