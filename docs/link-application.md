# Link an application

More applications can be configured on the same Sentinel instance. This will help monitor multiple instances of applications installed for a client.

Some parameters needs to be configured:

* client - the client associated with this application. All users with access to this application will have access to this application’s data.
* Communication key - the encryption key that will be used for internal communication between Sentinel and mite plugin.
* Sentinel get status time interval - the time interval when Sentinel application will require Mite status.
* Internal Mite status acquiring data interval - Mite application will get application monitoring data and also host machine data on this time intervals.
When a get status is received from Sentinel all this data will be sent and then cleared from memory.
* Mite maximum data samples - In the case that Sentinel will not require data for a long time interval from mite then the data acquired by the mite plugin can accumulate.
To prevent any problem with the target application this parameter will control how maximum data samples are preserved between two getStatus request.
* These last two parameters should be set with care to prevent affecting the target application.
