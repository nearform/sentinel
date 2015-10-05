![Seneca](http://senecajs.surge.sh/files/assets/seneca-banner.png)
> A [Seneca.js][] testing toolkit

# Mite

## Description

A plugin for reporting basic application information.

This plugin will attach to a host seneca application and will report using HTTP API the basic health and
configuration information about the host application.

## Install

```sh
npm install mite --save
```

## Usage


```JavaScript
var seneca = require('seneca')()
seneca.use('mite')
```

## Configuration

No configuration is required for this plugin. It can be controlled/configured from a remote seneca-sentinel application.

Take a look on seneca-sentinel for details



## Test

```sh
npm test
```


