(function main($) {
  const serviceDefinitions = "{{{serviceDefinitions}}}";

  RED.nodes.registerType("aws-sdk-any", {
    category: "AWS",
    color: "#FF9A00",
    defaults: {
      aws: { type: "aws-sdk-any-config", required: true },
      region: { value: "" },
      servicename: { value: "", required: true },
      methodname: { value: "", required: true },
      operation: { value: "" },
      name: { value: "" }
    },
    inputs: 1,
    outputs: 1,
    icon: "aws.png",
    align: "left",
    label: function() {
      return this.name || `AWS ${this.servicename} ${this.methodname}`;
    },
    oneditprepare: function() {
      const nodeConfig = this;

      $(function() {
        const $serviceName = $("#node-input-servicename");
        const $methodName = $("#node-input-methodname");
        const $methodDataList = $("#node-config-input-method-list");
        const $operation = $("#node-input-operation");
        const $operationDataList = $("#node-config-input-operation-list");

        function createDataListHtml(arr) {
          return arr.map(method => `<option>${method}</option>`).join("");
        }

        function addEvents() {
          $serviceName.on("input paste", event => {
            const methodName = event.currentTarget.value;

            // Refresh Methods datalist.
            $methodName.val("");
            $methodDataList.empty();
            // Refresh Operations datalist
            $operation.val("");
            $operationDataList.empty();

            // Wrapped in `try/catch` to prevent errors thrown while typing.
            try {
              const { methods } = serviceDefinitions[methodName];
              const methodsHtml = createDataListHtml(methods);

              $methodDataList.html(methodsHtml);

              if (!nodeConfig.operation) {
                $operation
                .parent("div")
                .toggleClass("node-red-contrib-aws-sdk-any-hide", true);
              }
            } catch {}
          });
          $methodName.on("input paste", event => {
            // Wrapped in `try/catch` to prevent errors thrown while typing.
            try {
              const serviceName = $serviceName.val();
              const methodName = event.currentTarget.value;
              const { operations, waiterOps } = serviceDefinitions[serviceName];
              // This should handle any service that uses `waitFor` and any service that uses an operation.
              const ops =
                methodName === "waitFor" ? waiterOps : operations[methodName];
              const operationsHtml = createDataListHtml(ops);
              const hasOperations = !!operationsHtml;

              // Refresh Operations datalist.
              $operation.val("");
              $operationDataList.empty();
              $operation
                .parent("div")
                .toggleClass(
                  "node-red-contrib-aws-sdk-any-hide",
                  !hasOperations
                );
              $operationDataList.html(operationsHtml);
            } catch {
              // Refresh Operations datalist.
              $operation.val("");
              $operationDataList.empty();
              $operation
                .parent("div")
                .toggleClass("node-red-contrib-aws-sdk-any-hide", true);
            }
          });
        }

        function initializeUi() {
          addEvents();
          // Set the datalists for each
          $serviceName.trigger("input");
          $methodName.trigger("input");

          // Set the operation b/c the `trigger` will remove the value.
          if (nodeConfig.methodname) {
            $methodName.val(nodeConfig.methodname);
          }

          if (!nodeConfig.operation) {
            $operation.val("");
            $operation
              .parent("div")
              .addClass("node-red-contrib-aws-sdk-any-hide");
          } else {
            $operation.val(nodeConfig.operation);
          }
        }

        initializeUi();
      });
    }
  });
})(jQuery);
