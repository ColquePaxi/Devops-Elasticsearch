const database = require('../config/database');
const express = require('express');
const bodyParser = require('body-parser');
const routeSetup = require('./routes');
const Github = require('./resources/github');
const apm = require('elastic-apm-node');

apm.start({
  serviceName: 'NodeApp',
  serverUrl: 'http://apm-server:8200'
});

const app = express();

const setupApp = async (githubResource = new Github()) => {
  app.use(bodyParser.json());
  app.use('/', routeSetup(githubResource));

  await database.connect();

  return app;
};
const closeApp = async () => await database.close();

module.exports = {
  setupApp,
  closeApp,
};
