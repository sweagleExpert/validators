// description: Validates list of package of a server

// systemCheck-packages.js
// Creator:   Stefan/Dimitris for customer POC
// Version:   1.1 - align code with other systemChecks
//
var rootName = Object.keys(metadataset)[0];
var root = metadataset[rootName];
var approvedPackages = root.approved.system.packages;
var packagePath = "system/packages";
var maxDisplay = 5;

var errorFound = false;
var errors = [];
var description = '';

if (approvedPackages == undefined) {
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
  var unallowedPackages = [];
  var versionMismatches = [];
  var packages = getValueByPath(subset, packagePath);
  // check whether all packages are of correct version
  for (var pack in packages) {
      if(typeof(approvedPackages[pack]) === 'undefined') {
          unallowedPackages.push(pack);
      } else if (approvedPackages[pack] != packages[pack]) {
          versionMismatches.push(pack + ' => ' + packages[pack] + '<>' + approvedPackages[pack]);
      }
  }
  if (unallowedPackages.length > 0 || versionMismatches.length > 0) {
      errorFound=true;
      if (unallowedPackages.length > 0) {
          var min = Math.min(unallowedPackages.length, maxDisplay);
          errors.push('*** For server ('+serverName+'): ' + unallowedPackages.length + ' non allowed packages were found. First ' + min + ' are:');
          for (var i = 0; i < min; i++) {
            errors.push(unallowedPackages[i]);
          }
      }
      if (versionMismatches.length > 0) {
          var min = Math.min(versionMismatches.length, maxDisplay);
          errors.push('*** For server ('+serverName+'): ' + versionMismatches.length + ' packages in wrong version found. First ' + min + ' are:');
          for (var i = 0; i < min; i++) {
            errors.push(versionMismatches[i]);
          }
      }
    } else {
      errors.push('*** For server ('+serverName+'): All packages are allowed and on the correct version');
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
