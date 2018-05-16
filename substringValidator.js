
/**
 * Check if a key that contains a substring has a value that contains specific substring.
 */


 var keyNamesWithKeyValues = {
  "cluster-name" : "cluster",
  "env.db.schema" : "mdm"
};
 
// errorFound is a local variable that founds errors
var searches = {};
var errorFound = false;
/**
 * searchSubsting function searches the whole metadataset to find keys that include a given substring 
 * and checks if their values also include a given substring
 * mds must be the given metadataset,
 * searchKey must be the string we want to check in the keys,
 * searchValue must be the string we want check in the values
 */
function searchSubstring (mds, searchKey, searchValue) {

  if (searches.hasOwnProperty(searchKey) === false) {
    searches[searchKey] = false;
  }
  for (var item in mds) {
    // check if the key has a value or points to an object
    if  (typeof (mds[item]) === "object") {
      // if value is an object call recursively the function to search this subset of the object
      searchSubstring (mds[item], searchKey, searchValue);
    }
    else{
      // check if the key contains the search term
      if (item.includes(searchKey)) {
        searches[searchKey] = true;
        // check if the value contains the given subvalue
        if  (!(mds[item].includes(searchValue))){
          errorFound = true;
          break;
        }
      }
    }
  }
}
// here we call our function with different search terms and values

for (var obj in keyNamesWithKeyValues) {
  searchSubstring(metadataset, obj, keyNamesWithKeyValues[obj]);
}

//searchSubstring(metadataset,"eol.date", "");
/**
 * errorsFound now is the number of errors found. 
 * It returns true when there are no errors (no values found without the given search value)
 * It returns false when at least one error is found 
 */
if (errorFound) {
  return false;
}
for ( var obj in searches) {
  if (!(searches[obj])) {
    return false;
  }
}
return true;