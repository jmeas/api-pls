'use strict';

const express = require('express');
const routeBuilder = require('express-routebuilder');
const Resource = require('./resource');
const serverErrors = require('./util/server-errors');
const loadResourceConfigs = require('./util/load-resource-configs');

module.exports = function() {
  const router = express.Router();

  // This version needs to be made external
  var apiVersion = 1;

  var resourceConfigs = loadResourceConfigs();
  var definitions = resourceConfigs.map(r => r.definition);

  var resources = definitions.map(resource => new Resource({
    version: apiVersion,
    resource
  }));

  // Configure routes for our resources.
  resources.forEach(resource =>
    router.use(routeBuilder(
      express.Router(),
      resource.routes,
      resource.location
    ))
  );

  // Set up the root route that describes the available endpoints.
  router.get('/', (req, res) => {
    res.send({
      version: 'v1',
      endpoints: definitions.map(resource => {
        return {
          route: resource.location,
          methods: Object.keys(resource.routes)
        };
      })
    });
  });

  // All other requests get a default 404 error.
  router.get('*', (req, res) => {
    res.status(serverErrors.notFound.code).send({
      errors: [serverErrors.notFound.body()]
    });
  })

  return router;
};