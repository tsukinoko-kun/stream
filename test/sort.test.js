const { SequentialStream, AsyncStream } = require("../")

test("SequentialStream::sort", () => {
    const arr = [3, 2, 1, 5, 4]

    expect(SequentialStream.of(arr).sort().toArray()).toEqual([1, 2, 3, 4, 5])
})

test("AsyncStream::sort", async () => {
    const arr = [3, 2, 1, 5, 4]

    expect(await AsyncStream.of(arr).sort().toArrayAsync()).toEqual([
        1, 2, 3, 4, 5,
    ])
})
