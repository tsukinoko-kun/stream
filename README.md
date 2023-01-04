# stream

A library for working with streams of data.

- Operate on `Iterator`s and `AsyncIterator`s with a fluent API.
- Build pipelines of operations that can be executed in parallel.
- Use `Promise`s to wait for the result of an async pipeline.

[Istanbul ![Test Coverage](https://frank-mayer.github.io/stream/shields/coverage.svg)](https://frank-mayer.github.io/stream/coverage/lcov-report/index.html)

[![Types included](https://img.shields.io/badge/Types-included-blue?logo=typescript&style=plastic)](https://www.typescriptlang.org)

[![License: MIT](https://img.shields.io/badge/License-MIT-teal.svg?logo=law&style=plastic)](https://opensource.org/licenses/MIT)

[![Test](https://github.com/Frank-Mayer/stream/actions/workflows/test.yml/badge.svg)](https://github.com/Frank-Mayer/stream/actions/workflows/test.yml)

[![Lint](https://github.com/Frank-Mayer/stream/actions/workflows/lint.yml/badge.svg)](https://github.com/Frank-Mayer/stream/actions/workflows/lint.yml)

[![GitHub Pages](https://github.com/Frank-Mayer/stream/actions/workflows/pages.yml/badge.svg)](https://github.com/Frank-Mayer/stream/actions/workflows/pages.yml)

## How to use?

Read the [documentation](https://frank-mayer.github.io/stream/docs/index.html)!

```
npm i @frank-mayer/stream
```

```TypeScript
[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20]
    .stream()
    .map(x => x % 2 === 0 ? x * 2 : x)
    .filter(x => x > 5)
    .parallel()
    .distinct()
    .map(x => x.toString(36))
    .toArrayAsync()
    .then(console.log)
```
