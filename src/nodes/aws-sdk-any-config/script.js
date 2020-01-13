RED.nodes.registerType("aws-sdk-any-config", {
  category: "config",
  defaults: {
    name: { value: "AWS" },
    region: { value: "us-east-1", required: true }
  },
  credentials: {
    accessKey: { type: "text" },
    secretKey: { type: "text" }
  },
  label: function() {
    return this.name;
  },
  oneditprepare: function() {debugger;}
});
