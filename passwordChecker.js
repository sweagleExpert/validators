// description: Check if sensitive values are encrypted or replaced by tokens
// passwordChecker.js
//
// Inputs are: the key names list containing senstive values
//    Input type: an object arg containing a list of strings arrays
//
// Creator: Dimtris
// Maintainer: Cyrille
// Version:   1.8
// Support: Sweagle version >= 3.11

// VARIABLES DEFINITION
// Store all the config datasets
var superCDS = {};
// Root node string used to concatenate all CDS in superCDS
var rootNode = "";
// Define keywords in key name that defines a password
var keyNamesWithPasswordValues = [];
// Define key names to exclude from the research
var exceptionList = [];
// Defines if error must include full path of key found
var includePath = true;
// Defines the max number of errors to return
var maxErrorDisplay = 3;
var errorFound = false;
var errors = [];
var description = '';
// Define the token syntax for key value
var tokenPrefix = "@@";
// Define the path 
var pathSeparator = "/";

// HANDLERS
// Inputs parser and checker
  // Input values in object notation
  // Checking the assigned cds and parse the node name from input values in object notation
  if (arg!=null && cds!=null){
    for (var i=0; i<cds.length; i++){
      rootNode = Object.keys(cds[i])[0];
      superCDS[rootNode] = cds[i][rootNode];
    }
    keyNamesWithPasswordValues=objFormat(arg.trim());
  } else {
    errorFound=true;
    errors.push("ERROR: No inputs provided! Please provide at least one arg in object notation.");
  }

// MAIN
// here we call our function with different search terms
for (var i= 0; i < keyNamesWithPasswordValues.length; i++) {
  searchSubstring(superCDS, keyNamesWithPasswordValues[i].toLowerCase(), [], 0, pathSeparator);
}

// Return the list of all errors trapped
if (errorFound) {
  if (errors.length < maxErrorDisplay) { description = "ERRORS: " + errors.join(' '); }
  else { description = "ERRORS: only first "+maxErrorDisplay+" errors are displayed:" + errors.join(' '); }
} else { description = "Validation passed successfully"; }

return {description: description, result:!errorFound};

 // FONCTIONS LIST
// Parse the object notation: check upon against the RegEx format
function objFormat(obj) {
  var matches = ""; 
  var index = "";
  // "password", This is already handled by "pass" below
  //  {
  //    "keyNames" : ["pass","pwd","secret"],
  //    "exceptionList" : ["KEYNAME"]
  //  }
  var jsonRegex = /^\{/gm;
  // <keyNames>
  //		<keyName>pass</keyName>
  //		<keyName>pwd</keyName>
  //		<keyName>secret</keyName>
  // </keyNames>
  var xmlRegex = /\<.*\>(.*?)<\/.*\>/gm;
  // keyNames:
  //	-pass 
  //	-pwd 
  //	-secret
  var yamlRegex = /.*\-(.*?)$/gm;
  // JSON
  if (jsonRegex.test(obj)) {
    matches = JSON.parse(obj);
    keyNamesWithPasswordValues = matches.keyNames;
    exceptionList = matches.exceptionList;
    return keyNamesWithPasswordValues;
  }
  // XML
  else if (xmlRegex.test(obj)) {
    matches = Array.from(obj.matchAll(xmlRegex));
    for (index in matches) {keyNamesWithPasswordValues.push(matches[index][1]);}
    return keyNamesWithPasswordValues;
  }
  // YAML
  else if (yamlRegex.test(obj)) {
    matches = Array.from(obj.matchAll(yamlRegex));
    for (index in matches) {keyNamesWithPasswordValues.push(matches[index][1]);}
    return keyNamesWithPasswordValues;
   }
// Unexpected Inputs
  else {
    errorFound=true;
    errors.push("ERROR: Inputs unexpected!, the arg object must contains an array of strings");
  }
}

/**
 * searchSubsting function searches the whole cds to find keys that include a given substring
 * and checks if their values is protected as sensitive data
 *
 * cds must be the given config dataset,
 * searchKey must be the string we want to check in the keys,
 */
function searchSubstring (cds, searchKey, prefix, level, pathSeparator) {
  for (var item in cds) {
    // get out if we already reach max nb of errors to display
    if (errors.length >= maxErrorDisplay) { break; }
    // check if the key has a value or points to an object
    if  (typeof (cds[item]) === "object") {
      // if value is an object call recursively the function to search this subset of the object
      prefix[level] = item;
      searchSubstring (cds[item], searchKey, prefix, level+1, pathSeparator);
    } else {
      // check if the key contains the search term
      if (item.toLowerCase().includes(searchKey)) {
        // check if not in exception list
        var exception = false;
        for(var exc=0; exc < exceptionList.length; exc++) {
          if (item.toLowerCase() === exceptionList[exc].toLowerCase()) { exception=true; break; }
        }
        if (exception === false) {
            // check if password is not encrypted and is not a token
            if  (!( cds[item] === "..." || cds[item].startsWith(tokenPrefix) )) {
              errorFound = true;
              var pre=prefix[0];
              for (var i=1; i<level;i++) { pre = pre + pathSeparator + prefix[i]; }
              if (includePath) { errors.push("## key "+pre+pathSeparator+item+" is not encrypted"); }
              else { errors.push("## key "+item+" is not encrypted"); }
            }
        }
      }
    }
  }
}
