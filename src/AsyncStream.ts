import type { IStream } from "./IStream"
import { Option } from "@frank-mayer/opsult"
import { AsyncCollector } from "./Collector"
import { SequentialStream } from "./SequentialStream"

export class AsyncStream<T> implements AsyncIterable<T>, IStream<T> {
    /** @internal */
    private readonly iterable: AsyncIterable<T>

    protected constructor(iterable: AsyncIterable<T>) {
        this.iterable = iterable
    }

    /**
     * Calls a defined mapper function on each element of the {@link AsyncStream}, and returns a new {@link AsyncStream} that contains the results.
     * @param mapper A function that accepts an element of the {@link AsyncStream} and returns a value.
     * @returns A new {@link AsyncStream} that contains the results of the mapper function.
     */
    public map<U>(mapper: (value: T, index: number) => U): AsyncStream<U> {
        return new AsyncStream({
            [Symbol.asyncIterator]: () => {
                const it = this.iterable[Symbol.asyncIterator]()
                let index = 0
                return {
                    next(): Promise<IteratorResult<U>> {
                        return it.next().then((next) => {
                            if (next.done) {
                                return next
                            }
                            return {
                                done: false,
                                value: mapper(next.value, index++)
                            }
                        })
                    }
                }
            }
        })
    }

    /**
     * Returns a new {@link AsyncStream} containing the elements of this {@link AsyncStream} that meet the condition specified in a callback function.
     * @param predicate The predicate function that is called one time for each element in the {@link AsyncStream} to determine if the element should be included in the new {@link AsyncStream}.
     */
    public filter(predicate: (value: T, index: number) => boolean): AsyncStream<T> {
        return new AsyncStream({
            [Symbol.asyncIterator]: () => {
                const it = this.iterable[Symbol.asyncIterator]()
                let index = 0
                return {
                    next(): Promise<IteratorResult<T>> {
                        return it.next().then((next) => {
                            if (next.done) {
                                return next
                            }
                            if (predicate(next.value, index++)) {
                                return next
                            }
                            return this.next()
                        })
                    }
                }
            }
        })
    }

    /**
     * Calls the specified reducer function for all the elements in this {@link AsyncStream}. The return value of the reducer function is the accumulated result, and is provided as an argument in the next call to the reducer function.
     * @param reducer The reduce function calls the callbackfn function one time for each element in the {@link AsyncStream}.
     */
    public async reduceAsync(reducer: (accumulator: T, value: T) => T): Promise<Option<T>>
    /**
     * Calls the specified reducer function for all the elements in this {@link AsyncStream}. The return value of the reducer function is the accumulated result, and is provided as an argument in the next call to the reducer function.
     * @param reducer The reduce function calls the callbackfn function one time for each element in the {@link AsyncStream}.
     * @param initialValue This is used as the initial value to start the accumulation. The first call to the callbackfn function provides this value as an argument instead of a {@link AsyncStream} value.
     */
    public async reduceAsync<U>(reducer: (accumulator: U, value: T) => U, initialValue: U): Promise<U>
    public async reduceAsync<U>(reducer: (accumulator: U, value: T) => U, initialValue?: U): Promise<U | Option<U>> {
        if (initialValue === undefined) {
            return await this.reduceOptionAsync(reducer as any) as unknown as Promise<U>
        }

        return await this.reduceValueAsync(reducer, initialValue)
    }
    /** @internal */
    private async reduceOptionAsync(reducer: (accumulator: T, value: T) => T): Promise<Option<T>> {
        const iter = this.iterable[Symbol.asyncIterator]()
        const first = await iter.next()

        if (first.done) {
            return Option.None()
        }

        let acc = first.value

        while (true) {
            const next = await iter.next()

            if (next.done) {
                return Option.Some(acc)
            }

            acc = reducer(acc, next.value)
        }
    }

    /** @internal */
    private async reduceValueAsync<U = T>(reducer: (accumulator: U, value: T) => U, initialValue: U): Promise<U> {
        let acc = initialValue
        const iter = this.iterable[Symbol.asyncIterator]()

        while (true) {
            const next = await iter.next()

            if (next.done) {
                return acc
            }

            acc = reducer(acc, next.value)
        }
    }

    /**
     * Collects all elements of this {@link AsyncStream} into an `Array`.
     */
    public async toArrayAsync(): Promise<Array<T>> {
        const iter = this.iterable[Symbol.asyncIterator]()

        const result = new Array<T>()

        while (true) {
            const next = await iter.next()

            if (next.done) {
                return result
            }

            result.push(next.value)
        }
    }

    /**
     * Collects all elements of this stream using an {@link AsyncCollector}.
     */
    public async collectAsync<U>(collector: AsyncCollector<T, U>): Promise<U> {
        return await collector(this.iterable)
    }

    /**
     * Returns a new {@link AsyncStream} that contains only unique elements from this {@link AsyncStream}.
     */
    public distinct(): AsyncStream<T> {
        return new AsyncStream({
            [Symbol.asyncIterator]: () => {
                const iter = this.iterable[Symbol.asyncIterator]()
                const seen = new Set<T>()

                return {
                    // eslint-disable-next-line no-restricted-syntax
                    async next(): Promise<IteratorResult<T>> {
                        while (true) {
                            const next = await iter.next()

                            if (next.done) {
                                return {
                                    done: true,
                                    value: undefined,
                                }
                            }

                            if (seen.has(next.value)) {
                                continue
                            }

                            seen.add(next.value)

                            return {
                                done: false,
                                value: next.value,
                            }
                        }
                    }
                }
            }
        })
    }

    /**
     * Converts this async stream to a {@link SequentialStream}.
     *
     * @returns A Promise to a {@link SequentialStream}.
    *
     * @warning This method will load all elements of this {@link AsyncStream} into memory.
     */
    public async sequentialAsync() {
        return SequentialStream.of(await this.toArrayAsync())
    }

    /**
     * Performs the specified action for each element in an {@link AsyncStream}.
     * @param callbackfn forEachAsync calls the callbackfn function one time for each element in the {@link AsyncStream}.
     * @returns A Promise that resolves when the forEachAsync operation is complete.
     */
    public async forEachAsync(callbackfn: (value: T, index: number) => void | Promise<void>): Promise<void> {
        const iter = this.iterable[Symbol.asyncIterator]()
        let index = 0
        const promises = new Array<Promise<void>>()

        while (true) {
            const next = await iter.next()

            if (next.done) {
                if (promises.length === 0) {
                    return
                }

                await Promise.all(promises)
                return
            }

            const maybeProm = callbackfn(next.value, index++)
            if (maybeProm instanceof Promise) {
                promises.push(maybeProm)
            }
        }
    }

    /**
     * Checks if there is at least one truthy element in this {@link AsyncStream}.
     */
    public async someAsync(): Promise<boolean>
    /**
     * Checks if there is at least one element in this {@link AsyncStream} that matches the specified predicate.
     */
    public async someAsync(predicate: (value: T) => boolean): Promise<boolean>
    public async someAsync(predicate: (value: T) => boolean = Boolean): Promise<boolean> {
        const iter = this.iterable[Symbol.asyncIterator]()
        while (true) {
            const next = await iter.next()

            if (next.done) {
                return false
            }

            if (predicate(next.value)) {
                return true
            }
        }
    }

    /**
     * Determines whether all the elements of this {@link AsyncStream} satisfy the specified test.
     */
    public async everyAsync(predicate: (value: T) => boolean): Promise<boolean> {
        const iter = this.iterable[Symbol.asyncIterator]()
        while (true) {
            const next = await iter.next()

            if (next.done) {
                return true
            }

            if (!predicate(next.value)) {
                return false
            }
        }
    }

    /**
     * Creates a new empty {@link AsyncStream}.
     */
    public static empty<T>(): AsyncStream<T> {
        return new AsyncStream({
            [Symbol.asyncIterator]: () => {
                return {
                    next(): Promise<IteratorResult<T>> {
                        return Promise.resolve({
                            done: true,
                            value: undefined,
                        })
                    }
                }
            }
        })
    }

    private static endOfStream = Symbol("endOfStream")

    /**
     * Creates a new {@link AsyncStream} whose elements are generated by a yielder function.
     *
     * @returns A tuple containing the {@link AsyncStream}, a function to yield new elements and a function to end the stream.
     */
    public static builder<T>(): [AsyncStream<T>, (value: T | PromiseLike<T>) => void, () => void] {
        type QueryEntry = Promise<T> & { resolve: (value: typeof AsyncStream["endOfStream"] | T | PromiseLike<T>) => void }

        const newQueueEntry = (): Readonly<QueryEntry> => {
            let fn: (value: T | PromiseLike<T>) => void | undefined = undefined

            const prom = new Promise<T>((resolve) => {
                fn = resolve
            }) as QueryEntry

            prom.resolve = fn

            return prom
        }

        const queue = new Array(newQueueEntry())

        const stream = new AsyncStream({
            [Symbol.asyncIterator]: () => {
                return {
                    // eslint-disable-next-line no-restricted-syntax
                    async next(): Promise<IteratorResult<T>> {
                        const next = await queue[0]

                        queue.shift()

                        if (next === AsyncStream.endOfStream) {
                            return {
                                done: true,
                                value: undefined,
                            }
                        }

                        return {
                            done: false,
                            value: next,
                        }
                    }
                }
            }
        })

        return [stream, (value: T | PromiseLike<T>) => {
            queue[queue.length - 1].resolve(value)

            queue.push(newQueueEntry())
        }, () => {
            queue[queue.length - 1].resolve(AsyncStream.endOfStream)
        }]
    }

    /**
     * Creates a new {@link AsyncStream} from the given `Iterable`.
     */
    public static of<T>(iterable: Iterable<T>): AsyncStream<T>
    /**
     * Creates a new {@link AsyncStream} from the given `AsyncIterable`.
     */
    public static of<T>(iterable: AsyncIterable<T>): AsyncStream<T>
    public static of<T>(iterable: AsyncIterable<T> | Iterable<T>): AsyncStream<T> {
        if (Symbol.asyncIterator in iterable) {
            return new AsyncStream(iterable)
        }

        return new AsyncStream({
            [Symbol.asyncIterator]: () => {
                const it = iterable[Symbol.iterator]()
                return {
                    next(): Promise<IteratorResult<T>> {
                        const next = it.next()
                        return Promise.resolve(next)
                    }
                }
            }
        })
    }

    /**
     * Returns the first element of this {@link AsyncStream}.
     */
    public async findAsync(predicate: (value: T) => boolean): Promise<Option<T>> {
        const iter = this.iterable[Symbol.asyncIterator]()

        while (true) {
            const next = await iter.next()

            if (next.done) {
                return Option.None()
            }

            if (predicate(next.value)) {
                return Option.Some(next.value)
            }
        }
    }

    /**
     * Combines this {@link AsyncStream} with all other {@link AsyncStream}s into a new {@link AsyncStream}.
     */
    public concat<O = T>(...streams: Array<AsyncStream<O>>): AsyncStream<T|O> {
        return new AsyncStream({
            [Symbol.asyncIterator]: () => {
                const iterators = new Array<AsyncIterator<T|O>>(streams.length + 1)
                iterators[0] = (this.iterable[Symbol.asyncIterator]())
                for (let i = 0; i < streams.length; i++) {
                    iterators[i+1] = streams[i].iterable[Symbol.asyncIterator]()
                }

                let i = 0
                let currentIterator = iterators[i]

                return {
                    // eslint-disable-next-line no-restricted-syntax
                    async next(): Promise<IteratorResult<T>> {
                        while (true) {
                            const next = await currentIterator.next()

                            if (next.done) {
                                currentIterator = iterators[++i]

                                if (currentIterator) {
                                    continue
                                }

                                return {
                                    done: true,
                                    value: undefined,
                                }
                            }

                            return {
                                done: false,
                                value: next.value,
                            }
                        }
                    }
                }
            }
        })
    }

    /**
     * Returns a new {@link AsyncStream} that contains the elements of this {@link AsyncStream} in a sorted order.
     * @param compareFn A function used to determine the order of the elements. It is expected to return a negative value if the first argument is less than the second argument, zero if they're equal, and a positive value otherwise. If omitted, the elements are sorted in ascending, ASCII character order.
     *
     * @warning This method will load all elements of this {@link AsyncStream} into memory.
     */
    public sort(compareFn?: (a: T, b: T) => number): AsyncStream<T> {
        return new AsyncStream({
            // eslint-disable-next-line no-restricted-syntax
            [Symbol.asyncIterator]: () => {
                const iterPromise = new Promise<AsyncIterator<T, any, undefined>>((resolve, reject) => {
                    this.toArrayAsync()
                        .then((arr) => {
                            arr.sort(compareFn)
                            const iter = arr[Symbol.iterator]()
                            resolve({
                                next(): Promise<IteratorResult<T>> {
                                    return Promise.resolve(iter.next())
                                }
                            })
                        })
                        /* istanbul ignore next */
                        .catch((err) => {
                            /* istanbul ignore next */
                            reject(err)
                        })
                })

                let iter: AsyncIterator<T, any, undefined> | undefined = undefined

                return {
                    // eslint-disable-next-line no-restricted-syntax
                    async next(): Promise<IteratorResult<T>> {
                        return Promise.resolve((iter ||= (await iterPromise)).next())
                    }
                }
            }
        })
    }

    [Symbol.asyncIterator](): AsyncIterator<T, any, undefined> {
        return this.iterable[Symbol.asyncIterator]()
    }
}

globalThis.AsyncStream = AsyncStream
