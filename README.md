# Fastify Metrics-js Prometheus

A Fastify plugin for consuming @metrics/client (https://www.npmjs.com/package/@metrics/client) streams and rendering a prometheus scraping page

## Usage

```js
const app = require('fastify')();
const pluginMetrics = require('fastify-metrics-js-prometheus');
const client = require('prom-client');

app.register(pluginMetrics, options);
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
});
```

| name     | description                                                                      | type     | default    | required |
| -------- | -------------------------------------------------------------------------------- | -------- | ---------- | -------- |
| client   | metrics client library. `prom-client` is currently supported.                    | `object` |            | `yes`    |
| pathname | url pathname to serve metrics scraping page on.                                  | `string` | `/metrics` |          |
| logger   | log4j compatible logger (usually pino) to use for logging.                       | `object` |            |          |
| guard    | options to be passed to the @metrics/guard module (used internally.)             | `object` | `{}`       |          |
| consumer | options to be passed to the @metrics/prometheus-consumer module used internally. | `object` | `{}`       |          |
