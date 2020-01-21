# Fastify Metrics-js Prometheus

A Fastify plugin for consuming @metrics/client (https://www.npmjs.com/package/@metrics/client) streams and rendering a prometheus scraping page

## Usage

```js
const app = require('fastify')();
const pluginMetrics = require('fastify-metrics-js-prometheus');
const client = require('prom-client');
const Metrics = require('@metrics/client');
const metrics = new Metrics();

app.register(pluginMetrics, { client, metrics });
```

By default, a metrics scraping page for prometheus will be served at `/metrics`. This can be configured by setting the plugin option `pathname`.

## Plugin options

```js
app.register(pluginMetrics, {
    client,
    pathname,
    logger,
    guard,
    consumer,
    metrics,
});
```

| name     | description                                                                                                                                    | type                    | default    | required |
| -------- | ---------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------- | ---------- | -------- |
| client   | metrics client library. [prom-client](https://www.npmjs.com/package/prom-client) is currently supported.                                       | `object`                |            | `yes`    |
| pathname | url pathname to serve metrics scraping page on.                                                                                                | `string`                | `/metrics` |          |
| logger   | log4j compatible logger (usually [pino](https://www.npmjs.com/package/pino)) to use for logging.                                               | `object`                |            |          |
| guard    | options to be passed to the [@metrics/guard](https://www.npmjs.com/package/@metrics/guard) module (used internally.)                           | `object`                | `{}`       |          |
| consumer | options to be passed to the [@metrics/prometheus-consumer](https://www.npmjs.com/package/@metrics/prometheus-consumer) module used internally. | `object`                | `{}`       |          |
| metrics  | Stream or streams of metrics generated by [@metrics/client](https://www.npmjs.com/package/@metrics/client) to be consumed                      | `object[]` or `object`] | `[]`       |          |
