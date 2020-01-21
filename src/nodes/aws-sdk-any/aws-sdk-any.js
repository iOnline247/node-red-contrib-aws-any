function invokeCallbackApi(targetService, node, msg) {
  return new Promise((resolve, reject) => {
    targetService[node.method](node.operation, msg.payload, function(
      err,
      data
    ) {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    });
  });
}

module.exports = function(RED) {
  function AWSSDKInit(n) {
    const AWS = require("aws-sdk");
    const node = this;

    RED.nodes.createNode(node, n);

    node.awsConfig = RED.nodes.getNode(n.aws);
    node.region = node.awsConfig.region;
    node.service = n.servicename;
    node.method = n.methodname;
    node.operation = n.operation;

    node.on("input", async function(msg, send, done) {
      // This supports multiple AWS credentials.
      // AWS.config.update updates creds for all nodes,
      // which is not ideal.
      const targetService = new AWS[node.service]({
        accessKeyId: node.awsConfig.accessKey,
        secretAccessKey: node.awsConfig.secretKey,
        region: node.region
      });

      send =
        send ||
        function() {
          node.send.apply(node, arguments);
        };

      node.status({ fill: "blue", shape: "dot", text: "Processing..." });

      try {
        let response;

        const shouldUseCallback = !!node.operation;

        if (shouldUseCallback) {
          response = await invokeCallbackApi(targetService, node, msg);
        } else {
          response = await targetService[node.method](msg.payload).promise();
        }

        msg.payload = response;

        node.status({});
        send(msg);
      } catch (err) {
        const errorMessage = `${err.name}: ${err.message}`;

        node.status({ fill: "red", shape: "dot", text: "error" });

        if (done) {
          done(errorMessage);
        } else {
          node.error(errorMessage);
        }
      }
    });
  }

  RED.nodes.registerType("aws-sdk-any", AWSSDKInit);
};
