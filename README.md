# node-red-contrib-aws-any

Use this plugin to make AWS API calls within <a href="http://nodered.org" target="_new">Node-RED</a>. Refer to the AWS-SDK-JS docs for more information: <a href="https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/top-level-namespace.html">AWS NodeJS SDK</a>

This plugin installs 2 nodes: `aws-sdk-any-config` and `aws-sdk-any`. The `aws-sdk-any` node allows easy to use AWS SDK API calls. This node also provides a nice experience within the UI and should keep users from needing to refer to the AWS SDK often.

---

## Table of Contents

- [Install](#install)
- [Usage](#usage)
  - [S3](#s3)
  - [Lambda](#lambda)
  - [Step Functions](#step-functions)
- [Example Flows](#example-flows)
  - [S3 Example](#s3-example)
- [Bugs / Feature request](#bugs--feature-request)
- [TODOs](#todos)

## Install Plugin

Since this module is currently not in the NPM registry, you'll need to install from a local version. To do this, follow these steps from a shell/command prompt:

- `git clone git@github.com:iOnline247/node-red-contrib-aws-any.git`

- Change the shell to the directory where the module is cloned and run `npm run build`. This will create the `dist` folder by executing the `./bin/runner.js`

- Install the plugin into Node-RED by following [these instructions](https://nodered.org/docs/creating-nodes/first-node#testing-your-node-in-node-red).

## Usage

### S3

Construct the payload below to upload a file to an S3 bucket.  Payload referenced from: https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html#putObject-property

![s3-example.jpg](./docs/images/s3-example.jpg)

**`putObject` Example**
```json
[{"id":"e31430f5.4ea86","type":"tab","label":"Flow 1","disabled":false,"info":""},{"id":"febd4243.cc921","type":"aws-sdk-any","z":"e31430f5.4ea86","aws":"b3d8ae95.cb9b","region":"","servicename":"S3","methodname":"putObject","operation":"","name":"","x":650,"y":120,"wires":[["f53e0af.c99b6f8"]]},{"id":"73030c23.2c0634","type":"inject","z":"e31430f5.4ea86","name":"","topic":"","payload":"","payloadType":"date","repeat":"","crontab":"","once":false,"onceDelay":0.1,"x":140,"y":120,"wires":[["dd9390f5.bd13f"]]},{"id":"dd9390f5.bd13f","type":"function","z":"e31430f5.4ea86","name":"Create S3 Payload","func":"const bucketName = \"BUCKET-NAME\";\nconst buffer = Buffer.from(`{\"test\": true}`);\nconst s3Parameters = {\n    Bucket: bucketName,\n    Key: `${Date.now()}.json`,\n    Body: buffer, \n};\n\nmsg.payload = s3Parameters;\n\nreturn msg;","outputs":1,"noerr":0,"x":390,"y":120,"wires":[["febd4243.cc921"]]},{"id":"f53e0af.c99b6f8","type":"debug","z":"e31430f5.4ea86","name":"success","active":true,"tosidebar":true,"console":false,"tostatus":false,"complete":"true","targetType":"full","x":1000,"y":40,"wires":[]},{"id":"1fd03851.4c62c8","type":"catch","z":"e31430f5.4ea86","name":"AWS Error","scope":["febd4243.cc921"],"uncaught":false,"x":940,"y":160,"wires":[["44beb768.4efb38"]]},{"id":"44beb768.4efb38","type":"debug","z":"e31430f5.4ea86","name":"Errors","active":true,"tosidebar":true,"console":false,"tostatus":false,"complete":"true","targetType":"full","x":1180,"y":160,"wires":[]},{"id":"b3d8ae95.cb9b","type":"aws-sdk-any-config","z":"","name":"AWS","region":"us-east-1"}]
```
### Lambda

Construct the payload below to upload a file to an S3 bucket.  Payload referenced from: https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/Lambda.html#invoke-property

![lambda-example.jpg](./docs/images/lambda-example.jpg)

**`invoke` Example**
```json
[{"id":"ae6bdda7.41dcd","type":"tab","label":"Flow 1","disabled":false,"info":""},{"id":"5f208032.05594","type":"aws-sdk-any","z":"ae6bdda7.41dcd","aws":"b3d8ae95.cb9b","region":"","servicename":"Lambda","methodname":"invoke","operation":"","name":"","x":720,"y":120,"wires":[["808e0db5.1185f"]]},{"id":"872224ed.4ae168","type":"inject","z":"ae6bdda7.41dcd","name":"","topic":"","payload":"","payloadType":"date","repeat":"","crontab":"","once":false,"onceDelay":0.1,"x":140,"y":120,"wires":[["dde50e0b.f1a8d"]]},{"id":"dde50e0b.f1a8d","type":"function","z":"ae6bdda7.41dcd","name":"Create Lambda Payload","func":"const lambdaParameters = {\n    FunctionName: `LAMBDA-FUNCTION-NAME`,\n    InvocationType: \"Event\",\n    LogType: \"None\",\n    Payload: JSON.stringify({test: true})\n};\n\nmsg.payload = lambdaParameters;\n\nreturn msg;","outputs":1,"noerr":0,"x":410,"y":120,"wires":[["5f208032.05594"]]},{"id":"808e0db5.1185f","type":"debug","z":"ae6bdda7.41dcd","name":"success","active":true,"tosidebar":true,"console":false,"tostatus":false,"complete":"true","targetType":"full","x":1000,"y":40,"wires":[]},{"id":"3697aad8.c27846","type":"catch","z":"ae6bdda7.41dcd","name":"AWS Error","scope":["5f208032.05594"],"uncaught":false,"x":940,"y":160,"wires":[["91545c4f.09ebf"]]},{"id":"91545c4f.09ebf","type":"debug","z":"ae6bdda7.41dcd","name":"Errors","active":true,"tosidebar":true,"console":false,"tostatus":false,"complete":"true","targetType":"full","x":1180,"y":160,"wires":[]},{"id":"b3d8ae95.cb9b","type":"aws-sdk-any-config","z":"","name":"AWS","region":"us-east-1"}]
```

### Step Functions

Construct the payload below to start a Step Function execution.  Payload referenced from: https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/StepFunctions.html#startExecution-property

![step-function-example.jpg](./docs/images/step-function-example.jpg)

**`startExecution` Example**
```json
[{"id":"ae6bdda7.41dcd","type":"tab","label":"Flow 1","disabled":false,"info":""},{"id":"5f208032.05594","type":"aws-sdk-any","z":"ae6bdda7.41dcd","aws":"b3d8ae95.cb9b","region":"","servicename":"StepFunctions","methodname":"startExecution","operation":"","name":"","x":680,"y":120,"wires":[["808e0db5.1185f"]]},{"id":"872224ed.4ae168","type":"inject","z":"ae6bdda7.41dcd","name":"","topic":"","payload":"","payloadType":"date","repeat":"","crontab":"","once":false,"onceDelay":0.1,"x":140,"y":120,"wires":[["dde50e0b.f1a8d"]]},{"id":"dde50e0b.f1a8d","type":"function","z":"ae6bdda7.41dcd","name":"Create SFN Payload","func":"const sfnParameters = {\n    stateMachineArn: \"STEP-FUNCTION-ARN\",\n    input: JSON.stringify({test: true}),\n    name: \"USUALLY-A-GUID\"\n};\n\nmsg.payload = sfnParameters;\n\nreturn msg;","outputs":1,"noerr":0,"x":360,"y":120,"wires":[["5f208032.05594"]]},{"id":"808e0db5.1185f","type":"debug","z":"ae6bdda7.41dcd","name":"success","active":true,"tosidebar":true,"console":false,"tostatus":false,"complete":"true","targetType":"full","x":1000,"y":40,"wires":[]},{"id":"3697aad8.c27846","type":"catch","z":"ae6bdda7.41dcd","name":"AWS Error","scope":["5f208032.05594"],"uncaught":false,"x":1000,"y":160,"wires":[["91545c4f.09ebf"]]},{"id":"91545c4f.09ebf","type":"debug","z":"ae6bdda7.41dcd","name":"Errors","active":true,"tosidebar":true,"console":false,"tostatus":false,"complete":"true","targetType":"full","x":1240,"y":160,"wires":[]},{"id":"b3d8ae95.cb9b","type":"aws-sdk-any-config","z":"","name":"AWS","region":"us-east-1"}]
```

# TODOs

- Create examples of usages.
- Add to npm registry
- Write up on the `./bin/runner.js` logic
