// description: Check if docker limits (cpus and memory) have been defined for each service

// dockerCheck-limits.js
// Creator:   Dimitris
// Version:   1.0 - Add exception list
//
var servicesNodeName = "services";
var paramToSearch = ["deploy.resources.limits.cpus", "deploy.resources.limits.memory"];
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
            for (var i=0; i<paramToSearch.length; i++) {
                //console.log("param="+paramToSearch[i]);
                var result = getValueByPath(servicesSubset[item], paramToSearch[i], ".");
                if (result == "ERROR: NOT FOUND") {
                    errorFound = true;
        			errors.push("*** For service ("+item+"): Limits ("+paramToSearch[i]+") not Found");
                }
            }
        }
    }

}

description = errors.join(', ');
return {description: description, result:!errorFound};


// Return the value of a specific key based on its name
// If the key is a node, then it returns a subset
// If multiple keys with same name, the first value found is returned
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

// Return the value of a specific key based on its complete path
// If the key is a node, then it returns "ERROR: NOT FOUND"
// If not found, then "ERROR: NOT FOUND" is returned
function getValueByPath(mds, path, pathSeparator) {
  var pathSteps =  path.split(pathSeparator);
  var subset = mds;
  for (var i = 0; i < pathSteps.length; i++ ) {
    if (subset.hasOwnProperty(pathSteps[i])) {
      subset = subset[pathSteps[i]];
    } else {
      return "ERROR: NOT FOUND";
    }
  }
  if (typeof (subset) === "object") {
      return "ERROR: NOT FOUND";
  }
  return subset;
}
