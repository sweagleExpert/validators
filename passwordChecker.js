// description: Check if sensitive values are encrypted or replaced by tokens
// passwordChecker.js
//
// Inputs are: no inputs
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
var keyNamesWithPasswordValues=["pass","pwd","secret"];
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

for (var i=0; i<cds.length; i++){
  rootNode = Object.keys(cds[i])[0];
  superCDS[rootNode] = cds[i][rootNode];
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


/**
 * searchSubsting function searches the whole metadataset to find keys that include a given substring
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
