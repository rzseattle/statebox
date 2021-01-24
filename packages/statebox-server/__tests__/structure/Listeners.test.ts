import { StateboxServer } from "../../src/server/StateboxServer";

describe("Listeners structure & events test", () => {
    it("Listener add test", () => {
        const server = new StateboxServer();

        const spyAddListener = jest.spyOn(server.multiplexer, "addListener");

        server.listeners.add({ id: "testID", tracked: [], commChannel: { send: (_msg) => {}, close: () => {} } });
        expect(server.listeners.getAll().size).toEqual(1);
        expect(spyAddListener).toHaveBeenCalled();
    });

    it("Listener remove test", () => {
        const server = new StateboxServer();

        const spyRemoveListener = jest.spyOn(server.multiplexer, "removeListener");

        server.listeners.add({ id: "testID", tracked: [], commChannel: { send: (_msg) => {}, close: () => {} } });

        server.listeners.remove("testID");

        expect(server.listeners.getAll().size).toEqual(0);
        expect(spyRemoveListener).toHaveBeenCalled();
    });
});
