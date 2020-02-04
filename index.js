/* eslint-disable no-restricted-syntax */

'use strict';

const Consumer = require('@metrics/prometheus-consumer');
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

    const mConsumer = new Consumer({ ...consumer, client, logger });
    const mGuard = new Guard(guard);

    mConsumer.on('error', err => {
        if (err)
            logger.error(
                'an error occurred when piping metrics into the prometheus consumer module',
                err,
            );
    });

    mGuard.on('warn', info => {
        logger.warn(
            `${info} is creating a growing number of metric permutations. Metrics will begin being dropped if the increase continues.`,
        );
    });

    mGuard.on('drop', metric => {
        logger.error(
            `${metric.name} has created too many permutations. Metric has been dropped.`,
        );
    });

    mGuard.on('error', err => {
        if (err)
            logger.error(
                'an error occurred when piping metrics into the @metrics/guard module',
                err,
            );
    });

    if (!Array.isArray(metrics)) metrics = [metrics];

    for (const stream of metrics) {
        stream.on('error', err => {
            logger.error(
                'an error occurred in the @metrics/client module',
                err,
            );
        });

        stream.pipe(mGuard);
    }

    mGuard.pipe(mConsumer);

    const { collectDefaultMetrics } = client;
    collectDefaultMetrics({ register: mConsumer.registry });
    // eslint-disable-next-line global-require
    const gcStats = require('prometheus-gc-stats');
    gcStats(mConsumer.registry)();

    fastify.get(pathname, (request, reply) => {
        reply
            .type(mConsumer.registry.contentType)
            .send(mConsumer.registry.metrics());
    });

    done();
});
