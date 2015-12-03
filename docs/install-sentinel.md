# Sentinel

## Overview

This application will manage and monitor all information regarding the target applications and will be able to also generate alarms and send e-mail notification when events occurs.

## Install & Running

Fork, clone or download the code from github from:

<https://github.com/senecajs/seneca-sentinel>

Then:

`
npm install
`

to get modules you need.

Copy the config.template.js to config.mine.js, setup the MongoDB and then enter the configuration into the config.mine.js file.

Start application by running:

`
node app.js
`

or

`
npm run start
`

You can then access the application’s UI from any browser at

`
http://localhost:3000
`