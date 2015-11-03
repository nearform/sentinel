![Seneca](http://senecajs.org/files/assets/seneca-logo.png)
> A [Seneca.js][] testing toolkit

Lead Maintainer: [Mircea Alexandru](https://github.com/mirceaalexandru)

# Purpose

  * A production test system to test the external API of a Seneca application
  * Need to be able to export the API description from seneca-web of all APIs
  * A separate plugin/applition will run continuous tests against this API.

# Architecture

The test system is composed from two different parts:

  * Mite - this is a minimal plugin that will be loaded by the host application to be tested. It will have minimum functionality to make sure it will not affect the hist application. It will offer some HTTP endpoints that will report host application monitored/health data and also information about seneca instance and seneca HTTP API int$
  * Seneca-sentinel - a fully independent WEB application that is offering:
    * Can be used to monitor multiple mite-hosting applications from multiple clients (TBD). This functionality will be able to assign a security matrix access to each user, in such way that users can see/access/control only assigned applications. In this way, using a single/central Sentinel application more clients and their application$
    * Can be used to monitor also non-mite HTTP applications. (TBD)
    * User management - for access the application
    * Mite management - possibility to defined and control remote mite access
    * Monitor mite management
    * Define tests suites with validation of response based on HTTP status/parambulator rules on JSON response
    * Visualization of monitored health/test data by using:
      * Integrated Grafana dashboard - TBD
      * Internal charts - TBD
    * Alarm management - manage internal alarm rules based on monitored application events. These alarms can trigger notification of two types  (Under development):
      * HTTP notifications - notifications that will be displayed in the Sentinel site
      * E-mail notifications - email notifications sent to specific email addresses
      * Others ?

# Usage

  * The mite plugin must be loaded by the host seneca application. No other configuration is required.
  * To start the seneca-sentinel application please take a look on its documentation.
    * After seneca-sentinel is started the connection to the application to be monitored can be added.

# Status

  * Project status - under development, do not use in production.


# Seneca sentinel

## Install

```sh
npm install
cd public
bower install
```

## Configuration

  * copy config.template.js into config.mine.js
  * add DB configuration into config.mine.js - for now the project is using MongoDB

## Run

```sh
node app.js
```
