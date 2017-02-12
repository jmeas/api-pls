'use strict';

const pino = require('pino');

const pretty = pino.pretty();
pretty.pipe(process.stdout);

const NODE_ENV = process.env.NODE_ENV || 'development';
const isDevEnv = NODE_ENV === 'development';

function resourceSerializer(resource) {
  return {
    resourceName: resource.name
  };
}

function reqSerializer(req) {
  return Object.assign(pino.stdSerializers.req(req), {
    reqId: req.id
  });
}

const log = pino({
  name: 'api-pls',
  serializers: Object.assign({}, pino.stdSerializers, {
    req: reqSerializer,
    resource: resourceSerializer
  }),
  src: isDevEnv
}, pretty);

module.exports = log;
