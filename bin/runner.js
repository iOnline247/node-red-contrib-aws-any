const fs = require("fs-extra");
const path = require("path");
const AWS = require("aws-sdk");
const replaceInFile = require("replace-in-file");
// const awsRegions = require("../src/data/regions");

// #region Utils
function createDistDirectory() {
  return new Promise((resolve, reject) => {
    const distDirectoryPath = path.join(__dirname, "../dist");

    try {
      fs.removeSync(distDirectoryPath);
    } catch (err) {}

    try {
      fs.mkdir(distDirectoryPath, err => {
        if (err) {
          reject(err);
          return;
        }

        resolve();
      });
    } catch (err) {
      reject(err);
    }
  });
}

function getLatestApiVersion(service) {
  const ordered = {};

  Object.keys(service)
    .sort()
    .forEach(function(key) {
      ordered[key] = service[key];
    });

  const serviceNames = Object.keys(ordered);
  const latestApiRev = serviceNames[serviceNames.length - 1];

  return service[latestApiRev];
}

// #endregion

function generateServiceDefinitions() {
  const metadata = require("../node_modules/aws-sdk/apis/metadata");
  const services = Object.keys(metadata)
    .map(service => metadata[service].name)
    .sort();
  const definitions = services.reduce((output, serviceName) => {
    const serviceDefinition = getLatestApiVersion(
      AWS.apiLoader.services[serviceName.toLowerCase()]
    );
    const methods = Object.keys(serviceDefinition.operations).map(method => {
      const methodName = method.charAt(0).toLowerCase() + method.slice(1);

      return methodName;
    });

    const waiters = serviceDefinition.waiters || {};
    const hasWaiters = Object.keys(waiters).length > 0;
    const waiterOps = Object.keys(waiters).map(waiter => {
      const waiterName = waiter.charAt(0).toLowerCase() + waiter.slice(1);

      return waiterName;
    });

    if (hasWaiters) {
      methods.push("waitFor");
    }

    let operations = {};

    // 1 off service with weird signature.
    if (serviceName === "S3") {
      methods.push("getSignedUrl", "getSignedUrlPromise");
      operations = {
        getSignedUrl: ["getObject", "putObject"],
        getSignedUrlPromise: ["getObject", "putObject"]
      };
    }

    output[serviceName] = {
      name: serviceName,
      methods: methods.sort(),
      waiterOps: waiterOps.sort(),
      operations
    };

    return output;
  }, {});

  return definitions;
}

function getEachNodesSource() {
  const nodeDirPath = path.join(__dirname, "../src/nodes");
  const nodeDirectories = fs.readdirSync(nodeDirPath);

  const nodeDefinitions = nodeDirectories.map(dirName => {
    const definition = {};

    definition.name = dirName;
    definition.path = path.join(nodeDirPath, dirName);
    definition.scriptSource = fs
      .readFileSync(path.join(definition.path, "script.js"))
      .toString();
    definition.templateSource = fs
      .readFileSync(path.join(definition.path, "template.html"))
      .toString();
    definition.helpSource = fs
      .readFileSync(path.join(definition.path, "help.html"))
      .toString();

    return definition;
  });

  return nodeDefinitions;
}

function copyTemplateForEachNode(nodeDefinitions) {
  const nodeTemplate = path.join(__dirname, "../src/nodeTemplate.html");

  nodeDefinitions.forEach(def => {
    const scriptName = `${def.name}.js`;

    fs.copyFileSync(
      path.join(def.path, scriptName),
      path.join(__dirname, `../dist/${scriptName}`)
    );
    fs.copyFileSync(
      nodeTemplate,
      path.join(__dirname, `../dist/${def.name}.html`)
    );
  });
}

function writeSource(nodeDefinitions, serviceDefinitions) {
  nodeDefinitions.forEach(nodeDef => {
    const { helpSource, name, scriptSource, templateSource } = nodeDef;
    const serviceNamesHtml = Object.keys(serviceDefinitions)
      .map(serviceName => `<option>${serviceName}</option>`)
      .join("");
    const options = {
      files: path.join(__dirname, `../dist/${name}.html`),
      from: [
        /(<script type="text\/javascript">)(.|\n)*?(<\/script>)/gim,
        /"{{{serviceDefinitions}}}"/,
        /(<script type="text\/x-red" data-template-name="{{name}}">)(.|\n)*?(<\/script>)/gim,
        /{{{serviceNamesHtml}}}/,
        /(<script type="text\/x-red" data-help-name="{{name}}">)(.|\n)*?(<\/script>)/gim,
        /\{\{name\}\}/gi
      ],
      to: [
        `$1\n${scriptSource}\n$3`,
        JSON.stringify(serviceDefinitions),
        `$1\n${templateSource}\n$3`,
        serviceNamesHtml,
        `$1\n${helpSource}\n$3`,
        name
      ]
    };

    replaceInFile.sync(options);
  });
}

async function main() {
  await createDistDirectory();
  const serviceDefs = generateServiceDefinitions();
  const nodeDefinitions = getEachNodesSource();

  copyTemplateForEachNode(nodeDefinitions);
  writeSource(nodeDefinitions, serviceDefs);
}

main();
