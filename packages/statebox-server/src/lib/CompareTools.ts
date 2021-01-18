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

const getEntriesToMach = (queryPart: string): string[][] => {
    return queryPart.split("|").map((el) => el.split("&"));
};

export const matchQuery = (query: string, monitorLabels: string[], jobLabels: string[] | null): boolean => {
    if (!query.match(/^[^/]+?\/[^/]+$/)) {
        throw new Error("Wrong query format");
    }
    if (monitorLabels.length === 0) {
        return false;
    }

    const [monitorPart, jobPart] = query.split("/").map((el) => getEntriesToMach(el));
    let monitorLabelsPass = false;
    let jobLabelsPass = false;

    // adding wildcard match
    const extendedMonitorLabels = ["*", ...monitorLabels];

    for (const labels of monitorPart) {
        if (isSubset(extendedMonitorLabels, labels)) {
            monitorLabelsPass = true;
            break;
        }
    }

    if (jobLabels !== null) {
        const extendedJobLabels = ["*", ...jobLabels];
        for (const labels of jobPart) {
            if (isSubset(extendedJobLabels, labels)) {
                jobLabelsPass = true;
                break;
            }
        }
    } else {
        jobLabelsPass = true;
    }

    return monitorLabelsPass && jobLabelsPass;
};

export const matchQueryAllOnlyMonitor = (queries: string[], monitorLabels: string[]): boolean => {
    for (const query of queries) {
        if (matchQuery(query, monitorLabels, null)) {
            return true;
        }
    }
    return false;
};

export const matchQueryAll = (queries: string[], monitorLabels: string[], jobLabels: string[]): boolean => {
    for (const query of queries) {
        if (matchQuery(query, monitorLabels, jobLabels)) {
            return true;
        }
    }
    return false;
};
