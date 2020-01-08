const fs = require("fs-extra");
const path = require("path");
const AWS = require("aws-sdk");
const replaceInFile = require("replace-in-file");
// const awsRegions = require("../src/data/regions");

const awsSdkLocation = "./node_modules/aws-sdk/apis";
const apiFileNames = fs.readdirSync(awsSdkLocation);
const metadata = require(`.${awsSdkLocation}/metadata`);

// #region Utils
function createDistDirectory() {
  return new Promise((resolve, reject) => {
    const distDirectoryPath = path.join(__dirname, "../dist");
    try {
      fs.removeSync(distDirectoryPath);
    } catch (err) {
      debugger;
    }
    try {
      fs.mkdir(distDirectoryPath, err => {
        if (err) {
          reject(err);
          return;
        }

        resolve();
      });
    } catch {}
  });
}

function getApiFilePrefix(serviceName) {
  const serviceId = serviceName.toLowerCase();
  return serviceId;
}

// #endregion

function generateServiceDefinitions() {
  const services = Object.keys(metadata).reduce((output, service) => {
    const value = metadata[service];
    output.push({
      name: value.name,
      value
    });

    return output;
  }, []);

  const definitions = services.reduce((output, service) => {
    // TODO:
    // Don't parse the json files, just loop `AWS.apiLoader.services`

    // TODO:
    // Test objects for one off methods. e.g. `waitFor`
    // Should do this instead of dealing with .json files:
    // `AWS.TESTAPI = AWS.Service.defineService('s3', ['2006-03-01']);`
    // ```
    //  const latestMethodDate = Object.keys(AWS.TESTAPI).find(
    //    dateStr => !dateStr.endsWith("*")
    //  );
    // `
    // `var test = new AWS.TESTAPI({region: "us-east-1"})`
    // Then loop through properties and getting the service definition.
    // Test for the `waitFor` method: https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html#bucketExists-waiter
    // Try and find any of the other methods that are missed.

    const sdk = AWS[service.name];
    const latestMethodDate = Object.keys(sdk.services).find(
      dateStr => !dateStr.endsWith("*")
    );

    let filePrefix = getApiFilePrefix(service.name);
    let serviceDefinition;

    try {
      serviceDefinition = require(`.${awsSdkLocation}/${filePrefix}-${latestMethodDate}.min.json`);
    } catch {
      filePrefix = getApiFilePrefix(service.value.prefix);
      serviceDefinition = require(`.${awsSdkLocation}/${filePrefix}-${latestMethodDate}.min.json`);
    }

    const methods = Object.keys(serviceDefinition.operations).map(method => {
      const methodName = method.charAt(0).toLowerCase() + method.slice(1);

      return methodName;
    });

    output[service.name] = {
      name: service.name,
      methods
    };

    return output;
  }, {});

  // TODO:
  // Overwrite the ServiceNames in aws-sdk-any/template.html
  // https://stackoverflow.com/questions/5467129/sort-javascript-object-by-key
  // const dataList = Object.keys(definitions).sort().map(def => {
  //   return `<option>${definitions[def].name}</option>`
  // }).join("")
  // console.log(dataList);

  // TODO:
  // Write the service definitions to JSON in the aws-sdk-any/template.html

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

function generateHtml(serviceDefs) {
  const serviceNames = Object.keys(serviceDefs);

  serviceNames.forEach(serviceName => {
    const service = serviceDefs[serviceName];

    service.methodHtml = service.methods.reduce((output, method) => {}, "");
  });

  return serviceDefs;
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

function writeSource(nodeDefinitions) {
  nodeDefinitions.forEach(nodeDef => {
    const { helpSource, name, scriptSource, templateSource } = nodeDef;
    const options = {
      files: path.join(__dirname, `../dist/${name}.html`),
      from: [
        /(<script type="text\/javascript">)(.|\n)*?(<\/script>)/gim,
        /(<script type="text\/x-red" data-template-name="{{name}}">)(.|\n)*?(<\/script>)/gim,
        /(<script type="text\/x-red" data-help-name="{{name}}">)(.|\n)*?(<\/script>)/gim,
        /\{\{name\}\}/gi
      ],
      to: [
        `$1\n${scriptSource}\n$3`,
        `$1\n${templateSource}\n$3`,
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
  const { methodHtml, serviceHtml, operationsHtml } = generateHtml(serviceDefs);
  const nodeDefinitions = getEachNodesSource();

  copyTemplateForEachNode(nodeDefinitions);
  writeSource(nodeDefinitions);
}

main();
