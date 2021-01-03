export const compareLabels = (labels: string[], labelsToCompare: string[]): boolean => {
    if (labels.length > 0 && labels.length === labelsToCompare.length && labels.join("") === labelsToCompare.join("")) {
        return true;
    }
    return false;
};
