// description: Compare 2 nodes to check that they have the same keys

// nodesKeyComparator.js
// Compare 2 nodes to check that they have the same keys
// Important: Values are not compared !
// Inputs are
//    - 2 nodes to compare (path to the node in the form of an array)
// Creator:   Dimitris for customer POC
// Version:   1.2 - New code format
//
var rootName = Object.keys(metadataset)[0];
var fromNode=[rootName,"cluster","nodes","node-46cf"];
var toNode=[rootName,"cluster","nodes","node-rgpf"];

// Defines if error must include full path of key found
var includePath = true;
// Defines the max number of errors to return
var maxErrorDisplay = 5;
var errorFound = false;
var errors = [];
var description = '';

var fromSubset = getSubset(metadataset,fromNode);
var toSubset = getSubset(metadataset,toNode);
var fromName = fromNode[fromNode.length-1];
var toName = toNode[toNode.length-1];

var sizeFromSubset = Object.keys(fromSubset).length;
var sizeToSubset = Object.keys(toSubset).length;

// Check if any path were not found
if (sizeFromSubset == 0) { return {description: "### ERROR: Node "+fromName+" not found", result: false}; }
if (sizeToSubset == 0) { return {description: "### ERROR: Node "+toName+" not found", result: false}; }

compareSubsets(fromSubset, toSubset, toName, fromNode, fromNode.length, "/");
compareSubsets(toSubset, fromSubset, fromName, toNode, toNode.length, "/");

if (errorFound) {
  if (errors.length < maxErrorDisplay) { description = "ERRORS: " + errors.join(' '); }
  else { description = "ERRORS: only first "+maxErrorDisplay+" errors are displayed:" + errors.join(' '); }
} else { description = "Validation passed successfully"; }

return {description: description, result:!errorFound};


// Return the subset of a metadataset based on path provided as array
function getSubset(subset, args) {
  // we loop through all provided arguments (= nodeNames in the path) and check if the path exist
  // when we get to the last argument we return whole metadataset at that last nodeName.
  for (var i = 0; i < args.length; i++) {
    // check if path is valid and if so store all data in subset
  	if (subset.hasOwnProperty(args[i]) === true) { subset = subset[args[i]]; }
  	else { return false; } // Path not found
  }
  return subset;
}

function compareSubsets(subset1, subset2, name, prefix, level, pathSeparator) {
  for (var item in subset1) {
    if (errors.length >= maxErrorDisplay) { break; }
    if (!(subset2.hasOwnProperty(item))) {
      errorFound = true;
      var pre=prefix[0];
      for (var i=1; i<level;i++) { pre = pre + pathSeparator + prefix[i]; }
      if (includePath) { errors.push("## Node "+name+" doesn't have property "+pre+pathSeparator+item); }
      else { errors.push("## Node "+name+" doesn't have property "+item); }
    } else if (typeof(subset1[item]) === "object") {
      // If we are on a node call recursively the function
      prefix[level] = item
      compareSubsets (subset1[item], subset2[item], name, prefix, level+1, pathSeparator);
    }
  }
}
