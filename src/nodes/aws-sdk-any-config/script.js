RED.nodes.registerType("aws-sdk-any-config", {
  category: "config",
  defaults: {
    name: { value: "AWS" },
    region: { value: "", required: false },
    customcreds: { value: false, required: false }
  },
  credentials: {
    accessKey: { type: "text" },
    secretKey: { type: "text" }
  },
  label: function() {
    return this.name;
  },
  oneditprepare: function() {
    const $credentialFields = $(".aws-sdk-creds");
    const $serverConfig = $(".aws-sdk-lock");
    const $nodeArgCredentials = $("#node-config-input-customcreds");
    const $lockIcon = $nodeArgCredentials.next("i");
    const hasNodeArgConfig = RED.settings.awsSdkAnyConfig_hasCredentials;
    const shouldUseServerConfig =
      hasNodeArgConfig && $nodeArgCredentials.prop("checked");

    if (shouldUseServerConfig) {
      $credentialFields.prop("disabled", true);
    } else if (hasNodeArgConfig) {
      $lockIcon.removeClass("fa-lock").addClass("fa-unlock");
    } else {
      $serverConfig.addClass("aws-sdk-hide");
    }

    $serverConfig.on("click", event => {
      event.preventDefault();

      const shouldUseServerConfig = $nodeArgCredentials.prop("checked");

      $nodeArgCredentials.prop("checked", !shouldUseServerConfig);
      $credentialFields.prop("disabled", !shouldUseServerConfig);
      $lockIcon
        .toggleClass("fa-lock", !shouldUseServerConfig)
        .toggleClass("fa-unlock", shouldUseServerConfig);

      if ($nodeArgCredentials.prop("checked")) {
        $credentialFields.find('input[type="text"]').val("");
      }
    });
  }
});
