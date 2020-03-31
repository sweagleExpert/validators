// description: Validates list of passwd values of a server

// systemCheck-passwd.js
// Creator:   Dimitris for customer POC
// Version:   1.0 - first
//
var rootName = Object.keys(metadataset)[0];
var root = metadataset[rootName];
var approvedNode = root.approved.system.passwd;
var passwdPath = "system/passwd";
var maxDisplay = 10;

var errorFound = false;
var errors = [];
var description = '';

if (approvedNode == undefined) {
    return {description: "*** ERROR: Approved list not found ", result: false};
}

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
  var unallowedKey = [];
  var unallowedValue = [];
  var currentList = getValueByPath(subset, passwdPath);
  // check whether all packages are of correct version
  for (var item in currentList) {
      if(typeof(approvedNode[item]) === 'undefined') {
          unallowedKey.push(item);
      } else if (approvedNode[item] != currentList[item]) {
          unallowedValue.push(item + ' => ' + currentList[item] + '<>' + approvedNode[item]);
      }
  }
  if (unallowedKey.length > 0 || unallowedValue.length > 0) {
      errorFound=true;
      if (unallowedKey.length > 0) {
          var min = Math.min(unallowedKey.length, maxDisplay);
          errors.push('*** For server ('+serverName+'): ' + unallowedKey.length + ' non allowed passwd were found. First ' + min + ' are:');
          for (var i = 0; i < min; i++) {
            errors.push(unallowedKey[i]);
          }
      }
      if (unallowedValue.length > 0) {
          var min = Math.min(unallowedValue.length, maxDisplay);
          errors.push('*** For server ('+serverName+'): ' + unallowedValue.length + ' passwd with wrong value found. First ' + min + ' are:');
          for (var i = 0; i < min; i++) {
            errors.push(unallowedValue[i]);
          }
      }
    } else {
      errors.push('*** For server ('+serverName+'): All passwd are allowed with correct value');
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
