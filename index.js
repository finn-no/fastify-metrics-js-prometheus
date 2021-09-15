/* eslint-disable no-restricted-syntax */

'use strict';

const ProcessMetrics = require('@metrics/process');
const Consumer = require('@metrics/prometheus-consumer');
const abslog = require('abslog');
const Guard = require('@metrics/guard');
const fp = require('fastify-plugin');

module.exports = fp((fastify, opts, done) => {
    const {
        client,
        pathname = '/metrics',
        logger,
        guard = {},
        consumer = {},
    } = opts;
    let { metrics = [] } = opts;
    const log = abslog(logger);

    const mConsumer = new Consumer({ ...consumer, client, logger: log });
    const mProcess = new ProcessMetrics();
    const mGuard = new Guard(guard);

    mConsumer.on('error', err => {
        if (err)
        log.error(
                'an error occurred when piping metrics into the prometheus consumer module',
                err,
            );
    });

    mProcess.on('drop', metric => {
        log.trace(`Process metric "${metric.name}" dropped`);
    });

    mProcess.on('collect:start', () => {
        log.trace('Started collecting process metrics');
    });

    mProcess.on('collect:end', () => {
        log.trace('Stopped collecting process metrics');
    });

    mProcess.on('error', err => {
        if (err) log.error('Process metric stream error', err);
    });

    mGuard.on('warn', info => {
        log.warn(
            `${info} is creating a growing number of metric permutations. Metrics will begin being dropped if the increase continues.`,
        );
    });

    mGuard.on('drop', metric => {
        log.error(
            `${metric.name} has created too many permutations. Metric has been dropped.`,
        );
    });

    mGuard.on('error', err => {
        if (err)
        log.error(
                'an error occurred when piping metrics into the @metrics/guard module',
                err,
            );
    });

    if (!Array.isArray(metrics)) metrics = [metrics];

    for (const stream of metrics) {
        stream.on('error', err => {
            log.error(
                'an error occurred in the @metrics/client module',
                err,
            );
        });

        stream.pipe(mGuard);
    }

    mProcess.pipe(mGuard);
    mGuard.pipe(mConsumer);
    
    mProcess.start({
        gc: false,
    });

    fastify.get(pathname, async (request, reply) => {
        const mObj = await mConsumer.registry.metrics();
        reply
            .type(mConsumer.registry.contentType)
            .send(mObj);
    });

    done();
}, {
    fastify: '^3.0.0',
    name: 'fastify-metrics-js-prometheus',
});
