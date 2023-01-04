const { SequentialStream, AsyncStream } = require("../")

test("SequentialStream::map primitive", () => {
    const streamStart = SequentialStream.of([1, 2, 3])
    const stream1 = streamStart.map(x => x * 4)
    const stream2 = stream1.map(x => x.toString(16))
    const arrEnd = stream2.toArray()
    const arrTest = ["4", "8", "c"]

    expect(arrEnd).toEqual(arrTest)
})

test("SequentialStream::map BigInt", () => {
    const arr1 = SequentialStream.of([1, 2, 3])
    const arr2 = [1n, 2n, 3n]

    expect(
        arr1
            .map(x => BigInt(x))
            .toArray()
    ).toEqual(arr2)
})

test("AsyncStream::map primitive", async () => {
    const arr = [1, 2, 3]
    const arrTest = ["4", "8", "c"]

    expect(
        await AsyncStream.of(arr)
            .map(x => x * 4)
            .map(x => x.toString(16))
            .toArrayAsync()
    ).toEqual(arrTest)
})

test("AsyncStream::map BigInt", async () => {
    const arr1 = [1, 2, 3]
    const arr2 = [1n, 2n, 3n]

    expect(
        await AsyncStream.of(arr1)
            .map(x => BigInt(x))
            .toArrayAsync()
    ).toEqual(arr2)
})
