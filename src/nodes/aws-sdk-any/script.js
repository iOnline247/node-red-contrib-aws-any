(function main($) {
  const serviceDefinitions = "{{{serviceDefinitions}}}";

  RED.nodes.registerType("aws-sdk-any", {
    category: "AWS",
    color: "#FF9A00",
    defaults: {
      aws: { type: "aws-sdk-any-config", required: true },
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
    },
    oneditprepare: function() {
      $(function() {
        const $serviceName = $("#node-input-servicename");
        const $methodName = $("#node-input-methodname");
        const $methodDataList = $("#node-config-input-method-list");

        $serviceName.on("input paste", event => {
          const methodName = event.currentTarget.value;

          $methodName.val("");
          $methodDataList.empty();

          try {
            const { methods } = serviceDefinitions[methodName];

            if (methods) {
              const methodList = methods
                .map(method => `<option>${method}</option>`)
                .join("");

              $methodDataList.html(methodList);
            }
          } catch {}
        });
        $methodName.on("input paste", event => {
          // TODO:
          // Test this after operations are added in runner.
          const serviceName = $serviceName.val();
          const { operations } = serviceDefinitions[serviceName];
          const methodName = event.currentTarget.value;

          if (operations) {
            const operations = methods
              .map(method => `<option>${method}</option>`)
              .join("");
          }
        });
      });
    }
  });
})(jQuery);
