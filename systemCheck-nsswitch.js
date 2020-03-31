// description: Checks if server nsswitch values are in approved list

// systemCheck-nsswitch.js
// Creator:   Dimitris for customer POC
// Version:   1.0 - First
//
var rootName = Object.keys(metadataset)[0];
var root = metadataset[rootName];
var approvedNode = root.approved.system.nsswitch.sudoers;
var sudoersPath = "system/nsswitch/sudoers";

var errorFound = false;
var errors = [];
var description = '';

if (approvedNode == undefined) {
    return {description: "*** ERROR: Approved list not found ", result: false};
}
var approvedValue = approvedNode;

if (rootName == "servers") {
  // MDS is list of servers check all of them
  for (var server in root) {
      if (server == 'approved') { continue; }
      check(server, root[server]);
  }
} else {
  // MDS is one server, check it
  check(rootName, root);
}

description = errors.join(', ');
return {description: description, result:!errorFound};


function check(serverName, subset) {
  var sudoers = getValueByPath(subset, sudoersPath);
  if (sudoers == "ERROR: NOT FOUND") {
    errorFound = true;
    errors.push("*** For server ("+serverName+"), sudoers key not found");
    return errorFound;
  }
  if (approvedValue !== sudoers) {
  		errorFound = true;
      errors.push("*** For server ("+serverName+"), sudoers ("+ sudoers +") is not in approved list");
  }
}

// Return the value of a specific key based on its complete path
// If the key is a node, then it returns a subset
// If not found, then "ERROR: NOT FOUND" is returned
function getValueByPath(mds, path) {
  var pathSeparator = '/';
  var pathSteps =  path.split(pathSeparator);
  var subset = mds;
  for (var i = 0; i < pathSteps.length; i++ ) {
    if (subset.hasOwnProperty(pathSteps[i])) {
      subset = subset[pathSteps[i]];
    } else {
      return "ERROR: NOT FOUND";
    }
  }
  return subset;
}
