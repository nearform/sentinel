![Seneca](http://senecajs.org/files/assets/seneca-logo.png)
> A [Seneca.js] testing toolkit

***

# Goals

* Very simple to use and configure test application.
* *Configure and forget* - after test suites and alarms are configured there is no need to check the Sentinel's UI for data - user will receive notifications for internal events.
* *Validate the external API of a Seneca system* - i.e. the HTTP urls etc.
* Is able to retrieve the HTTP API description from seneca-web from target application.
* Will provide a separate [plugin](./mite.md) that runs inside the target application for reporting internal data/events.
* Easy to configure [test suites](./simple-test-suites.md) - including [dynamic](./dynamic-test-suites.md) and [chained](./chained-test-suites.md) test suites.
* Send [notifications](./notifications.md) for configured events.
* [Automatically](./API-documentation.md) creates API documentation for monitored web application.

[Seneca.js]: https://senecajs.org
