// description: Check if there is no duplicate key value with a data set
// duplicateKeyValue.js
//
// Inputs are: the keys list to search for duplicates
//    Input type: an object arg containing a string
// Outputs are: the list of keys which are duplicated
//    Output type: config datasets failing the validation
//
// Creator: Cyrille
// Maintainer:
// Version:   0.9
// Support: Sweagle version >= 3.11

// VARIABLES DEFINITION
// Store all the config datasets
var superCDS = {};
// Root node string used to concatenate all CDS in superCDS
var rootNode = "";
// Define keywords in key name that defines a password
var keyNames = [];
// Defines if error must include full path of key found
var includePath = true;
// Defines the max number of errors to return
var maxErrorDisplay = 3;
var errorFound = false;
var errors = [];
var description = '';
// Define the path 
var pathSeparator = "/";

// HANDLERS
// Inputs parser and checker
// Input values in object notation
// Checking the assigned metadasets and parse the node name from input values in object notation
if (arg!=null && cds!=null){
  for (var i=0; i<cds.length; i++){
    rootNode = Object.keys(cds[i])[0];
    superCDS[rootNode] = cds[i][rootNode];
  }
  keyNames=objFormat(arg.trim());
} else {
  errorFound=true;
  errors.push("ERROR: No inputs provided! Please provide at least one arg in object notation.");
}

//MAIN
// here we call our function with different search terms
for (var i= 0; i < keyNames.length; i++) {
  if (keyNames[i] !== "") {
    var myValue = getKeyValueByName(superCDS, keyNames[i]);
    // If found, check if these value exists for same key in all instances
    if (myValue != "ERROR: NOT FOUND") { checkKeyValueExists(superCDS, keyNames[i], myValue, ''); }
  }
}

if (errors.length > 0) {
  errorFound = true;
  if (errors.length < maxErrorDisplay) { description = "ERRORS: " + errors.join(', '); }
  else { description = "ERRORS: only first "+maxErrorDisplay+" errors are displayed:" + errors.join(', '); }
} else { description = "Validation passed successfully"; }

return {description: description, result:!errorFound};

// FONCTIONS LIST
// Parse the object notation: check upon against the RegEx format
function objFormat(obj) {
  var matches = ""; 
  var index = "";
  var keysList = [];
  // {"keyNames" : ["key1","key2","key3"]}
  var jsonRegex = /^\{/gm;
  // <keyNames>
  //		<keyName>key1</keyName>
  //		<keyName>key2</keyName>
  //		<keyName>key3</keyName>
  // </keyNames>
  var xmlRegex = /\<.*\>(.*?)<\/.*\>/gm;
  // keyNames:
  //	-key1 
  //	-key2 
  //	-key3
  var yamlRegex = /.*\-(.*?)$/gm;
  // JSON
  if (jsonRegex.test(obj)) {
    matches = JSON.parse(obj);
    keysList = matches.keyNames;
    return keysList;
  }
  // XML
  else if (xmlRegex.test(obj)) {
    matches = Array.from(obj.matchAll(xmlRegex));
    for (index in matches) {keysList.push(matches[index][1]);}
    return keysList;
  }
  // YAML
  else if (yamlRegex.test(obj)) {
    matches = Array.from(obj.matchAll(yamlRegex));
    for (index in matches) {keysList.push(matches[index][1]);}
    return keysList;
   }
// Unexpected Inputs
  else {
    errorFound=true;
    errors.push("ERROR: Inputs unexpected!, the arg object must contains an array of strings");
  }
}

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
      checkKeyValueExists(mds[item], keyname, keyvalue, path+item+pathSeparator);
    } else {
      // check if the key & value equals to the search term
      if (item === keyname && mds[item] === keyvalue) { errors.push("Key: "+path+item+" contains same value: "+keyvalue); }
    }
  }
}
