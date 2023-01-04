const { SequentialStream, AsyncStream } = require("../")

test("SequentialStream::some", () => {
    expect(SequentialStream.empty().some()).toEqual(false)
    expect(SequentialStream.of([1, 2, 3]).some()).toEqual(true)
})

test("AsyncStream::someAsync", async () => {
    expect(await AsyncStream.empty().someAsync()).toEqual(false)
    expect(await AsyncStream.of([1, 2, 3]).someAsync()).toEqual(true)
})
