const { SequentialStream, AsyncStream } = require("../")

test("SequentialStream::find", () => {
    const arr = [1, 3, 4, 5, 6, 7, 8, 9, 10]

    expect(
        SequentialStream.of(arr)
            .find((x) => x % 2 === 0)
            .unwrap()
    ).toEqual(4)

    expect(
        SequentialStream.empty().find((x) => x % 2 === 0).isNone
    ).toEqual(true)
})

test("AsyncStream::findAsync", async () => {
    const arr = [1, 3, 4, 5, 6, 7, 8, 9, 10]

    expect(
        (await AsyncStream.of(arr).findAsync((x) => x % 2 === 0)).unwrap()
    ).toEqual(4)

    expect(
        (await AsyncStream.of([]).findAsync((x) => x % 2 === 0)).isNone
    ).toEqual(true)
})
