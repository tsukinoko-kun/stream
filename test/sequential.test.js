const { AsyncStream } = require("../")

test("AsyncStream::sequentialAsync", async () => {
    const arr = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
    const aStr = AsyncStream.of(arr)
    const sStr = await aStr.sequentialAsync()

    expect(sStr.toArray()).toEqual(arr)
})
