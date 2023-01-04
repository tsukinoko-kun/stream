export type SequentialCollector<T, U> = (iterable: Iterable<T>) => U
export type AsyncCollector<T, U> = (iterable: AsyncIterable<T>) => Promise<U>

export const Collect = {
    /**
     * A collector that collects the elements of the stream into an array.
    */
    Array: <T, U extends Array<T>>(stream: Iterable<T>): U => {
        return Array.from(stream) as U
    },

    /**
     * A collector that collects the elements of the async stream into an array.
     */
    ArrayAsync: async <T>(stream: AsyncIterable<T>): Promise<Array<T>> => {
        const result = new Array<Awaited<T>>()

        const iter = stream[Symbol.asyncIterator]()
        while (true) {
            const next = await iter.next()

            if (next.done) {
                return result
            }

            result.push(next.value)
        }
    },

    /**
     * A collector that collects the elements of the stream into a set.
     */
    Set: <T, U extends Set<T>>(stream: Iterable<T>): U => {
        return new Set(stream) as U
    },

    /**
     * A collector that collects the elements of the async stream into a set.
     */
    SetAsync: async <T>(stream: AsyncIterable<T>): Promise<Set<T>> => {
        const result = new Set<Awaited<T>>()

        const iter = stream[Symbol.asyncIterator]()
        while (true) {
            const next = await iter.next()

            if (next.done) {
                return result
            }

            result.add(next.value)
        }
    },

    /**
     * A collector that collects the elements of the stream into a map.
     */
    Map: <K, V, T extends [K, V], U extends Map<K, V>>(stream: Iterable<T>): U => {
        return new Map(stream) as U
    },

    /**
     * A collector that collects the elements of the async stream into a map.
     */
    MapAsync: async <K, V, T extends [K, V]>(stream: AsyncIterable<T>): Promise<Map<K, V>> => {
        const result = new Map<Awaited<K>, Awaited<V>>()

        const iter = stream[Symbol.asyncIterator]()
        while (true) {
            const next = await iter.next()

            if (next.done) {
                return result
            }

            result.set(next.value[0], next.value[1])
        }
    },

    /**
     * A collector that sums the elements of the numeric stream.
     */
    sum: <T extends number>(stream: Iterable<T>): number => {
        let sum = 0

        for (const value of stream) {
            sum += value
        }

        return sum
    },

    /**
     * A collector that sums the elements of the numeric async stream.
     */
    sumAsync: async <T extends number>(stream: AsyncIterable<T>): Promise<number> => {
        let sum = 0

        const iter = stream[Symbol.asyncIterator]()
        while (true) {
            const next = await iter.next()

            if (next.done) {
                return sum
            }

            sum += next.value
        }
    },

    /**
     * A Collector that concatenates the elements of a stream into a string.
     */
    String: <T extends string>(stream: Iterable<T>): string => {
        let concat = ""

        for (const value of stream) {
            concat += value
        }

        return concat
    },

    /**
     * A Collector that concatenates the elements of a async stream into a string.
     */
    StringAsync: async <T extends string>(stream: AsyncIterable<T>): Promise<string> => {
        let concat = ""

        const iter = stream[Symbol.asyncIterator]()
        while (true) {
            const next = await iter.next()

            if (next.done) {
                return concat
            }

            concat += next.value
        }
    }
}
