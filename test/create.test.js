const { SequentialStream, AsyncStream } = require("../")

test("Array::stream",  () => {
    const arr = [1, 2, 3]

    expect(arr.stream().toArray()).toEqual(arr)
})

test("Set::stream",  () => {
    const arr = [1, 2, 3]
    const set = new Set(arr)

    expect(set.stream().toArray()).toEqual(arr)
})

test("Map::stream",  () => {
    const arr = [[1, 2], [3, 4], [5, 6]]
    const map = new Map(arr)

    expect(map.stream().toArray()).toEqual(arr)
})

test("String::stream",  () => {
    const str = "123"

    expect(str.stream().toArray()).toEqual(["1", "2", "3"])
})

test("SequentialStream.of", () => {
    const arr = [1, 2, 3]
    expect(SequentialStream.of(arr).toArray()).toEqual(arr)

    const set = new Set(arr)
    expect(SequentialStream.of(set).toArray()).toEqual(arr)

    const mapArr = [[1, 2], [3, 4], [5, 6]]
    const map = new Map(mapArr)
    expect(SequentialStream.of(map).toArray()).toEqual(mapArr)

    const str = "123"
    expect(SequentialStream.of(str).toArray()).toEqual(["1", "2", "3"])
})

test("AsyncStream.of", async () => {
    const arr = [1, 2, 3]
    expect((await AsyncStream.of(arr).toArrayAsync())).toEqual(arr)

    const asyncIterable = {
        [Symbol.asyncIterator]() {
            return {
                i: 0,
                next() {
                    return Promise.resolve({
                        value: this.i++,
                        done: this.i > 3
                    })
                }
            }
        }
    }

    expect((await AsyncStream.of(asyncIterable).toArrayAsync())).toEqual([0, 1, 2])
})

test("SequentialStream.empty", () => {
    const arr = []

    expect(SequentialStream.empty().toArray()).toEqual(arr)
})

test("SequentialStream.interval", () => {
    expect(SequentialStream.interval(1, 1, 10).toArray()).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
    expect(SequentialStream.interval(12, -2, 3).toArray()).toEqual([12, 10, 8, 6, 4])

    expect(() => SequentialStream.interval(1, 0, 10)).toThrow()
    expect(() => SequentialStream.interval(10, 1, 0)).toThrow()
    expect(() => SequentialStream.interval(1, -3, 10)).toThrow()
})
