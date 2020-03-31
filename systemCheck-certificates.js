// description: Checks PEM certificates issuers and end date of a server

// systemCheck-certificates.js
// Creator:   Dimitris for customer POC
// Version:   1.0 - First
//
var numberOfDays = 180;
var rootName = Object.keys(metadataset)[0];
var root = metadataset[rootName];
var approvedNode = root.approved.pem.issuers;
var pemPath = "pem";

var errorFound = false;
var errors = [];
var description = '';

if (approvedNode == undefined) {
    return {description: "*** ERROR: Approved list not found ", result: false};
}
var approvedArray = Object.keys(approvedNode);
var allowedDelay= numberOfDays*60*60*24*1000

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
	var pemNode = getValueByPath(subset, pemPath);
  if (pemNode == "ERROR: NOT FOUND") {
    errorFound = true;
    errors.push("*** For server ("+serverName+"), PEM list not found");
    return errorFound;
  }

	var pemKeys = Object.keys(pemNode);
	for (var i=0; i<pemKeys.length; i++) {
		if(!approvedArray.includes(pemNode[pemKeys[i]].issuer)) {
			errorFound = true;
			errors.push("*** For server ("+serverName+"): Issuer not Found: "+pemKeys[i]);
		}

		var date1 = new Date(pemNode[pemKeys[i]].notAfter) - new Date();

		if (date1 < allowedDelay) {
	    errorFound= true;
		  errors.push("*** For server ("+serverName+"): Certificate: "+pemKeys[i]+" will expire in less than "+numberOfDays+" days.");
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
