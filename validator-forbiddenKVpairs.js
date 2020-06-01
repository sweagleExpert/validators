// description: This validator searches the primary CDS for forbidden key-value pairs (contained in the secondary CDS)
// validator-forbiddenKVpairs.js
//
//
// Creator: 
// Maintainer: Cyrille
// Version:   1.0
// Support: Sweagle version >= 3.11

// VARIABLES DEFINITION
// Store all the config datasets
var superCDS = {};
// Root node string used to concatenate all CDS in superCDS
var rootNode = "";
var res = true;
var list = [];
// Defines the variables for error
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
  } else {
    errorFound=true;
    errors.push("ERROR: No inputs provided! Please provide at least one arg in object notation.");
  }

// MAIN
for (var attr in superCDS.forbiddenKVpairs) {
  if (hasOwnDeepPropertyWithVal(rootNode, attr, superCDS.forbiddenKVpairs[attr])) {
    res = false;
    list.push(attr + superCDS.forbiddenKVpairs[attr]);

  }
}

// Return the list of all errors trapped
if (errorFound) {
  if (errors.length < maxErrorDisplay) { description = "ERRORS: " + errors.join(' '); }
  else { description = "Contains forbidden KV pairs"; }
} else { description = "Forbidden KV pairs do not exist"; }

return {description: description, result:!errorFound};

 // FONCTIONS LIST
// here we call our function with different search terms
function hasOwnDeepPropertyWithVal(obj, forbiddenKey, forbiddenValue) {
  if (typeof (obj) === 'object' && obj !== null) {
    if (obj.hasOwnProperty(forbiddenKey) && obj[forbiddenKey] === forbiddenValue) {
      return true;
    }
    for (var key in obj) {
      if (obj.hasOwnProperty(key) && hasOwnDeepPropertyWithVal(obj[key], forbiddenKey, forbiddenValue)) {
        return true;
      }
    }
  }
  return false;
}