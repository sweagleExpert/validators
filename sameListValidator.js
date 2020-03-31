// description: Check that the value of 2 different nodes are the same

// sameListValidator.js
// Creator:   Dimitris Finas for demo environment
// Version:   1.1 - For Sweagle 2.23, handles new error format in JSON
//
var key1=["assignedRelease","webportal1-2.1.2","ui-1.1","json","mi6-options","fields","gadget","optionLabels"]
var key2=["assignedRelease","webportal1-2.1.2","ui-1.1","json","mi6-schema","properties","gadget","enum"]
var errorFound = false;
var errorMsg = "Validation passed successfully";

var key1Sub=getSubset(metadataset, key1);
var key2Sub=getSubset(metadataset, key2);
var key1Array = mapObjectsToArray(key1Sub);
var key2Array = mapObjectsToArray(key2Sub);
//console.log(key1Array);
//console.log(key2Array);

errorFound = !(arraysEqual(key1Array, key2Array));
if (errorFound) { errorMsg = "ERROR: Both list aren't the same"; }

return {"result":!errorFound,"description":errorMsg};


// Function used inside the script
function arraysEqual(a, b) {
  if (a === b) return true;
  if (a == null || b == null) return false;
  if (a.length != b.length) return false;
  for (var i = 0; i < a.length; ++i) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}

// Function to transform last nodes of a branch into array
function mapObjectsToArray(subset) {
    var returnedArray = [];
    for (var item in subset) {
        returnedArray.push(item);
    }
    return returnedArray;
}

// Function to return subset of the metadataset based on path provided in array
function getSubset(mds, args) {
    // keep looping through the provided arguments.
    // when last node is reached, subset contains the data we are looking for
    for (var i = 0; i < args.length; i++) {
	    if (mds.hasOwnProperty(args[i]) === true) {
            // check if path is valid and if so store all data in subset
		    mds = mds[args[i]];
	    } else {
    	    // if not valid return error message
	    	return "ERROR: path not found: " + args[i];
	    }
    }
    return mds;
}
