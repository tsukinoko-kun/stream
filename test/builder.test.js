const { AsyncStream } = require("../")

test("AsyncStream.builder", async () => {
    const [stream, yielder, end] = AsyncStream.builder()

    const arr1 = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]

    for (const x of arr1) {
        yielder(x)
    }

    end()

    expect((await stream.toArrayAsync()).sort()).toEqual(arr1.sort())
})
