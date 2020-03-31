// description: Check if specific keys list has specific values
// Version:   1.2 - Correct error that validation stopped after first value found

/**
 * var keysWithWantedValues is an object that holds the keys that we want to search with their wanted values in an array
 */
var keysWithWantedValues = {
  "memory" : ["2G"],
    "cpus" : ["2"]
};


// searches is a local object that holds results for each search
var searches = {};
var found = {};
var errorFound = false;
var errorMsg = "";
/**
 * validateKey function searches the whole metadataset to find the given searchkey and validate its value.
 * mds must be the given metadataset, searchKey must be the key we want to check, searchValue must be the correct value
 */
function validateKey (mds, searchKey, searchValue) {
  if (searches.hasOwnProperty(searchKey) === false) {
    searches[searchKey] = {};
    searches[searchKey][searchValue] = false;
  }
  else {
    if (searches[searchKey].hasOwnProperty(searchValue) === false) {
      searches[searchKey][searchValue] = false;
    }
  }
  for (var item in mds) {
    // check if the key has a value or points to an object
    if  (typeof (mds[item]) === "object") {
      // if value is an object call recursively the function to search this subset of the object
      validateKey (mds[item], searchKey, searchValue);
    }
    else{
      // check if the key equals to the search term
      if (item === searchKey ) {
        // check if the value equals to the given value
        if  (mds[item] === searchValue && found[searchKey] === false) {
          searches[searchKey][searchValue] = true;
        } else {
          searches[searchKey][searchValue] = false;
          found[searchKey]= true;
          break;
        }
      }
    }
  }
}
// here we call our function
for (var obj in keysWithWantedValues) {
  for (var i=0; i < keysWithWantedValues[obj].length; i++) {
    found[obj] = false;
    validateKey(metadataset, obj, keysWithWantedValues[obj][i]);
  }
}
/**
 * It returns true when there are no errors (no keys were found with wrong values)
 * It returns false when at least one error is found
 */
for (obj in searches) {
  for (var key in searches[obj]){
    if (searches[obj][key] === false) {
      errorFound = true;
      errorMsg = errorMsg+"ERROR: key "+obj+" doesn't have expected value "+key+".\n"
    }
  }
}

if (errorFound) {
  return {"result":!errorFound,"description":errorMsg};
} else {
  return {"result":!errorFound,"description":"Validation passed successfully"};
}
