const { SequentialStream, AsyncStream } = require("../")

test("SequentialStream::filter 1", () => {
    const arr1 = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
    const arr2 = [2, 4, 6, 8, 10]

    expect(SequentialStream.of(arr1)
        .filter(x => x % 2 === 0)
        .toArray()
    ).toEqual(arr2)
})

test("SequentialStream::filter 2", () => {
    const arr1 = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
    const arr2 = [6, 12]

    expect(
        SequentialStream.of(arr1)
            .filter(x => x % 2 === 0)
            .filter(x => x % 3 === 0)
            .toArray()
    ).toEqual(arr2)
})

test("AsyncStream::filter 1", async () => {
    const arr1 = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
    const arr2 = [2, 4, 6, 8, 10]

    expect(
        await AsyncStream.of(arr1)
            .filter(x => x % 2 === 0)
            .toArrayAsync()
    ).toEqual(arr2)
})

test("AsyncStream::filter 2", async () => {
    const arr1 = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
    const arr2 = [6, 12]

    expect(
        await AsyncStream.of(arr1)
            .filter(x => x % 2 === 0)
            .filter(x => x % 3 === 0)
            .toArrayAsync()
    ).toEqual(arr2)
})
