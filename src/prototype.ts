/* eslint-disable unused-imports/no-unused-vars */

import { SequentialStream } from "./SequentialStream"

declare global {
    interface Array<T> {
        /**
         * Creates a stream over the elements of this array.
         */
        stream(): SequentialStream<T>

    }

    interface Set<T> {
        /**
         * Creates a stream over the elements of this set.
         */
        stream(): SequentialStream<T>
    }

    interface Map<K, V> {
        /**
         * Creates a stream over the entries of this map.
         */
        stream(): SequentialStream<[K, V]>
    }

    interface String {
        /**
         * Creates a stream over the characters of this string.
         */
        stream(): SequentialStream<string>
    }
}

Array.prototype.stream = function<T>(): SequentialStream<T> {
    return SequentialStream.of<T>(this)
}

Set.prototype.stream = function<T>(): SequentialStream<T> {
    return SequentialStream.of<T>(this)
}

Map.prototype.stream = function<K, V>(): SequentialStream<[K, V]> {
    return SequentialStream.of<[K, V]>(this)
}

String.prototype.stream = function(): SequentialStream<string> {
    return SequentialStream.of<string>(this)
}

export {}
