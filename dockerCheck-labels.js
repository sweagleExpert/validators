// description: Check if docker labels contains required items 1 time only !

// dockerCheck-labels.js
// Creator:   Dimitris
// Version:   1.0 - First
//
var servicesNodeName = "services";
var labelsToSearch = ["deploy/labels/com.docker.ucp.access.label"];
var errorFound = false;
var errors = [];
var description = '';
var result="";

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
            //console.log("*** service ("+item+") is in exception list");
            for (var i=0; i<labelsToSearch.length; i++) {
                //console.log("param="+paramToSearch[i]);
                result = getValueByPath(servicesSubset[item], labelsToSearch[i], "/");
                if (result === "ERROR: NOT FOUND") {
                    errorFound = true;
        			errors.push("*** For service ("+item+"): Label ("+labelsToSearch[i]+") not Found");
                } else if (result === "ERROR: DUPLICATES") {
                    errorFound = true;
        			errors.push("*** For service ("+item+"): Label ("+labelsToSearch[i]+") is found more than once");
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
// If not found, then "ERROR: NOT FOUND" is returned
// If duplicates, then "ERROR: DUPLICATES" is returned
function getValueByPath(mds, path, pathSeparator) {
  var pathSteps =  path.split(pathSeparator);
  var subset = mds;
  var nbFounds = 0;
  for (var i = 0; i < pathSteps.length-1; i++ ) {
    if (subset.hasOwnProperty(pathSteps[i])) {
      subset = subset[pathSteps[i]];
    } else {
      return "ERROR: NOT FOUND";
    }
  }
  //console.log("label="+pathSteps[i]);
  for (var item in subset) {
      if (item.match("^"+pathSteps[i]+"=.*$")) {
          subset = item;
          nbFounds = nbFounds+1;
      }
  };
  //console.log("found="+nbFounds);
  if (nbFounds == 0) { return "ERROR: NOT FOUND"; }
  if (nbFounds > 1) { return "ERROR: DUPLICATES"; }
  return subset;
}
