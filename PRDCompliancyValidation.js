// description: Check several PROD compliancy rules
// Version:   1.1 - For Sweagle 2.23, handles new error format in JSON

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
var errorFound = false;
var errorMsg = "";

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
    } else {
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
        } else {
            if (mds[item].includes(substring)){
                errorFound = true;
                errorMsg = errorMsg+"ERROR: key "+item+" has a forbidden value: "+mds[item]+".\n"
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
    } else {
      // check if the key equals the search term
      if (item === searchKey) {
        allKeysFound[searchKey] = true;
        // check if the value equals the search term
        if  (mds[item] !== searchValue){
          errorFound = true;
          errorMsg = errorMsg+"ERROR: required key "+item+" has value "+mds[item]+" instead of expected "+searchValue+".\n"
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

if (unwantedValues.length>0) {
  for (var i=0; i<unwantedValues.length; i++  ){
      prdSubstring(metadataset, unwantedValues[i]);
  }
}

for (var obj in keyNamesWithKeyValues) {
  searchKeys(metadataset, obj, keyNamesWithKeyValues[obj]);
}

for ( var obj in searches) {
  if (!(searches[obj]))
    errorFound = true;
    errorMsg = errorMsg+"ERROR: required key "+obj+" was not found.\n"
}
for ( var obj in allKeysFound) {
  if (!(allKeysFound[obj])) {
    errorFound = true;
    errorMsg = errorMsg+"ERROR: required key "+obj+" was not found.\n"
  }
}
return {"result":!errorFound,"description":errorMsg};
