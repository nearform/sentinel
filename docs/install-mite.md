# Mite

## Overview

Mite: _They have exploited an incredible array of habitats, and because of their small size (most are microscopic), go largely unnoticed._

This plugin will be loaded in the seneca instance of the target application.

Features:

* MOST IMPORTANT: should have minimum impact (minimum footprint) on the target application.
* report information about the exposed application HTTP API and HTTP configuration
* report status information about the application and host machine, like memory usage, up time, others.

## Installation

This plugin will be installed and can run like any other Seneca plugin.

### Install

`
npm install mite --save
`

### Use

`
var seneca = require('seneca')()
seneca.use('mite', config)
`

## Supported WEB application frameworks

Mite is supporting [Express](http://expressjs.com/) and [Hapi](http://hapijs.com/).