const { SequentialStream, AsyncStream } = require("../")

test("SequentialStream::distinct", () => {
    const arr1 = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
    const arr2 = [].concat(arr1, arr1, arr1, arr1, arr1, arr1, arr1, arr1, arr1, arr1)

    expect(SequentialStream.of(arr1).distinct().toArray()).toEqual(arr1)
    expect(SequentialStream.of(arr2).distinct().toArray()).toEqual(arr1)
})

test("AsyncStream::distinct", async () => {
    const arr1 = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
    const arr2 = [].concat(arr1, arr1, arr1, arr1, arr1, arr1, arr1, arr1, arr1, arr1)

    expect(await AsyncStream.of(arr1).distinct().toArrayAsync()).toEqual(arr1)
    expect(await AsyncStream.of(arr2).distinct().toArrayAsync()).toEqual(arr1)
})
