// description: Compare 2 nodes to check that some values are identical and others are different

// envsComparator.js
// Compare 2 nodes to check that some values are identical and others are different
// Inputs are
//    - 2 nodes to compare
//    - List of keys that must have same values
//    - List of keys that must have different values
// Creator:   Stefanos for customer POC
// Version:   1.1 - For Sweagle 2.23, handles new error format in JSON
//
var fromEnv = "qualif";
var toEnv = "preprod";
var sameValues = [
    "autoConfirmIdentical",
    "fromName"
];
var diffValues = [
    "senderUrl",
    "password"
];

var fromEnvFlattened = {};
var toEnvFlattened = {};
var errorFound = false;
var errorMsg = "Validation passed successfully";

function flattenObject (environment , flatObject) {
    for (var item in environment) {
        if (typeof (environment[item]) === "object") {
            flattenObject(environment[item] , flatObject);
        }else {
            if (sameValues.includes(item) || diffValues.includes(item)) {
                flatObject[item] = environment[item];
            }
        }
    }
}

if (metadataset && metadataset.hasOwnProperty('environments')) {
    if ( metadataset.environments.hasOwnProperty(fromEnv) ) {
        flattenObject(metadataset.environments[fromEnv] , fromEnvFlattened);
    }else {
        errorFound = true;
        errorMsg = "ERROR: Environment not found: "+fromEnv;
    }
    if ( metadataset.environments.hasOwnProperty(toEnv) ) {
        flattenObject(metadataset.environments[toEnv] , toEnvFlattened);
    }else {
        errorFound = true;
        errorMsg = "ERROR: Environment not found: "+toEnv;
    }
}
if (!errorFound) {
    for (var i = 0 ; i < sameValues.length; i++ ) {
        if ( fromEnvFlattened[sameValues[i]] !== toEnvFlattened[sameValues[i]] ) {
            errorFound = true;
            errorMsg = "ERROR: Values must be the same between environments "+fromEnv+" and "+toEnv+" for key: "+sameValues[i];
            break;
        }
    }
}

if (!errorFound) {
    for (var i = 0 ; i < diffValues.length; i++ ) {
        if ( fromEnvFlattened[diffValues[i]] === toEnvFlattened[diffValues[i]] ) {
            errorFound = true;
            errorMsg = "ERROR: Values must be different between environments "+fromEnv+" and "+toEnv+" for key: "+diffValues[i];
            break;
        }
    }
}

return {"result":!errorFound,"description":errorMsg};
