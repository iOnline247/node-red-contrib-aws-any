var AWS = require("aws-sdk");

module.exports = function(RED) {
  "use strict";

  function AWSSDKInit(n) {
    RED.nodes.createNode(this, n);

    this.awsConfig = RED.nodes.getNode(n.aws);
    this.region = this.awsConfig.region;
    this.accessKey = this.awsConfig.accessKey;
    this.secretKey = this.awsConfig.secretKey;
    this.service = n.servicename;
    this.method = n.methodname;
    this.operation = n.operation;
    // this.async = n.async;

    var node = this;

    AWS.config.update({
      accessKeyId: this.accessKey,
      secretAccessKey: this.secretKey,
      region: this.region
    });

    node.on("input", function(msg) {
      var targetService = new AWS[node.service]();
      var callback = function(err, data) {
        if (err) {
          node.status({ fill: "red", shape: "dot", text: "error" });
          node.error("failed: " + err.toString(), msg);
          msg.err = err;
          msg.params = msg.payload;
          msg.payload = {};
          node.send(msg);
        } else {
          node.status({});
          msg.err = {};
          msg.params = msg.payload;
          msg.payload = data;
          node.send(msg);
        }
      };

      node.status({ fill: "blue", shape: "dot", text: "Processing..." });
      if (this.operation) {
        targetService[node.method](this.operation, msg.payload, callback);
      } else {
        targetService[node.method](msg.payload, callback);
      }

      // if (this.async) {
      //     if (this.operation) {
      //         targetService[node.method](this.operation, msg.payload);
      //     } else {
      //         targetService[node.method](msg.payload);
      //     }
      //     node.send(msg);
      // } else {
      //     node.status({ fill: "blue", shape: "dot", text: "Processing..." });
      //     if (this.operation) {
      //         targetService[node.method](this.operation, msg.payload, callback);
      //     } else {
      //         targetService[node.method](msg.payload, callback);
      //     }
      // }
    });
  }
  RED.nodes.registerType("aws-sdk-any", AWSSDKInit);
};
