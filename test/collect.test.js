const { SequentialStream, Collect, AsyncStream } = require("../")

test("SequentialStream::collect", () => {
    const arr = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
    const mapArr = [[1, 2], [3, 4], [5, 6], [7, 8], [9, 10]]

    expect(SequentialStream.of(arr).collect(Collect.sum)).toEqual(55)
    expect(SequentialStream.of(arr).collect(Collect.Array)).toEqual(arr)
    expect(SequentialStream.of(arr).collect(Collect.Set)).toEqual(new Set(arr))
    expect(SequentialStream.of(mapArr).collect(Collect.Map)).toEqual(new Map(mapArr))
    expect(SequentialStream.of(arr).collect(Collect.String)).toEqual(arr.join(""))
})

test("AsyncStream::collectAsync", async () => {
    const arr = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
    const mapArr = [[1, 2], [3, 4], [5, 6], [7, 8], [9, 10]]

    expect(await AsyncStream.of(arr).collectAsync(Collect.sumAsync)).toEqual(55)
    expect(await AsyncStream.of(arr).collectAsync(Collect.ArrayAsync)).toEqual(arr)
    expect(await AsyncStream.of(arr).collectAsync(Collect.SetAsync)).toEqual(new Set(arr))
    expect(await AsyncStream.of(mapArr).collectAsync(Collect.MapAsync)).toEqual(new Map(mapArr))
    expect(await AsyncStream.of(arr).collectAsync(Collect.StringAsync)).toEqual(arr.join(""))
})
