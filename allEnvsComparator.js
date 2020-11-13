// description: Compare all environments key values to check if they are the same or different

// allEnvsComparator.js
// Compare all environments nodes to check that some values are identical and others are different
// Inputs are
//    - Environments node name
//    - List of keys that must have same values
//    - List of keys that must have different values
// Creator:   Dimitris for customer POC, based on 2EnvsComparator.js
// Version:   1.2

// defines max errors to display in result
var maxErrorDisplay = 5;
var errorFound = false;
var errors = [];
var description = "Validation passed successfully";
// rules variables
var environmentNodeName = "Environments";
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
  	var envArray = Object.keys(envSubset);
    //console.log(envArray);
    if (envArray.length > 1) {
      var flattenEnvArray = [];
      for (var i = 0 ; i < envArray.length; i++ ) {
        //console.log(envArray[i]);
		flattenEnvArray[i] = {};
        flattenObject(envSubset[envArray[i]] , flattenEnvArray[i]);
        //console.log(flattenEnvArray[i]);
      }
    } else {
        errorFound = true;
        errors.push("No environments to compare!");
    }
} else {
	errorFound = true;
    errors.push("Environment node not found!");
}

if (!errorFound) {
    for (var i = 0 ; i < sameValues.length; i++ ) {
      if (errors.length >= maxErrorDisplay) { break; }
      for (var j = 1 ; j < flattenEnvArray.length; j++ ) {
          // Compare all environments values to check they are all equals
          if ( flattenEnvArray[j-1][sameValues[i]] !== flattenEnvArray[j][sameValues[i]] ) {
              errorFound = true;
              errors.push("Values must be the same between environments "+envArray[j-1]+" and "+envArray[j]+" for key: "+sameValues[i]);
          }
      }
    }
    for (var i = 0 ; i < diffValues.length; i++ ) {
		if (errors.length >= maxErrorDisplay) { break; }
        for (var j = 1 ; j < flattenEnvArray.length; j++ ) {
      	// check if value exists in any of the environment flatten list
          if (flattenEnvArray[j-1][diffValues[i]] != undefined || flattenEnvArray[j][diffValues[i]] != undefined ) {
	      	// check that value is different for any other environments
            for (var j2 = j ; j2 < flattenEnvArray.length; j2++ ) {
              if ( flattenEnvArray[j-1][diffValues[i]] === flattenEnvArray[j2][diffValues[i]] ) {
                errorFound = true;
                errors.push("Values must be different between environments "+envArray[j-1]+" and "+envArray[j2]+" for key: "+diffValues[i]);
              }
            }
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
