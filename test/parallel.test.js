const { SequentialStream } = require("../")

test("SequentialStream::parallel", async () => {
    const arr = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]

    expect(await SequentialStream.of(arr).parallel().toArrayAsync()).toEqual(arr)
})
