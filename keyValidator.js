
/**
 * Check if a key has a certain value.
 */
 
/**
 * var keysWithWantedValues is an object that holds the keys that we want to search with their wanted values in an array
 */
var keysWithWantedValues = {
  "dependency.type" : ["exact", "minimal"],
  "dependency.level" : ["enforced", "mimimum"]
};


// searches is a local object that holds results for each search
var searches = {};
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
        if  (mds[item] === searchValue) {
          searches[searchKey][searchValue] = true;
          break;
        }
      }
    }
  }
}
// here we call our function
for (var obj in keysWithWantedValues) {
  for (var i=0; i < keysWithWantedValues[obj].length; i++) {
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
      return false;
    }
  }
}
return true;