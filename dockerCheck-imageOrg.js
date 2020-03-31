// description: Check if docker image path is correct

// dockerCheck-imageOrg.js
// Creator:   Dimitris
// Version:   1.1 - Add exception svcExceptionList

var servicesNodeName = "services";
var imageExpectedOrg = "/release/" ;
var keyToSearch = "image";
var errorFound = false;
var errors = [];
var description = '';

// Get list of exceptions
var svcExceptionList = getSubsetByName(metadataset, "services-exceptions");

// Get list of services
var servicesSubset = getSubsetByName(metadataset, servicesNodeName);
if (servicesSubset == "ERROR: NOT FOUND") {
    errorFound = true;
    errors.push("*** No service defined !");
} else {
    for (var item in servicesSubset) {
        //console.log("service="+item);
        if (! svcExceptionList.hasOwnProperty(item)) {
          if (! checkKeyValuesByName(servicesSubset[item], keyToSearch, imageExpectedOrg)) {
            errorFound = true;
            errors.push("*** For service ("+item+"): image doesn't have 'release' organisation !");
          }
        }
    }
}

description = errors.join(', ');
return {description: description, result:!errorFound};


// Return a subset of existing mds
// If not found, then "ERROR: NOT FOUND" is returned
function getSubsetByName(mds, name) {
  var value = "ERROR: NOT FOUND";
  for (var item in mds) {
    // check if the key equals to the search term
    if (item === name ) {
      return mds[item];
    }
    // check if the key points to an object
    if  (typeof (mds[item]) === "object") {
      // if value is an object call recursively the function to search this subset of the object
      value = getSubsetByName(mds[item], name);
      // if key was found, returns it
      if (value != "ERROR: NOT FOUND") { return value; }
      // if not, continue the loop
    }
  }
  return value;
}

// Check that values of all key with specified names matches a regex
// nodes are not taken into account
// If not found, then "ERROR: NOT FOUND" is returned
function checkKeyValuesByName (mds, keyName, regex) {
  var found = false;
  for (var item in mds) {
    // check if the key has a value or points to an object
    if  (typeof (mds[item]) === "object") {
      // if value is an object call recursively the function to search this subset of the object
      found = checkKeyValuesByName(mds[item], keyName, regex);
    } else {
      // check if the key match expected regex
      if (item === keyName ) {
        if (! mds[item].match(regex)) {
          return false;
        };
        return true
      }
    }
  }
  return found;
}
