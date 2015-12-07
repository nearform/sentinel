Back to [TOC](./Readme.md)

# Security


We are taking security very seriously so the communication between the two main components of the testing system is encrypted and also other type of security applies.

## Sentinel - Mite communication

The internal communication protocol between sentinel application and mite plugin is using HTTP/HTTPS depending on the protocol the host application is using.

The sentinel application will act as a client and the mite plugin - by using the Seneca’s WEB server from host application - as a server, so the

Mite plugin do not need any information about the Sentinel application location.

The protocol contains in actual implementation some configuration commands.

Because the mite plugin exposes HTTP endpoints the problem of security needs to be solved. For this reason all communication between the two components is encrypted using a key.

This key needs to be configured when mite plugin starts and also it needs to be set-up in the Sentinel, when configuration parameters for target application are added.
If no key is provided a default value is used.

Check [documentation](./install-mite.md) for more installation steps.

# Sentinel

Sentinel application UI is strictly using HTTPS protocol.

# User access

User access on Sentinel instance is free, so anybody can create an account. However access to a certain configured application can be allowed only by the user that registered that application.

By using this approach the access to an application zone is controlled on user level.