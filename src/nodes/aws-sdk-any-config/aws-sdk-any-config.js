const {
  NR_AWS_ACCESS_KEY_ID,
  NR_AWS_REGION,
  NR_AMAZON_REGION,
  NR_AWS_SECRET_ACCESS_KEY
} = process.env;

module.exports = function(RED) {
  function AWSConfigNode(config) {
    const node = this;

    RED.nodes.createNode(node, config);

    if (config.customcreds) {
      node.accessKey = NR_AWS_ACCESS_KEY_ID;
      node.secretKey = NR_AWS_SECRET_ACCESS_KEY;
      node.region = NR_AWS_REGION || NR_AMAZON_REGION;  
    } else {
      node.accessKey = node.credentials.accessKey;
      node.secretKey = node.credentials.secretKey;
      node.region = config.region;
    }

    node.name = config.name;
    node.customcreds = config.customcreds;
  }

  RED.nodes.registerType("aws-sdk-any-config", AWSConfigNode, {
    settings: {
      awsSdkAnyConfig_hasCredentials: {
        value: !!(NR_AWS_ACCESS_KEY_ID && NR_AWS_SECRET_ACCESS_KEY),
        exportable: true
      }
    },
    credentials: {
      accessKey: { type: "text" },
      secretKey: { type: "password" }
    }
  });
};
