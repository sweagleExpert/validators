/** example validator to ensure that no typical development settings are still in use
 * 1: validates for a list of keyNames that every MDIkey has a specific value
 * 2: validates that a set of mandatory keys exists and are not empty
 * 3: validates that no MDI key can have one of the values in the list of unwantedValues
 * 4: validates that a list of keyNames can only appear once 
 */
 
var keyNamesWithKeyValues = {
  "envType" : "PRD",
  "envEnabled" : "true"
};
var mandatoryKeys = ["regionalZone","allowHTTPStraffic"];
var unwantedValues = ["root","https://localhost","127.0.0.1"]; 
var uniqueValues = ["db.schema"];

var searches = {};
var allKeysFound = {};
var keysNotFound = false;
var errorFound = false;

/**
* here we define the validation logic to be applied
* mds is the complete set of snapshot data
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

function prdSubstring(mds, substring) {
    for (var item in mds) {
        if (typeof (mds[item]) === 'object') {
            prdSubstring (mds[item], substring);
        }
        else {
            if (mds[item].includes(substring)){
                errorFound = true;
                break;
            }
        }
    }
}

function searchKeys (mds, searchKey, searchValue) {

  if (allKeysFound.hasOwnProperty(searchKey) === false) {
    allKeysFound[searchKey] = false;
  }
  for (var item in mds) {
    // check if the key has a value or points to an object
    if  (typeof (mds[item]) === "object") {
      // if value is an object call recursively the function to search this subset of the object
      searchKeys (mds[item], searchKey, searchValue);
    }
    else{
      // check if the key equals the search term
      if (item === searchKey) {
        allKeysFound[searchKey] = true;
        // check if the value equals the search term
        if  (mds[item] !== searchValue){
          keysNotFound = true;
          break;
        }
      }
    }
  }
}
// here we call the validation functions with different search terms
if (mandatoryKeys.length>0) {
  for (var i = 0; i < mandatoryKeys.length; i++  ) {
    findObjectKeys(metadataset, mandatoryKeys[i]);
  }
}
else{
  return false;
}

if (unwantedValues.length>0) {
  for (var i=0; i<unwantedValues.length; i++  ){
      prdSubstring(metadataset, unwantedValues[i]);
  }
}
else {
  return false;
}
for (var obj in keyNamesWithKeyValues) {
  searchKeys(metadataset, obj, keyNamesWithKeyValues[obj]);
}
 
/**
 * return the result
 */
 
if (errorFound) {
  return false;
}
else if (keysNotFound) {
  return false;
}
for ( var obj in searches) {
  if (!(searches[obj]))
    return false;
}
for ( var obj in allKeysFound) {
  if (!(allKeysFound[obj])) {
    return false;
  }
}
return true;
