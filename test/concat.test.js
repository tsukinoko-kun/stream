const { SequentialStream, AsyncStream } = require("../")

test("SequentialStream::concat", () => {
    const arr1 = [1, 2, 3]
    const arr2 = [4, 5, 6]

    expect(
        SequentialStream.of(arr1)
            .concat(SequentialStream.of(arr2))
            .toArray()
    ).toEqual([...arr1, ...arr2])
})

test("AsyncStream::concat", async () => {
    const arr1 = [1, 2, 3]
    const arr2 = [4, 5, 6]

    expect(
        (await AsyncStream.of(arr1)
            .concat(AsyncStream.of(arr2))
            .toArrayAsync())
    ).toEqual([...arr1, ...arr2])
})
