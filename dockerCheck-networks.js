// description: Check if docker networks respect rules
// - networks defined in network, service.*.network and label com.docker.lb.network have @@APP_TRI@@@@ENV_CODE@@ value

// dockerCheck-networks.js
// Creator:   Dimitris
// Version:   1.0 - First
//
var servicesNodeName = "services";
var labelsToSearch = ["deploy/labels/com.docker.lb.network"];
var networksPath = "/docker-compose/networks"
var errorFound = false;
var errors = [];
var description = '';

var rootNode = Object.keys(metadataset)[0];
// Get approved value for networks, both with or without tokens
var approvedNetwork = getValueByPath(metadataset,rootNode+"/APP_TRI","/") + getValueByPath(metadataset,rootNode+"/ENV_CODE", "/");
var approvedNetworkToken = "@@APP_TRI@@@@ENV_CODE@@";
//console.log("approvedNetwork="+approvedNetwork);

// First, check if network config is correct
var networksPath = rootNode + networksPath;
//console.log("networksPath="+networksPath);
var networksValue = getValueByPath(metadataset, networksPath, "/");
networksValue = Object.keys(networksValue)[0];
//console.log("networksValue="+networksValue);
if (networksValue !== approvedNetwork && networksValue !== approvedNetworkToken) {
  errorFound = true;
  errors.push("*** Network value ("+networksValue+") must be ("+approvedNetwork+")");
}


// Get list of exceptions
var svcExceptionList = getValueByName(metadataset, "services-exceptions");

// Get list of services
var servicesSubset = getValueByName(metadataset, servicesNodeName);
if (servicesSubset == "ERROR: NOT FOUND") {
    errorFound = true;
    errors.push("*** No service defined !");
} else {
    for (var item in servicesSubset) {
        //console.log("service="+item);
        if (! svcExceptionList.hasOwnProperty(item)) {
            var labelNetwork = "";
            var serviceNetwork = "";
            // Second, check if label config is good
            for (var i=0; i<labelsToSearch.length; i++) {
                labelNetwork = getLabelByPath(servicesSubset[item], labelsToSearch[i], "/");
                //console.log("labelNetwork="+labelNetwork);
                switch (labelNetwork) {
                  case 'ERROR: NOT FOUND':
                    // ignore if label not present
                    break;
                  case 'ERROR: DUPLICATES':
                    errorFound = true;
                    errors.push("*** For service ("+item+"): Label ("+labelsToSearch[i]+") is found more than once");
                  default:
                    labelNetwork = labelNetwork.substring(labelNetwork.indexOf('=')+1);
                    if (labelNetwork !== approvedNetwork && labelNetwork !== approvedNetworkToken) {
                      errorFound = true;
                      errors.push("*** For service ("+item+"): Label ("+labelsToSearch[i]+") value ("+labelNetwork+") must be ("+approvedNetwork+")");
                    }
                }
            }
            // Third, check if service networks config is good
            serviceNetwork = getValueByName(servicesSubset[item], "networks");
            serviceNetwork = Object.keys(serviceNetwork)[0];
            //console.log("serviceNetwork="+serviceNetwork);
            if (serviceNetwork === "ERROR: NOT FOUND") {
              errorFound = true;
              errors.push("*** For service ("+item+"): service networks not Found");
            } else if (serviceNetwork !== approvedNetwork && serviceNetwork !== approvedNetworkToken) {
              errorFound = true;
              errors.push("*** For service ("+item+"): service network ("+serviceNetwork+") must be ("+approvedNetwork+")");
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
function getValueByName(mds, name) {
  var value = "ERROR: NOT FOUND";
  for (var item in mds) {
    // check if the key equals to the search term
    if (item === name ) {
      return mds[item];
    }
    // check if the key points to an object
    if  (typeof (mds[item]) === "object") {
      // if value is an object call recursively the function to search this subset of the object
      value = getValueByName(mds[item], name);
      // if key was found, returns it
      if (value != "ERROR: NOT FOUND") { return value; }
      // if not, continue the loop
    }
  }
  return value;
}

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
  return subset;
}

// Return the value of a specific label based on its complete path
// If not found, then "ERROR: NOT FOUND" is returned
// If duplicates, then "ERROR: DUPLICATES" is returned
function getLabelByPath(mds, path, pathSeparator) {
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
