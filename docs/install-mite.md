# Mite

## Overview

Mite: _They have exploited an incredible array of habitats, and because of their small size (most are microscopic), go largely unnoticed._

This plugin will be loaded in the seneca instance of the target application.

Examples of starting an application with mite plugin are [here](https://github.com/mirceaalexandru/seneca-mite-demo)

## Installing

`
npm install seneca-mite --save
`

## Usage

`
// create a seneca instance
var seneca = require( 'seneca' )(  )

seneca.use( 'mite', options )
`

## Options

Mite plugin accepts following options:
* key - string key to use for encrypting/decrypting messages in Sentinel Protocol. Same key should be set in the Sentinel.

## Support Web applications

Mite plugin is supporting now Express based Seneca applications (is using seneca-web internally for reporting and for registering routes).

In near future support for Hapi will be added.