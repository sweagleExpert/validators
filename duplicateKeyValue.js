// description: Check if there is no duplicate key value between conf and deployed instances

// duplicateIP.js
// Creator:   Dimitris Finas for customer POC
// Version:   1.O - First release
//

// Defines if error must include full path of key found
var includePath = true;
// Defines the max number of errors to return
var maxErrorDisplay = 3;
var errorFound = false;
var errors = [];
var description = '';
var pathSeparator = "/";

var rootName = Object.keys(metadataset)[0];
var root = metadataset[rootName];
// Outputs to check for value
var subsetOutputs= root.Outputs;
// Instances that may contains duplicates
var subsetInstances= root.Instances;
// Node where is defined keys to search for duplicates
var rulesNode = root.ReglesValidation.DuplicateKeyValue;

if (subsetOutputs == undefined) { return {description: "ERROR: Subset Outputs not found", result: false}; }
if (subsetInstances == undefined) { return {description: "ERROR: Subset Instances not found", result: false}; }
if (rulesNode == undefined) { return {description: "*** ERROR: Rules list not found ", result: false}; }

// Define keynames array to search for
var keyNames = Object.keys(rulesNode);

// here we call our function with different search terms
for (var i= 0; i < keyNames.length; i++) {
  if (keyNames[i] !== "_description") {
    var myValue = getKeyValueByName(subsetOuputs, keyNames[i]);
    // If found, check if these value exists for same key in all instances
    if (myValue != "ERROR: NOT FOUND") { checkKeyValueExists(subsetInstances, keyNames[i], myValue, ''); }
  }
}

if (errors.length > 0) {
  errorFound = true;
  if (errors.length < maxErrorDisplay) { description = "ERRORS: " + errors.join(', '); }
  else { description = "ERRORS: only first "+maxErrorDisplay+" errors are displayed:" + errors.join(', '); }
} else { description = "Validation passed successfully"; }

return {description: description, result:!errorFound};


function getKeyValueByName(mds, keyName) {
  var value = "ERROR: NOT FOUND";
  for (var item in mds) {
    // check if the key has a value or points to an object
    if  (typeof (mds[item]) === "object") {
      // if value is an object call recursively the function to search this subset of the object
      value = getKeyValueByName(mds[item], keyName);
      if (value != "ERROR: NOT FOUND") { return value; }
    } else {
      // check if the key equals to the search term
      if (item === keyName ) { return mds[item]; }
    }
  }
  return value;
}


function checkKeyValueExists (mds, keyname, keyvalue, path) {
  for (var item in mds) {
    if (errors.length >= maxErrorDisplay) { break; }
    // check if the key has a value or points to an object
    if  (typeof (mds[item]) === "object") {
      // if value is an object call recursively the function to search this subset of the object
      checkKeyValueExists(mds[item], keyName, keyvalue, path+item+pathSeparator);
    } else {
      // check if the key & value equals to the search term
      if (item === keyName && mds[item] === keyvalue) { errors.push("Key: "+path+item+" contains same value: "+keyvalue); }
    }
  }
}
