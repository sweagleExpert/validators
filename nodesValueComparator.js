// description: Compare 2 nodes to check that some values are identical and others are different

// nodesValueComparator.js
// Inputs are
//    - 2 nodes to compare (path to the node in the form of an array)
// Creator:   Dimitris for customer Demo (from Stefanos envComparator code)
// Version:   1.2 - New code format
//
var rootName = Object.keys(metadataset)[0];
var argArr = arg.split(',');
//console.log ("arg0="+argArr[0]);
//console.log ("arg1="+argArr[1]);
var fromNode=[rootName,"cluster","nodes",argArr[0]];
var toNode=[rootName,"cluster","nodes",argArr[1]];
var sameValues = [ "containerRuntimeVersion", "kernelVersion", "kubeletVersion", "kubeProxyVersion", "osImage",
                  "failure-domain.beta.kubernetes.io/region", "failure-domain.beta.kubernetes.io/zone", "Port" ];
var diffValues = [ "bootID", "machineID", "podCIDR" ];

// Defines the max number of errors to return
var maxErrorDisplay = 5;
var errorFound= false;
var errors = [];
var description = '';

var fromName = fromNode[fromNode.length-1];
var toName = toNode[toNode.length-1];
var fromSubsetFlat = {};
flattenObject( getSubset(metadataset,fromNode), fromSubsetFlat );
var toSubsetFlat = {};
flattenObject( getSubset(metadataset,toNode), toSubsetFlat );

for (var i = 0 ; i < sameValues.length; i++ ) {
    if ( fromSubsetFlat[sameValues[i]] !== toSubsetFlat[sameValues[i]] ) {
        errors.push("## Value must be the same for "+sameValues[i]);
        if (errors.length == maxErrorDisplay) { break; }
    }
}

for (var i = 0 ; i < diffValues.length; i++ ) {
    if ( fromSubsetFlat[diffValues[i]] === toSubsetFlat[diffValues[i]] ) {
        errors.push("## Value must not be the same for "+diffValues[i]);
        if (errors.length == maxErrorDisplay) { break; }
    }
}

if (errors.length > 0) {
  errorFound = true;
  if (errors.length < maxErrorDisplay) { description = "ERRORS: " + errors.join(' '); }
  else { description = "ERRORS: only first "+maxErrorDisplay+" errors are displayed:" + errors.join(' '); }
} else { description = "Validation passed successfully"; }

return {description: description, result:!errorFound};


// Return the subset of a metadataset based on path provided as array
function getSubset(subset,path) {
  // we loop through all provided arguments (= nodeNames in the path) and check if the path exist
  // when we get to the last argument we return whole metadataset at that last nodeName.
  for (var i = 0; i < path.length; i++) {
    // check if path is valid and if so store all data in subset
  	if (subset.hasOwnProperty(path[i]) === true) { subset = subset[path[i]]; }
  	else { return false; } // Path not found
  }
  return subset;
}

function flattenObject (node,flatObject) {
    for (var item in node) {
        if (typeof (node[item]) === "object") {
            flattenObject(node[item],flatObject);
        } else {
            if (sameValues.includes(item) || diffValues.includes(item)) {
                flatObject[item] = node[item];
            }
        }
    }
}
