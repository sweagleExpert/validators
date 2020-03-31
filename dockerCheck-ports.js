// description: Check if docker ports respect defined rules
// - not declared multiple time in service ports
// - ports defined in label and services should be in sync

// dockerCheck-ports.js
// Creator:   Dimitris
// Version:   1.0 - First
//
var servicesNodeName = "services";
var labelsToSearch = ["deploy/labels/com.docker.lb.port"];
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
            var labelPort = "";
            var servicePort = "";
            // First, check if label ports exists
            for (var i=0; i<labelsToSearch.length; i++) {
                //console.log("labelsToSearch="+labelsToSearch[i]);
                labelPort = getValueByPath(servicesSubset[item], labelsToSearch[i], "/");
                //console.log("labelPort="+labelPort);
                if (labelPort === "ERROR: NOT FOUND") {
                    labelPort = "";
                    errorFound = true;
                    errors.push("*** For service ("+item+"): Label ("+labelsToSearch[i]+") not Found");
                } else if (labelPort === "ERROR: DUPLICATES") {
                    labelPort = "";
                    errorFound = true;
                    errors.push("*** For service ("+item+"): Label ("+labelsToSearch[i]+") is found more than once");
                } else {
                  labelPort = labelPort.substring(labelPort.indexOf('=')+1)
                }
            }
            // Second, check if service ports exists
            servicePort = getSubsetByName(servicesSubset[item], "ports");
            //console.log("servicePort="+servicePort);
            if (servicePort === "ERROR: NOT FOUND") {
                servicePort = "";
                errorFound = true;
                errors.push("*** For service ("+item+"): service ports not Found");
            }
            // Third, check if both values are equals
            if (labelPort !== "" && servicePort !== "" && servicePort !== labelPort) {
              errorFound = true;
              errors.push("*** For service ("+item+"): label ports ("+labelPort+") is different than service port("+servicePort+")");
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
  for (var item in subset) {
    if (item.match("^"+pathSteps[i]+"=.*$")) {
        subset = item;
        nbFounds = nbFounds+1;
    }
  };
  if (nbFounds == 0) { return "ERROR: NOT FOUND"; }
  if (nbFounds > 1) { return "ERROR: DUPLICATES"; }
  return subset;
}
