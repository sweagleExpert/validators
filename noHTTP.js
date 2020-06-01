// description: Check if no URL is used with HTTP (only HTTPS allowed)
// noHTTP.js
//
// Inputs are: the key names list containing senstive values
//    Input type: an object arg containing a list of strings arrays
//
// Creator:   Dimitris Finas for customer POC
// Maintainer: Cyrille
// Support: Sweagle version >= 3.11

// VARIABLES DEFINITION
// Store all the config datasets
var superCDS = {};
// Root node string used to concatenate all CDS in superCDS
var rootNode = "";
// Define the search value
var searchValue = "http:/";
// Define key names to exclude from the research
var exceptionList = [];
// Defines if error must include full path of key found
var includePath = false;
// Defines the max number of errors to return
var maxErrorDisplay = 5;
var errorFound = false;
var errors = [];
var description = '';

// HANDLERS
// Inputs parser and checker
  // Input values in object notation
  // Checking the assigned metadasets and parse the node name from input values in object notation
  if (arg!=null && cds!=null){
    for (var i=0; i<cds.length; i++){
      rootNode = Object.keys(cds[i])[0];
      superCDS[rootNode] = cds[i][rootNode];
    }
    exceptionList=objFormat(arg.trim());
  } else {
    errorFound=true;
    errors.push("ERROR: No inputs provided! Please provide at least one arg in object notation.");
  }

// MAIN
searchSubstringWithPath(superCDS, searchValue.toLowerCase(), [], 0, "/");

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
  //    "exceptionList" : ["KEYNAME"]
  //  }
  var jsonRegex = /^\{/gm;
  // <exceptionList>
  //		<exception>KEYNAME</exception>
  // </exceptionList>
  var xmlRegex = /\<.*\>(.*?)<\/.*\>/gm;
  // exceptionList:
  //	-KEYNAME 
  var yamlRegex = /.*\-(.*?)$/gm;
  // JSON
  if (jsonRegex.test(obj)) {
    matches = JSON.parse(obj);
    exceptionList = matches.exceptionList;
    return exceptionList;
  }
  // XML
  else if (xmlRegex.test(obj)) {
    matches = Array.from(obj.matchAll(xmlRegex));
    for (index in matches) {exceptionList.push(matches[index][1]);}
    return exceptionList;
  }
  // YAML
  else if (yamlRegex.test(obj)) {
    matches = Array.from(obj.matchAll(yamlRegex));
    for (index in matches) {exceptionList.push(matches[index][1]);}
    return exceptionList;
   }
// Unexpected Inputs
  else {
    errorFound=true;
    errors.push("ERROR: Inputs unexpected!, the arg object must contains an array of strings");
  }
}

/**
 * searchSubsting function searches the whole config dataset to find keys that include a given substring
 *
 * cds must be the given config dataset,
 * searchKey must be the string we want to check in the keys,
 */
function searchSubstringWithPath (cds, searchValue, prefix, level, pathSeparator) {
  for (var item in cds) {
    // get out if we already reach max nb of errors to display
    if (errors.length >= maxErrorDisplay) { break; }
    // check if the key has a value or points to an object
    if  (typeof (cds[item]) === "object") {
      // if value is an object call recursively the function to search this subset of the object
      prefix[level] = item;
      searchSubstringWithPath (cds[item], searchValue, prefix, level+1, pathSeparator);
    } else {
      // check if the key contains the search term
      if (cds[item].toLowerCase().includes(searchValue)) {
        var exception = false;
        for(var exc=0; exc < exceptionList.length; exc++) {
          if (item.toLowerCase() === exceptionList[exc].toLowerCase()) { exception=true; break; }
        }
        if (exception === false) {
            errorFound = true;
            var pre=prefix[0];
            for (var i=1; i<level; i++) { pre = pre + pathSeparator + prefix[i]; }
            if (includePath) { errors.push("## key "+pre+pathSeparator+item+" contains an HTTP:// url value"); }
            else { errors.push("## key "+item+" contains an HTTP:// url value"); };
        }
      }
    }
  }
}
