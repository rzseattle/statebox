import { compareLabels, intersectFilterHasThis, isSubset } from "../../src/lib/CompareTools";

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
});
