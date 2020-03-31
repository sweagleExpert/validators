// description: Compare 2 list of nodes names (case insensitive)

// listComparator.js
// Creator:   Dimitris for customer POC
// Version:   1.0 - First
//
var list1Node = "icms";
var list2Node = "vcenter";

var errorFound = false;
var errors = [];
var description = '';

var list1Subset = getValueByName(metadataset, list1Node);
var list2Subset = getValueByName(metadataset, list2Node);
if (list1Subset == "ERROR: NOT FOUND" || list2Subset == "ERROR: NOT FOUND") {
    return {description: "*** ERROR: list not found ", result: false};
}

var list1Array = mapSubsetToArray(list1Subset);
var list2Array = mapSubsetToArray(list2Subset);

for(var i= 0; i < list1Array.length; i++)
{
  if(!list2Array.includes(list1Array[i])) {
      errorFound = true;
      errors.push("*** item ("+list1Array[i]+") from "+ list1Node +" doesn't exists in "+list2Node);
  }
}
for(var i= 0; i < list2Array.length; i++)
{
  if(!list1Array.includes(list2Array[i])) {
      errorFound = true;
      errors.push("*** item ("+list2Array[i]+") from "+ list2Node +" doesn't exists in "+list1Node);
  }
}

description = errors.join(', ');
return {description: description, result:!errorFound};

// Return subset of mds based on node name
function getValueByName(mds, name) {
  var value = "ERROR: NOT FOUND";
  for (var item in mds) {
    // check if the key equals to the search term
    if (item === name ) {
      return mds[item];
    }
    // check if the key points to an object
    if  (typeof (mds[item]) === "object") {
      // if value is an object call recursively the function to search this subset of the object
      value = getValueByName(mds[item], name);
      // if key was found, returns it
      if (value != "ERROR: NOT FOUND") { return value; }
      // if not, continue the loop
    }
  }
  return value;
}

// Returns a subset node list in array format
function mapSubsetToArray( subset ) {
    var returnedArray = [];
    for (var item in subset) {
      if (typeof (subset[item]) === "object") {
        returnedArray.push(item.toLowerCase());
        // if case sensitive is important, use
        //returnedArray.push(item);
      }
    }
    return returnedArray;
}
