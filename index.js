export const hasPerf     = typeof self !== 'undefined' && self.performance;
export const hasPerfNow  = hasPerf && self.performance.now;
export const hasPerfMark = hasPerf && self.performance.mark;
var marks    = {};
var measures = {};

function mean(values) {
    return values.reduce((acc, val) => {
        return acc + val;
    }, 0) / values.length;
}

export const perf = {
    /**
     * Get high-resolution timestamp, when unavailable get ms timestamp
     *
     * @access public
     * @returns {Number} ms
     */
    now: () => {
        if (!hasPerfNow)
            return (new Date()).getTime();
        return self.performance.now();
    },
    /**
     * Create PerformanceMark
     *
     * @access public
     * @param {String} name='untitled'
     * @returns {PerformanceMark|Number}
     */
    mark: (name = 'untitled') => {
        if (hasPerfMark) {
            return self.performance.mark(name);
        }
        return marks[name] = perf.now();
    },
    /**
     * Create PerformanceMeasure between two marks
     *
     * @access public
     * @param {String} name='untitled'
     * @param {String} start='untitled_start'
     * @param {String} end='untitled_end'
     * @returns {PerformanceMeasure|undefined}
     */
    measure: (name = 'untitled', start = 'untitled_start', end = 'untitled_end') => {
        if (hasPerfMark) {
            return self.performance.measure(name, start, end);
        }
        measures[name] = measures[name] || [];
        measures[name].push({
            duration:   marks[end] - marks[start],
            start:      marks[start],
            end:        marks[end],
        });
    },
    /**
     * Remove all marks with name
     *
     * @access public
     * @param {String} name
     */
    clearMarks: (name) => {
        if (hasPerfMark)
            return self.performance.clearMarks(name);
        if (name) {
            delete marks[name];
            return;
        }
        marks = {};
    },
    /**
     * Remove all measures with name
     *
     * @access public
     * @param {String} name
     */
    clearMeasures: (name) => {
        if (hasPerfMark)
            return self.performance.clearMeasures(name);
        if (name) {
            delete measures[name];
            return;
        }
        measures = {};
    },
    /**
     * Return performance entries by name
     *
     * @access public
     * @param {String} name='untitled'
     * @returns {PerformanceEntry[]|PerformanceMeasure[]}
     */
    getEntriesByName: (name = 'untitled') => {
        if (hasPerfMark) {
            return self.performance.getEntriesByName(name);
        }
        return measures[name] || [];
    },
    /**
     * Return last entry by name
     *
     * @access public
     * @param {String} name='untitled'
     * @returns {PerformanceEntry|PerformanceMark}
     */
    getEntryByName: (name = 'untitled') => {
        const entries = perf.getEntriesByName(name);
        return entries[entries.length - 1];
    },
    /**
     * Create starting PerformanceMark for measure of name
     *
     * @access public
     * @param {String} name='untitled'
     * @returns {PerformanceMark}
     */
    start: (name = 'untitled') => {
        return perf.mark(name + '_start');
    },
    /**
     * Create ending PerformanceMark and PerformanceMeasure of name
     *
     * @access public
     * @param {String} name='untitled'
     * @returns {PerformanceMark}
     */
    end: (name = 'untitled') => {
        const e = perf.mark(name + '_end');
        perf.measure(name, name + '_start', name + '_end');
        return e;
    },
    /**
     * Return last duration of PerformanceMeasure by name
     *
     * @access public
     * @param {String} name='untitled'
     * @returns {Number}
     */
    duration: (name = 'untitled') => {
        return (perf.getEntryByName(name) || {}).duration;
    },
    /**
     * Calculate mean value for PerformanceMeasure durations by name
     *
     * @access public
     * @param {String} name='untitled'
     * @returns {Number}
     */
    mean: (name = 'untitled') => {
        return mean(perf.getEntriesByName(name).map(d => d.duration));
    },
    /**
     * Calculate standard deviation from mean
     * for PerformanceMeasure durations by name
     *
     * @access public
     * @param {String} name='untitled'
     * @returns {Number}
     */
    sdev: (name = 'untitled') => {
        const entries = perf.getEntriesByName(name).map(d => d.duration);
        const avg = mean(entries);
        const squareDiffs = entries.map((value) => {
            const diff = value - avg;
            return diff * diff;
        });
        return Math.sqrt(mean(squareDiffs));
    },
    /**
     * Calculate value at percentile
     * for PerformanceMeasure durations by name
     *
     * @access public
     * @param {String} name='untitled'
     * @param {Number} percent=0 between 0 and 1
     * @returns {Number}
     */
    percentile: (name = 'untitled', percent = 0) => {
        const values = perf.getEntriesByName(name).map(d => d.duration).sort();
        const len = values.length;
        const index = Math.min(len - 1, Math.max(0, Math.floor(len * percent)));
        return values[index];
    },
    /**
     * Execute a callback on an interval,
     * calling with current frames per second rendering
     *
     * @access public
     * @param {Function} cb handling (FPS, timestamp)
     * @param {Number} interval=1000 ms
     */
    onFPS: (cb, interval = 1000) => {
        var prevTime = perf.now();
        var time     = prevTime;
        var frames   = 0;
        var fps      = 0;
        var scalar   = 1000 / interval;
        (function iterate () {
            frames++;
            time = perf.now();
            if (time >= (prevTime + interval)) {
                fps = (frames * interval) / (time - prevTime) * scalar;
                frames = 0;
                prevTime = time;
                if (cb) cb(fps, time);
            }
            (self.requestAnimationFrame || self.setTimeout)(iterate, 0);
        })();
    }
};
export default perf;
