/** validates that mandatory keys exists and are not empty
 * and no typical development settings are still in use
 */
 
var mandatoryKeys = ["regionalZone","allowHTTPStraffic"];
var unwantedValues = ["root","https://localhost","127.0.0.1"]; 
var uniqueValues = ["db.schema"];

var searches = {};
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
 
/**
 * return the result
 */
 
if (errorFound) {
  return false;
}
for ( var obj in searches) {
  if (!(searches[obj]))
    return false;
}
return true;
