var AWS = require("aws-sdk");

module.exports = function(RED) {
  "use strict";

  function AWSSDKInit(n) {
    var node = this;

    RED.nodes.createNode(node, n);

    node.awsConfig = RED.nodes.getNode(n.aws);
    node.region = node.awsConfig.region;
    node.accessKey = node.awsConfig.accessKey;
    node.secretKey = node.awsConfig.secretKey;
    node.service = n.servicename;
    node.method = n.methodname;
    node.operation = n.operation;

    AWS.config.update({
      accessKeyId: node.accessKey,
      secretAccessKey: node.secretKey,
      region: node.region
    });

    node.on("input", async function(msg, send, done) {
      var targetService = new AWS[node.service]();

      send =
        send ||
        function() {
          node.send.apply(node, arguments);
        };

      node.status({ fill: "blue", shape: "dot", text: "Processing..." });

      if (node.operation) {
        // TODO:
        // Test this.
        // TODO:
        // Promisify this.
        targetService[node.method](node.operation, msg.payload, function(
          err,
          data
        ) {
          if (err) {
            const errorMessage = `${err.name}: ${err.message}`;

            node.status({ fill: "red", shape: "dot", text: "error" });

            if (done) {
              done(errorMessage);
            } else {
              node.error(errorMessage);
            }
          } else {
            node.status({});
            msg.err = {};
            msg.params = msg.payload;
            msg.payload = data;

            send(msg);
          }
        });
      } else {
        try {
          const results = await targetService[node.method](
            msg.payload
          ).promise();

          msg.payload = results;

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
      }
    });
  }

  RED.nodes.registerType("aws-sdk-any", AWSSDKInit);
};
