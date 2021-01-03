import { compareLabels, intersectFilterHasThis } from "../../src/lib/CompareTools";

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
});
