# node-red-contrib-aws-any

Use this plugin to make AWS API calls within Node-RED. Refer to the AWS-SDK-JS docs for more information: https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/top-level-namespace.html
This plugin installs 2 nodes: `aws-sdk-any-config` and `aws-sdk-any`. The `aws-sdk-any` node has all of the service definitions baked into it. This provides a nice experience within the UI and should keep users from needing to refer to the SDK.

## Install Plugin

Since this module is currently not in the NPM registry, you'll need to install from a local version. To do this, follow these steps from a shell/command prompt:

- `git clone git@github.com:iOnline247/node-red-contrib-aws-any.git`

- Change the shell to the directory where the module is cloned and run `npm run build`. This will create the `dist` folder by executing the `./bin/runner.js`

- Install the plugin into Node-RED by following [these instructions](https://nodered.org/docs/creating-nodes/first-node#testing-your-node-in-node-red).

# TODOs

- Create examples of usages.
- Add to npm registry
- Write up on the `./bin/runner.js` logic
