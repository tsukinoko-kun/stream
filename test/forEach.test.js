const { SequentialStream, AsyncStream } = require("../")

test("SequentialStream::forEach", () => {
    const arr1 = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
    const arr2 = []

    SequentialStream.of(arr1).forEach(x => arr2.push(x))

    expect(arr2).toEqual(arr1)
})

test("SequentialStream loop", () => {
    const arr1 = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
    const arr2 = []

    for (const x of SequentialStream.of(arr1)) {
        arr2.push(x)
    }

    expect(arr2).toEqual(arr1)
})

test("AsyncStream::forEachAsync return primitive", async () => {
    const arr1 = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
    const arr2 = []

    await AsyncStream.of(arr1).forEachAsync(x => arr2.push(x))

    expect(arr2).toEqual(arr1)
})

test("AsyncStream::forEachAsync return void", async () => {
    const arr1 = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
    const arr2 = []

    await AsyncStream.of(arr1).forEachAsync(x => {
        arr2.push(x)
    })

    expect(arr2).toEqual(arr1)
})

test("AsyncStream::forEachAsync return Promise", async () => {
    const arr1 = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
    const arr2 = []

    await AsyncStream.of(arr1).forEachAsync(async (x) => {
        await new Promise(resolve => setTimeout(resolve, Math.random() * 1000))
        arr2.push(x)
    })

    expect(arr2.sort()).toEqual(arr1.sort())
})

test("AsyncStream loop", async () => {
    const arr1 = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
    const arr2 = []

    for await (const x of AsyncStream.of(arr1)) {
        arr2.push(x)
    }

    expect(arr2.sort()).toEqual(arr1.sort())
})
