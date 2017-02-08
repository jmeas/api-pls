'use strict';

const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const yaml = require('js-yaml');

// This function reads and parses the resource from the disk, and returns it.
// At the moment, only YAML files are supported, although it'd be simple to add
// in support for JSON.
function loadResource(filename, resourcesDir) {
  const filePath = path.join(resourcesDir, filename);

  const fileContents = fs.readFileSync(filePath, 'utf8');

  // Empty files are simply ignored.
  if (!fileContents) {
    return null;
  }

  let doc;
  try {
    doc = yaml.safeLoad(fileContents);
  } catch (e) {
    console.log(chalk.red(`There was an error while parsing the "${filename}" resource file.`));
    process.exit(1);
  }

  return doc;
}

module.exports = function(resourcesDir) {
  // Loop through all files in the directory
  return fs.readdirSync(resourcesDir)
    // Open them up and parse them as JSON
    .map(r => loadResource(r, resourcesDir))
    // Filter out any files that have no content
    .filter(r => r);
};
