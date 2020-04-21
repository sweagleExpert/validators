//This validator checks for duplicates across multiple CDS.
var res = true;
var arguments = JSON.parse(arg);
var arrays = {};
var result = []
for (var i in arguments) {
  arrays[arguments[i]] = [];
}

function hasDuplicates(array) {
  if ((new Set(array)).size !== array.length) {
    result.push(index);
    return true;
  }
  return false;
}

function hasOwnDeepProperty(obj, searchkey) {
  if (typeof (obj) === 'object' && obj !== null) {
    if (obj.hasOwnProperty(searchkey)) {
      arrays[searchkey].push(obj[searchkey]);
    }
    for (var key in obj) {
      if (obj.hasOwnProperty(key)) {
        hasOwnDeepProperty(obj[key], searchkey);
      }
    }
  }
}
//Get all the values first into arrays first
for (var argIndex in arguments) {
  for (var index in metadatasets) {
    hasOwnDeepProperty(metadatasets[index], arguments[argIndex]);
  }
}
//Examine the data gathered for duplicates
for (var index in arrays) {
  if (hasDuplicates(arrays[index], index)) {
    res = false;
  }
}


if (res === true) {
  // console.log("all good", res);
  return { 'result': true, 'description': 'All values are unique' };
} else {
  // console.log("Duplicates", result);
  return { 'result': false, 'description': 'Contain duplicate values' };
}