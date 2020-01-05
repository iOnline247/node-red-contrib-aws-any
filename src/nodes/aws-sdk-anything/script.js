RED.nodes.registerType("aws-sdk-anything", {
  category: "AWS",
  color: "#FF9A00",
  defaults: {
    aws: { type: "aws-sdk-anything-config", required: true },
    region: { value: "" },
    servicename: { value: "" },
    methodname: { value: "" },
    operation: { value: "" },
    name: { value: "" }
  },
  inputs: 1,
  outputs: 1,
  icon: "aws.png",
  align: "left",
  label: function() {
    return this.name || "aws " + this.servicename + " " + this.methodname;
  }
});
