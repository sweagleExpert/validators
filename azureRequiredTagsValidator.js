// description : Checks that required tags are present in Azure config file
// azureRequiredTagsValidator.js
//
// Creator: Dimtris
// Version:   1.0
// Support: Sweagle version >= 3.11

// VARIABLES DEFINITION
// Store all the config datasets
var superCDS = {};
// Root node string used to concatenate all CDS in superCDS
var rootNode = "";
// Define key names to exclude from the research
var exceptionList = [];
// Defines if error must include full path of key found
var includePath = true;
// Define the path separator when displaying error message
var pathSeparator = "/";
// Defines the max number of errors to return
var maxErrorDisplay = 5;
var errorFound = false;
var errors = [];
var description = '';


// RULES SPECIFIC VARIABLES
var tagNodeName = "tags" ;
var requiredTags = ["environment", "application", "cost-center"] ;

// HANDLERS to merge all CDS in one
for (var i=0; i<cds.length; i++){
  rootNode = Object.keys(cds[i])[0];
  superCDS[rootNode] = cds[i][rootNode];
}

// MAIN
var tagsSubset= getSubsetByNodeName(superCDS, tagNodeName);
if (tagsSubset == "ERROR: NOT FOUND") {
  return {description: "ERROR: No configuration node '"+tagNodeName+"' found !", result:false};
}
//console.log (tagsSubset);
var tagsList = Object.keys(tagsSubset);
for (var i=0; i<requiredTags.length; i++) {
  if (errors.length >= maxErrorDisplay) { break; }
  if (! tagsList.includes(requiredTags[i]) ) {
    errorFound = true;
    errors.push("## Required tag '"+requiredTags[i]+"' is not found");
  }
}

// Return the list of all errors trapped
if (errorFound) {
  if (errors.length < maxErrorDisplay) { description = "ERRORS: " + errors.join(' '); }
  else { description = "ERRORS: only first "+maxErrorDisplay+" errors are displayed:" + errors.join(' '); }
} else { description = "Validation passed successfully"; }

return {description: description, result:!errorFound};


// FONCTIONS LIST
// Return a specific subset based on its nodename
function getSubsetByNodeName(subset, nodename) {
  var value = "ERROR: NOT FOUND";
  for (var item in subset) {
    // check if the key points to a node
    if (sweagleUtils.checkIsNode(subset[item])) {
      // check if the key equals to the search term
      if (item === nodename ) { return subset[item]; }
      else {
        value = getSubsetByNodeName(subset[item], nodename);
        if ( value != "ERROR: NOT FOUND") { return value; }
      }
    }
  }
  return value;
}
