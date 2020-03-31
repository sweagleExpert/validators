// description: Checks system sudoers configuration is the same as approved list

// systemCheck-sudoers.js
// Creator:   Dimitris for customer POC
// Version:   1.1 - Correct error
//
var rootName = Object.keys(metadataset)[0];
var root = metadataset[rootName];
var approvedNode = root.approved.system.sudoers;
var sudoersPath = "system/sudoers";

var errorFound = false;
var errors = [];
var description = '';

if (approvedNode == undefined) {
    return {description: "*** ERROR: Approved list not found ", result: false};
}
var nbLinesApproved = Object.keys(approvedNode).length;

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
	var sudoersNode = getValueByPath(subset, sudoersPath);
  if (sudoersNode == "ERROR: NOT FOUND") {
    errorFound = true;
    errors.push("*** For server ("+serverName+"), sudoers configuration not found");
    return errorFound;
  }

  // compare both subsets
  var nbLinesConf = Object.keys(sudoersNode).length;
  if (nbLinesConf != nbLinesApproved) {
    errorFound = true;
    errors.push("*** For server ("+serverName+"): sudoers list doesn't have good number of lines.");
  }
//  console.log(sudoersNode);
//  console.log(approvedNode);

  for (var line in sudoersNode) {
    for (var item in sudoersNode[line]) {
        if (typeof(approvedNode[line]) === 'undefined') {
          errorFound = true;
          errors.push("*** For server ("+serverName+"): sudoers configuration for line "+line+", key ("+item+") doesn't exists in approved list");
        } else if (!(approvedNode[line].hasOwnProperty(item)) || sudoersNode[line][item] !== approvedNode[line][item]) {
          errorFound = true;
          errors.push("*** For server ("+serverName+"): sudoers configuration for line "+line+", key ("+item+") is not approved");
      }
    }
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
