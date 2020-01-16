const {
  AWS_ACCESS_KEY_ID,
  AWS_REGION,
  AMAZON_REGION,
  AWS_SECRET_ACCESS_KEY
} = process.env;

module.exports = function(RED) {
  function AWSConfigNode(config) {
    const node = this;

    RED.nodes.createNode(node, config);

    node.accessKey = node.credentials.accessKey || AWS_ACCESS_KEY_ID;
    node.secretKey = node.credentials.secretKey || AWS_SECRET_ACCESS_KEY;
    node.region = config.region || AWS_REGION || AMAZON_REGION;
    node.name = config.name;
    node.customcreds = config.customcreds;
  }

  RED.nodes.registerType("aws-sdk-any-config", AWSConfigNode, {
    settings: {
      awsSdkAnyConfig_hasCredentials: {
        value: !!(AWS_ACCESS_KEY_ID && AWS_SECRET_ACCESS_KEY),
        exportable: true
      }
    },
    credentials: {
      accessKey: { type: "text" },
      secretKey: { type: "password" }
    }
  });
};
