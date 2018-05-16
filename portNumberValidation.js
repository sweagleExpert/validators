
/**
 * Check if a key that corresponds to a portNumber has a value above a given threshold.
 */
 
 var keysWithThreasholds = {
  "env.core.server.port" : 1024,
  "env.db.port" : 78897
};
 
// errorsFound is a local variable that counts error found
var errorsFound = 0;
/**
 * searchport function searches the whole metadataset to find the given searchkey and compare it with the given threshold
 * mds must be the given metadataset, searchKey must be the key we want to check, threshold must be the numeric limit
 */
function searchport (mds, searchKey, threshold) {
  for (var item in mds) {
    // check if the key has a value or points to an object
    if  (typeof (mds[item]) === "object") {
      // if value is an object call recursively the function to search this subset of the object
      searchport (mds[item], searchKey, threshold);
    }
    else{
      // check if the key equals to the search term
      if (item === searchKey ) {
        // check if the value is not above the given threshold
        if  (!(mds[item].length > 0 && Number(mds[item]) > threshold)) {
          errorsFound = errorsFound + 1;
        }
      }
    }
  }
}
// Here we can call our function with different search terms and thresholds
for (var obj in keysWithThreasholds) {
  searchport(metadataset, obj, keysWithThreasholds[obj]);
}

/**
 * errorsFound now is the number of errors found. 
 * It returns true when there are no errors (no values found below their threshold)
 * It returns false when at least one error is found 
 */
if (errorsFound === 0) {
  return true;  
}
else {
  return false;
}
