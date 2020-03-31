// description: Check if all values of specific keys are in an approved list

// valueInListValidator.js
// Creator:   Dimitris for customer POC, based on Anastasia validator
// Version:   1.0 - First
//

// Path to the approved list of values (nodes separated by /)
// The list of values should be nodes or keys in the path provided
var approvedList = "PATH,TO,LIST";
// keys that contains the values to check
var keysToValidate = [
 "KEYNAME1",
 "KEYNAME2"
];
var errorFound = false;
var errorDescription = "";
// defines if error msg includes path or not
// not yet fully functional
var errorFullPath = false;

var subset = getValueByPath(metadataset, approvedList);
if (subset !== "ERROR: NOT FOUND") {
  var approvedValues = Object.keys(subset);
  for (var id in keysToValidate) {
    checkKeyValue(metadataset, keysToValidate[id], "")
  }
} else {
    errorFound = true;
    errorDescription = "PATH NOT FOUND";
}
return {description:errorDescription, result:!errorFound};

// Return the value of a specific key based on its complete path
// If the key is a node, then it returns a subset
// If not found, then "ERROR: NOT FOUND" is returned
function getValueByPath(mds, path) {
  var pathSeparator = ',';
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


function checkKeyValue(mds, keyName, path) {
  for (var item in mds) {
    // check if the key has a value or points to an object
    if  (typeof (mds[item]) === "object") {
      path=path.concat('/' + item);
      // if value is an object call recursively the function to search this subset
      checkKeyValue(mds[item], keyName, path);
    } else if (item === keyName
        // else checks if it is searched value, value is not a token and is not in approved list
        && !mds[item].startsWith("@@")
        && !approvedValues.includes(mds[item])) {
        // check if the key equals to the search key and has value in authorised list
        errorFound = true;
        if (errorFullPath) {
          errorDescription = errorDescription + ("Key: "+ path +"/"+ item +" has unauthorised value: "+ mds[item]);
        } else {
          errorDescription = errorDescription +("Key: "+ item +" has unauthorised value: "+ mds[item]);
        }
    }
  }
}
