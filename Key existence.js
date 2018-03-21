// Find out if a certain key exists in the MDs. (For example check if key "ip" exists)


var keyNames = ["dependency.component.name",
             "db.host"];


/**
 * Find if a key matching the first input variable exists.
 */

var searches = {};
/**
* mds must be the given metadataset,
* searchKey must be the string we want to check in the keys
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
// here we call our function with different search terms
for (var i = 0; i < keyNames.length; i++) {
  findObjectKeys(metadataset, keyNames[i]);
}

/**
 * Searches is an object with the outcome of the search for each key
 * It returns true when there are no errors (all keys where found inside metadataset)
 * It returns false when at least one key was not found 
 */
for ( var obj in searches) {
  if (!(searches[obj]))
    return false;
}
return true;