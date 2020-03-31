// description: Checks system limits configuration is the same as approved list

// systemCheck-limits.js
// Creator:   Dimitris for customer POC
// Version:   1.0 - First
//
var rootName = Object.keys(metadataset)[0];
var root = metadataset[rootName];
var approvedNode = root.approved.system.limits;
var limitsPath = "system/limits";

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
	var limitsNode = getValueByPath(subset, limitsPath);
  if (limitsNode == "ERROR: NOT FOUND") {
    errorFound = true;
    errors.push("*** For server ("+serverName+"), limits configuration not found");
    return errorFound;
  }

  // compare both subsets
  var nbLinesConf = Object.keys(limitsNode).length;
  if (nbLinesConf != nbLinesApproved) {
    errorFound = true;
    errors.push("*** For server ("+serverName+"): limits.conf doesn't have good number of lines.");
    return errorFound;
  }
  for (var line in limitsNode) {
    for (var item in limitsNode[line]) {
      if (!(approvedNode[line].hasOwnProperty(item)) || limitsNode[line][item] !== approvedNode[line][item]) {
          errorFound = true;
          errors.push("*** For server ("+serverName+"): limits configuration for line "+line+", key ("+item+") is not approved");
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
