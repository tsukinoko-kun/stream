const { SequentialStream, AsyncStream } = require("../")

const checkFn1 = (x) => x > 0
const checkFn2 = (x) => x < 0

test("SequentialStream::every", () => {
    expect(SequentialStream.empty().every(checkFn1)).toEqual(true)
    expect(SequentialStream.empty().every(checkFn2)).toEqual(true)
    expect(SequentialStream.of([1, 2, 3]).some(checkFn1)).toEqual(true)
    expect(SequentialStream.of([1, 2, 3]).some(checkFn2)).toEqual(false)
    expect(SequentialStream.of([1, 2, 3]).some(() => false)).toEqual(false)
    expect(SequentialStream.of([1, 2, 3]).some(() => true)).toEqual(true)
})

test("AsyncStream::everyAsync", async () => {
    expect(await AsyncStream.empty().everyAsync(checkFn1)).toEqual(true)
    expect(await AsyncStream.empty().everyAsync(checkFn2)).toEqual(true)
    expect(await AsyncStream.of([1, 2, 3]).everyAsync(checkFn1)).toEqual(true)
    expect(await AsyncStream.of([1, 2, 3]).everyAsync(checkFn2)).toEqual(false)
})
