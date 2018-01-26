# Performance Plus

This is a utility and convenience library for the browser-based performance API, with support for IE8+ and zero dependencies.

The performance API allows for sub-millisecond, high-resolution timestamp measurements. This library adds some basic statistical helpers while collecting that data in slightly better style. In browsers below Internet Explorer 10, the performance API is unsupported. This library pseudo-fills that hole with plain old objects to deliver the same interface, just not at sub-millisecond resolution.

## Example Usage
~~~js
import perf from 'performance-plus';

var action = 'foobar';
perf.start(action);     // capture start timestamp
func();                 // this thing takes some time
perf.end(action);       // capture ending timestamp
// repeat the above loop a few times

console.log(`[perf] action ${action}`,
    `took ${perf.duration(action).toFixed(2)}ms`, {
    mean:         perf.mean(action),
    sdev:         perf.sdev(action),
    sampleSize:   perf.getEntriesByName(action).length,
    '95th_perc':  perf.percentile(action, 0.95)
});
~~~

~~~js
// It can also measure FPS rendering
perf.onFPS((fps, time) => {
    console.log(`It is now ${time} and we are rendering at ${fps} frames per second`);
}, 2000); // measure and call every 2 seconds
~~~

## Installation

~~~sh
$ npm install performance-plus
~~~

## Methods

Commonly used methods:

~~~js
perf.now();                     // high-res timestamp
perf.start('something');
perf.end('something');
perf.duration('something');     // in ms
perf.mean('something');         // in ms
perf.sdev('something');         // in ms
perf.getEntriesByName('something'); // all measures for this name
perf.getEntryByName('something');   // last measure for this name
~~~

[Complete methods with JSDocs](https://github.com/andjosh/performance-plus/blob/master/index.js)

## Acknowledgements

- [window.performance API docs](https://developer.mozilla.org/en-US/docs/Web/API/Performance/measure)
- [Repository for this code](https://github.com/andjosh/performance-plus)
- [NPM registry for this code](https://www.npmjs.com/package/performance-plus)
