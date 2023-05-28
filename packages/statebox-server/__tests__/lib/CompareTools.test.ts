import { compareLabels, intersectFilterHasThis, isSubset } from "../../src/lib/CompareTools";
import { matchQuery } from "../../src/lib/CompareTools";

describe("Update communicates tests", () => {
    it("Label comparator", () => {
        expect(compareLabels([], [])).toEqual(false);
        expect(compareLabels([], ["xxx"])).toEqual(false);
        expect(compareLabels(["xxx"], [])).toEqual(false);
        expect(compareLabels(["xxx"], ["xxx"])).toEqual(true);
        expect(compareLabels(["xxx"], ["xxx", "yyy"])).toEqual(false);
        expect(compareLabels(["xxx", "yyy"], ["xxx", "yyy"])).toEqual(true);
        expect(compareLabels(["xxx", "yyy"], ["yyy", "xxx"])).toEqual(true);
    });

    it("intersectFilterHasThis", () => {
        expect(intersectFilterHasThis([], [])).toEqual(false);
        expect(intersectFilterHasThis([], ["xxx"])).toEqual(false);
        expect(intersectFilterHasThis(["xxx"], [])).toEqual(false);
        expect(intersectFilterHasThis(["xxx"], ["xxx"])).toEqual(true);
        expect(intersectFilterHasThis(["xxx"], ["xxx", "yyy"])).toEqual(true);
        expect(intersectFilterHasThis(["yyy"], ["xxx", "yyy"])).toEqual(true);
        expect(intersectFilterHasThis(["xxx", "yyy"], ["xxx", "yyy"])).toEqual(true);
        expect(intersectFilterHasThis(["xxx", "yyy"], ["yyy", "xxx"])).toEqual(true);
    });

    it("isSubset", () => {
        expect(isSubset([], [])).toEqual(false);
        expect(isSubset([], ["xxx"])).toEqual(false);
        expect(isSubset(["xxx"], [])).toEqual(false);
        expect(isSubset(["xxx"], ["xxx"])).toEqual(true);
        expect(isSubset(["xxx"], ["xxx", "yyy"])).toEqual(false);
        expect(isSubset(["yyy"], ["xxx", "yyy"])).toEqual(false);
        expect(isSubset(["xxx", "yyy"], ["xxx", "yyy"])).toEqual(true);
        expect(isSubset(["xxx", "yyy"], ["yyy", "xxx"])).toEqual(true);
        expect(isSubset(["xxx", "yyy", "bbb"], ["yyy", "xxx"])).toEqual(true);
    });

    it("matchQuery", () => {
        expect(() => {
            matchQuery("", [], []);
        }).toThrow(Error);
        expect(() => {
            matchQuery("abc", [], []);
        }).toThrow(Error);

        expect(() => {
            matchQuery("abc/abc/abc", [], []);
        }).toThrow(Error);

        expect(matchQuery("*/*", [], [])).toEqual(false);
        expect(matchQuery("*/*", ["xxx"], [])).toEqual(true);
        expect(matchQuery("xxx/*", ["xxx"], [])).toEqual(true);
        expect(matchQuery("xxx|yyy/*", ["xxx"], [])).toEqual(true);
        expect(matchQuery("yyy/*", ["xxx"], [])).toEqual(false);
        expect(matchQuery("*/*", ["xxx"], ["yyy"])).toEqual(true);
        expect(matchQuery("*/yyy", ["xxx"], ["yyy"])).toEqual(true);
        expect(matchQuery("xxx/yyy", ["xxx"], ["yyy"])).toEqual(true);
        expect(matchQuery("xxx/*", ["xxx"], ["yyy"])).toEqual(true);
        expect(matchQuery("xxx/bbb", ["xxx"], ["yyy"])).toEqual(false);
        expect(matchQuery("bbb/yyy", ["xxx"], ["yyy"])).toEqual(false);
        expect(matchQuery("xxx/yyy|ccc", ["xxx"], ["yyy"])).toEqual(true);
        expect(matchQuery("xxx|bbb/yyy|ccc", ["xxx"], ["yyy"])).toEqual(true);
        expect(matchQuery("xxx|bbb/yyy&ccc", ["xxx"], ["yyy"])).toEqual(false);
        expect(matchQuery("xxx&bbb/yyy|ccc", ["xxx"], ["yyy"])).toEqual(false);
        expect(matchQuery("xxx&bbb/yyy|ccc", ["xxx", "bbb"], ["yyy"])).toEqual(true);
        expect(matchQuery("xxx&bbb/yyy&ccc", ["xxx", "bbb"], ["yyy", "ccc"])).toEqual(true);

        expect(matchQuery("www|xxx&bbb/yyy&ccc", ["xxx", "bbb"], ["yyy", "ccc"])).toEqual(true);
        expect(matchQuery("ccc|www&bbb/yyy&ccc", ["xxx", "bbb"], ["yyy", "ccc"])).toEqual(false);

        expect(matchQuery("#monitor-id/*", ["xxx"], [], "monitor-id", "job-id")).toEqual(true);
        expect(matchQuery("#monitor-id-2/*", ["xxx"], [], "monitor-id", "job-id")).toEqual(false);
        expect(matchQuery("xxx/#job-id", ["xxx"], [], "monitor-id", "job-id")).toEqual(true);
        expect(matchQuery("xxx/#job-id-2", ["xxx"], [], "monitor-id", "job-id")).toEqual(false);
        expect(matchQuery("#monitor-id/#job-id", ["xxx"], [], "monitor-id", "job-id")).toEqual(true);
    });
});
