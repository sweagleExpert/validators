// description: Compare 2 environments to check that some values are identical and others are different

// 2EnvsComparator.js
// Compare 2 nodes to check that some values are identical and others are different
// Inputs are
//    - environment node name
//    - 2 nodes to compare
//    - List of keys that must have same values
//    - List of keys that must have different values
// Creator:   Stefanos for customer POC
// Maintainer: Dimitris for POC
// Version:   1.2
//

// defines max errors to display in result, 0 means no limit
var maxErrorDisplay = 5;
var errorFound = false;
var errors = [];
var description = "Validation passed successfully";
// rules variables
var environmentNodeName = "Environments";
var fromEnv = "TST";
var toEnv = "PRD";
var sameValues = [
    "helpdeskEmail",
    "adminusername"
];
var diffValues = [
    "password1",
    "url2",
  	"dbconnectionString3"
];
var fromEnvFlattened = {};
var toEnvFlattened = {};


// Got to environments subset
var envSubset = getSubsetByNodeName(cds[0], environmentNodeName);
//console.log(envSubset);
if (envSubset != "ERROR: NOT FOUND") {
    if ( envSubset.hasOwnProperty(fromEnv) ) {
        flattenObject(envSubset[fromEnv] , fromEnvFlattened);
    } else {
        errorFound = true;
        errors.push("Environment not found: "+fromEnv);
    }
    //console.log(fromEnvFlattened);
    if ( envSubset.hasOwnProperty(toEnv) ) {
        flattenObject(envSubset[toEnv] , toEnvFlattened);
    } else {
        errorFound = true;
        errors.push("Environment not found: "+toEnv);
    }
    //console.log(toEnvFlattened);
} else {
	errorFound = true;
    errors.push("Environment node not found!");
}

if (!errorFound) {
    for (var i = 0 ; i < sameValues.length; i++ ) {
        if (errors.length >= maxErrorDisplay) { break; }
      	if ( fromEnvFlattened[sameValues[i]] !== toEnvFlattened[sameValues[i]] ) {
            errorFound = true;
            errors.push("Values must be the same between environments "+fromEnv+" and "+toEnv+" for key: "+sameValues[i]);
        }
    }
    for (var i = 0 ; i < diffValues.length; i++ ) {
		if (errors.length >= maxErrorDisplay) { break; }
      	// check if value exists in any of the flatten list
      	if (fromEnvFlattened[diffValues[i]] != undefined || toEnvFlattened[diffValues[i]] != undefined) {
          if ( fromEnvFlattened[diffValues[i]] === toEnvFlattened[diffValues[i]] ) {
              errorFound = true;
              errors.push("Values must be different between environments "+fromEnv+" and "+toEnv+" for key: "+diffValues[i]);
          }
        }
    }
}

// Display result
if (errorFound) {
  if (errors.length < maxErrorDisplay) { description = "ERRORS: " + errors.join(', '); }
  else { description = "ERRORS: only first "+maxErrorDisplay+" errors are displayed:" + errors.join(', '); }
}
return {description: description, result:!errorFound};

// Return a flat list of all keys included in subset
function flattenObject (subset , flatObject) {
    for (var item in subset) {
        if (typeof (subset[item]) === "object") {
            flattenObject(subset[item] , flatObject);
        }else {
            if (sameValues.includes(item) || diffValues.includes(item)) {
                flatObject[item] = subset[item];
            }
        }
    }
}

// Return a subset of configdataset based on its node name
function getSubsetByNodeName(subset, name) {
  var value = "ERROR: NOT FOUND";
  for (var item in subset) {
    // check if the key points to an object
    if  (typeof(subset[item]) === "object") {
      // check if the key equals to the search term
      if (item === name ) {
        return subset[item];
      } else {
	    // if value is an object call recursively the function to search this subset of the object
    	value = getSubsetByNodeName(subset[item], name);
        // if key was found, returns it
        if (value != "ERROR: NOT FOUND") { return value; }
      }
      // if not, continue the loop
    }
  }
  return value;
}
