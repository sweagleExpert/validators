// description: Checks LDAP Base DN of a server is in approved list

// systemCheck-ldap.js
// Creator:   Dimitris for customer POC
// Version:   1.0 - First
//
var rootName = Object.keys(metadataset)[0];
var root = metadataset[rootName];
var approvedNode = root.approved.system.ldap.bases;
var ldapPath = "system/ldap/base";

var errorFound = false;
var errors = [];
var description = '';

if (approvedNode == undefined) {
    return {description: "## ERROR: Approved list not found ", result: false};
}
var approvedArray = Object.keys(approvedNode);

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
	var ldapBase = getValueByPath(subset, ldapPath);
  if (ldapBase == "ERROR: NOT FOUND") {
    errorFound = true;
    errors.push("## For server ("+serverName+"), ldap BASE DN key not found");
    return errorFound;
  }
	if(!approvedArray.includes(ldapBase)) {
			errorFound = true;
			errors.push("## For server ("+serverName+"): LDAP base DN ("+ ldapBase +") is not approved !");
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
