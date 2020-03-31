// description: Check if all keys of a path + subpaths are included in another path + subpaths
// Version:   1.0 - First release
var errorFound = false;
var errors = [];
var description = '';
var searches = {};
var sourceToValidate="NAME_OF_SOURCE_NODE_TO_CHECK";
var isIncludedIn="NAME_OF_TARGET_NODE_WHERE_KEYS_MUST_BE";

// Fill the array of keys to search from source path
var sourceSubset = getValueByName(metadataset, sourceToValidate)
var sourceKeys = {}
sourceKeys = flattenSubset (sourceSubset, sourceKeys)

// here we check if all keys exist in target subset
var targetSubset = getValueByName(metadataset, isIncludedIn)
for (var key in sourceKeys) {
  findObjectKeys(targetSubset, key);
}
/**
 * Searches is an object with the outcome of the search for each key
 * It returns true when there are no errors (all keys where found inside metadataset)
 * It returns false when at least one key was not found
 */
for ( var obj in searches) {
  if (!(searches[obj])) {
    errorFound = true;
    errors.push("*** ERROR: required parameter ("+obj+"): was not found");
  }
}

if (errorFound) {
  description = errors.join(', ');
  return {description: description, result:!errorFound};
} else {
  return {"result":!errorFound,"description":"Validation passed successfully"};
}


/**
* mds is the subset to seach in
* searchKey is the string we want to check in the keys
*/
function findObjectKeys(mds, searchKey) {
  if (searches.hasOwnProperty(searchKey) === false) {
    searches[searchKey] = false;
  }
  for (var item in mds) {
    // check if the key has a value or points to an object
    if  (typeof (mds[item]) === "object") {
      // if value is an object call recursively the function to search this subset of the object
      findObjectKeys (mds[item], searchKey);
    }
    else{
      // check if the key equals to the search term
      if (item === searchKey ) {
        searches[searchKey] = true;
        break;
      }
    }
  }
}

// Return the value of a specific key based on its name
// If the key is a node, then it returns a subset
// If multiple keys with same name, the first value found is returned
// If not found, then "ERROR: NOT FOUND" is returned
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

// Return only keys+values of a metadataset, extracting all nodes object
// the extract format is a flat list
function flattenSubset(mds, flatSubset) {
  for (var item in mds) {
      if (typeof (mds[item]) === "object") {
          flatSubset = flattenSubset(mds[item], flatSubset);
      } else {
          flatSubset[item] = mds[item];
      }
  }
  return flatSubset;
}
