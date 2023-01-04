export interface IStream<T> {
    /**
     * Calls a defined mapper function on each element of the {@link IStream}, and returns a new {@link IStream} that contains the results.
     * @param mapper A function that accepts an element of the {@link IStream} and returns a value.
     * @returns A new {@link IStream} that contains the results of the mapper function.
     */
    map<U>(mapper: (value: T, index: number) => U): IStream<U>;

    /**
     * Returns a new {@link IStream} containing the elements of this {@link IStream} that meet the condition specified in a callback function.
     * @param predicate The predicate function that is called one time for each element in the {@link IStream} to determine if the element should be included in the new {@link IStream}.
     */
    filter(predicate: (value: T, index: number) => boolean): IStream<T>;

    /**
     * Returns a new {@link IStream} that contains only unique elements from this {@link IStream}.
     */
    distinct(): IStream<T>
}
