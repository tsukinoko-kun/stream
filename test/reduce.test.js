const { SequentialStream, AsyncStream } = require("../")

test("SequentialStream::reduce", () => {
    const arr = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
    const sum = 55
    const product = 3628800
    const concat = "12345678910"

    expect(
        SequentialStream.of(arr)
            .reduce((a, b) => a + b, 0)
    ).toEqual(sum)

    expect(
        SequentialStream.of(arr)
            .reduce((a, b) => a * b, 1)
    ).toEqual(product)

    expect(
        SequentialStream.of(arr)
            .reduce((a, b) => a + b, "")
    ).toEqual(concat)

    expect(
        SequentialStream.of(arr)
            .reduce((a, b) => a + b)
            .unwrap()
    ).toEqual(sum)

    expect(SequentialStream.empty()
        .reduce((a, b) => a + b).isNone)
        .toEqual(true)
})

test("AsyncStream::reduceAsync", async () => {
    const arr = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
    const sum = 55
    const product = 3628800
    const concat = "12345678910"

    expect(
        await AsyncStream.of(arr)
            .reduceAsync((a, b) => a + b, 0)
    ).toEqual(sum)

    expect(
        await AsyncStream.of(arr)
            .reduceAsync((a, b) => a * b, 1)
    ).toEqual(product)

    expect(
        await AsyncStream.of(arr)
            .reduceAsync((a, b) => a + b, "")
    ).toEqual(concat)

    expect(
        (await AsyncStream.of(arr)
            .reduceAsync((a, b) => a + b)
        )
            .unwrap()
    ).toEqual(sum)

    expect((await AsyncStream.empty()
        .reduceAsync((a, b) => a + b)).isNone
    ).toEqual(true)
})
