import type { IStream } from "./IStream"
import { Option } from "@frank-mayer/opsult"
import { AsyncStream } from "./AsyncStream"
import type { SequentialCollector } from "./Collector"

export class SequentialStream<T> implements Iterable<T>, IStream<T> {
    /** @internal */
    private readonly iterable: Iterable<T>

    protected constructor(iterable: Iterable<T>) {
        this.iterable = iterable
    }

    /**
     * Creates a stream over the elements of the given {@link Iterable}.
     */
    public static of<T>(iterable: Iterable<T>): SequentialStream<T> {
        return new SequentialStream(iterable)
    }

    /**
     * Creates a empty stream.
     */
    public static empty<T>(): SequentialStream<T> {
        return new SequentialStream({
            [Symbol.iterator]: () => {
                return {
                    next(): IteratorResult<T> {
                        return {
                            done: true,
                            value: undefined,
                        }
                    }
                }
            }
        })
    }

    /**
     * Creates a stream using the given interval.
     */
    public static interval(start: number, stepSize: number, end: number): SequentialStream<number> {
        if (stepSize === 0) {
            throw new Error("Step size must not be zero.")
        }

        if (start < end && stepSize < 0) {
            throw new Error("Step size must be positive.")
        }

        if (start > end && stepSize > 0) {
            throw new Error("Step size must be negative.")
        }

        let i = start

        const nextFun = (start < end && stepSize > 0)
            ? (): IteratorResult<number> => {
                if (i > end) {
                    return {
                        done: true,
                        value: undefined,
                    }
                }

                const value = i

                i += stepSize

                return {
                    done: false,
                    value,
                }
            }
            : (): IteratorResult<number> => {
                if (i < end) {
                    return {
                        done: true,
                        value: undefined,
                    }
                }

                const value = i

                i += stepSize

                return {
                    done: false,
                    value,
                }
            }

        return new SequentialStream({
            [Symbol.iterator]: () => {
                return {
                    next: nextFun
                }
            }
        })
    }

    /**
     * Calls a defined mapper function on each element of the {@link SequentialStream}, and returns a new {@link SequentialStream} that contains the results.
     * @param mapper A function that accepts an element of the {@link SequentialStream} and returns a value.
     * @returns A new {@link SequentialStream} that contains the results of the mapper function.
     */
    public map<U>(mapper: (value: T, index: number) => U): SequentialStream<U> {
        return new SequentialStream({
            [Symbol.iterator]: () => {
                const iter = this.iterable[Symbol.iterator]()
                let i = 0

                return {
                    next(): IteratorResult<U> {
                        const result = iter.next()

                        if (result.done) {
                            return {
                                done: true,
                                value: undefined,
                            }
                        }

                        return {
                            done: false,
                            value: mapper(result.value, i++),
                        }
                    }
                }
            }
        })
    }

    /**
     * Returns a new {@link SequentialStream} containing the elements of this {@link SequentialStream} that meet the condition specified in a callback function.
     * @param predicate The predicate function that is called one time for each element in the {@link SequentialStream} to determine if the element should be included in the new {@link SequentialStream}.
     */
    public filter(predicate: (value: T, index: number) => boolean): SequentialStream<T> {
        return new SequentialStream({
            [Symbol.iterator]: () => {
                const iter = this.iterable[Symbol.iterator]()
                let i = 0
                return {
                    next(): IteratorResult<T> {
                        while (true) {
                            const result = iter.next()

                            if (result.done) {
                                return {
                                    done: true,
                                    value: undefined,
                                }
                            }

                            if (predicate(result.value, i++)) {
                                return {
                                    done: false,
                                    value: result.value,
                                }
                            }
                        }
                    }
                }
            }
        })
    }

    /**
     * Calls the specified reducer function for all the elements in this {@link SequentialStream}. The return value of the reducer function is the accumulated result, and is provided as an argument in the next call to the reducer function.
     * @param reducer The reduce function calls the callbackfn function one time for each element in the {@link SequentialStream}.
     */
    public reduce(reducer: (accumulator: T, value: T) => T): Option<T>
    /**
     * Calls the specified reducer function for all the elements in this {@link SequentialStream}. The return value of the reducer function is the accumulated result, and is provided as an argument in the next call to the reducer function.
     * @param reducer The reduce function calls the callbackfn function one time for each element in the {@link SequentialStream}.
     * @param initialValue This is used as the initial value to start the accumulation. The first call to the callbackfn function provides this value as an argument instead of a {@link SequentialStream} value.
     */
    public reduce<U>(reducer: (accumulator: U, value: T) => U, initialValue: U): U
    public reduce<U>(reducer: (accumulator: U, value: T) => U, initialValue?: U): U | Option<U> {
        if (initialValue === undefined) {
            return this.reduceOption(reducer as any) as unknown as Option<U>
        }

        return this.reduceValue(reducer, initialValue)
    }

    /** @internal */
    private reduceOption<U extends T = T>(reducer: (accumulator: U, value: T) => U): Option<U> {
        const iter = this.iterable[Symbol.iterator]()
        const first = iter.next()

        if (first.done) {
            return Option.None()
        }

        let acc = first.value

        while (true) {
            const next = iter.next()

            if (next.done) {
                break
            }

            acc = reducer(acc, next.value)
        }

        return Option.Some(acc)
    }

    /** @internal */
    private reduceValue<U = T>(reducer: (accumulator: U, value: T) => U, initialValue: U): U {
        let acc = initialValue
        const iter = this.iterable[Symbol.iterator]()

        while (true) {
            const next = iter.next()

            if (next.done) {
                return acc
            }

            acc = reducer(acc, next.value)
        }
    }

    /**
     * Collects all elements of this {@link SequentialCollector} into an `Array`.
     */
    public toArray(): Array<T> {
        return Array.from(this)
    }

    /**
     * Collects all elements of this stream using a {@link SequentialCollector}.
     */
    public collect<U>(collector: SequentialCollector<T, U>): U {
        return collector(this)
    }

    /**
     * Returns a new {@link SequentialStream} that contains only unique elements from this {@link SequentialStream}.
     */
    public distinct(): SequentialStream<T> {
        return new SequentialStream({
            [Symbol.iterator]: () => {
                const iter = this.iterable[Symbol.iterator]()
                const seen = new Set<T>()

                return {
                    next(): IteratorResult<T> {
                        while (true) {
                            const next = iter.next()

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
     * Creates a new {@link SequentialStream} that contains the elements of this {@link SequentialStream}.
     *
     * @warning This method will not consume the {@link SequentialStream}s iterator but if you want to convert the {@link AsyncStream} back to a {@link SequentialStream} the iterator will be consumed.
     */
    public parallel(): AsyncStream<T> {
        return AsyncStream.of(this.iterable)
    }

    [Symbol.iterator](): Iterator<T> {
        return this.iterable[Symbol.iterator]()
    }

    /**
     * Performs the specified action for each element in an {@link SequentialStream}.
     * @param callbackfn forEachAsync calls the callbackfn function one time for each element in the {@link SequentialStream}.
     */
    public forEach(callbackfn: (value: T, index: number) => void): void {
        const iter = this.iterable[Symbol.iterator]()
        let i = 0
        while (true) {
            const next = iter.next()

            if (next.done) {
                return
            }

            callbackfn(next.value, i++)
        }
    }

    /**
     * Checks if there is at least one truthy element in this {@link SequentialStream}.
     */
    public some(): boolean
    /**
     * Checks if there is at least one element in this {@link SequentialStream} that matches the specified predicate.
     */
    public some(predicate: (value: T) => boolean): boolean
    public some(predicate: ((value: T) => boolean) = Boolean): boolean {
        const iter = this.iterable[Symbol.iterator]()
        while (true) {
            const next = iter.next()

            if (next.done) {
                return false
            }

            if (predicate(next.value)) {
                return true
            }
        }
    }

    /**
     * Determines whether all the elements of this {@link SequentialStream} satisfy the specified test.
     */
    public every(predicate: (value: T) => boolean): boolean {
        const iter = this.iterable[Symbol.iterator]()
        while (true) {
            const next = iter.next()

            if (next.done) {
                return true
            }

            if (!predicate(next.value)) {
                return false
            }
        }
    }

    /**
     * Returns the first element of this {@link SequentialStream}.
     */
    public find(predicate: (value: T) => boolean): Option<T> {
        const iter = this.iterable[Symbol.iterator]()

        while (true) {
            const next = iter.next()

            if (next.done) {
                return Option.None()
            }

            if (predicate(next.value)) {
                return Option.Some(next.value)
            }
        }
    }

    /**
     * Combines this {@link SequentialStream} with all other {@link SequentialStream}s into a new {@link SequentialStream}.
     */
    public concat<O = T>(...streams: Array<SequentialStream<O>>): SequentialStream<T|O> {
        return new SequentialStream({
            [Symbol.iterator]: () => {
                const iterators = new Array<Iterator<T|O>>(streams.length + 1)
                iterators[0] = (this.iterable[Symbol.iterator]())
                for (let i = 0; i < streams.length; i++) {
                    iterators[i+1] = streams[i].iterable[Symbol.iterator]()
                }

                let i = 0
                let currentIterator = iterators[i]

                return {
                    next(): IteratorResult<T> {
                        while (true) {
                            if (!currentIterator) {
                                return {
                                    done: true,
                                    value: undefined,
                                }
                            }

                            const next = currentIterator.next()

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
     * Returns a new {@link SequentialStream} that contains the elements of this {@link SequentialStream} in a sorted order.
     * @param compareFn A function used to determine the order of the elements. It is expected to return a negative value if the first argument is less than the second argument, zero if they're equal, and a positive value otherwise. If omitted, the elements are sorted in ascending, ASCII character order.
     *
     * @warning This method will consume the {@link SequentialStream}s iterator.
     */
    public sort(compareFn?: (a: T, b: T) => number): SequentialStream<T> {
        return new SequentialStream({
            [Symbol.iterator]: () => {
                const array = Array.from(this.iterable)
                array.sort(compareFn)

                return array[Symbol.iterator]()
            }
        })
    }
}

globalThis.SequentialStream = SequentialStream
