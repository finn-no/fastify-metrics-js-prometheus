'use strict';

const { test } = require('tap');
const fastify = require('fastify');
const client = require('prom-client');
const supertest = require('supertest');
const Metrics = require('@metrics/client');
const plugin = require('./index');

test('Plugin renders basic metrics page', async t => {
    const app = fastify();
    app.register(plugin, { client });
    const address = await app.listen();
    const http = supertest(address);
    const { text } = await http.get('/metrics');
    t.match(text, 'nodejs_heap_space_size_used_bytes');
    await app.close();
});

test('Plugin renders basic metrics page on a different pathname', async t => {
    const app = fastify();
    app.register(plugin, { client, pathname: '/_/metrics' });
    const address = await app.listen();
    const http = supertest(address);
    const { text } = await http.get('/_/metrics');
    t.match(text, 'nodejs_heap_space_size_used_bytes');
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
