'use strict';

const { test } = require('tap');
const fastify = require('fastify');
const client = require('prom-client');
const supertest = require('supertest');
const Metrics = require('@metrics/client');
const plugin = require('./index');

// Helper to delay requesting the app server with some milliseconds.
// This is needed due to the system process metrics which needs to 
// be collected before there is any data to provide. The system
// process data are emitted on an interval an need some time to be
// available.
const delayedGet = (address, pathname, delay = 200) => new Promise((resolve, reject) => {
        setTimeout(async () => {
            const http = supertest(address);
            const { text } = await http.get(pathname);
            if (text) {
                resolve(text);
            } else {
                reject(new Error('no response from server'));
            }
        }, delay);
    })

test('Plugin renders basic metrics page', async t => {
    const app = fastify();
    app.register(plugin, { client });
    const address = await app.listen();
    const text = await delayedGet(address, '/metrics');
    t.match(text, 'process_start_time_seconds');
    t.match(text, 'nodejs_heap_space_size_used_bytes');
    t.match(text, 'process_open_fds');
    await app.close();
});

test('Plugin renders basic metrics page on a different pathname', async t => {
    const app = fastify();
    app.register(plugin, { client, pathname: '/_/metrics' });
    const address = await app.listen();
    const text = await delayedGet(address, '/_/metrics');
    t.match(text, 'process_start_time_seconds');
    t.match(text, 'nodejs_heap_space_size_used_bytes');
    t.match(text, 'process_open_fds');
    await app.close();
});

test('Plugin renders custom metrics on render page', async t => {
    const app = fastify();
    const metrics = new Metrics();
    const counter = metrics.counter({
        name: 'a_custom_counter_metric',
        description: 'A custom metric',
    });
    app.register(plugin, { client, metrics });
    const address = await app.listen();

    counter.inc();

    const http = supertest(address);
    const { text } = await http.get('/metrics');
    t.match(text, 'a_custom_counter_metric');
    await app.close();
});
