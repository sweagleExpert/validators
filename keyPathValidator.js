// description: Check if specific keys list with path list has specific values
// Version:   1.0 - first version

/**
 * var keysWithPathAndWantedValues is an object that holds
 * - key : path that we want to search
 * - array of wanted values with operator as first item of array
 * - operator could be = < >, if * is before operator, it means all keys in node found must be verified
 */
var pathAndWantedValues = {
  "openshift/environment/p/resources/autoscaling/replicas" : ["*>", "1"],
  "openshift/environment/p/resources/autoscaling.replicas.min" : [">", "1"],
  "src/main/resources/application-p/logging/level" : ["*=", "warning", "error", "fatal"],
};
var pathSeparator = "/";
var rootName = Object.keys(metadataset)[0];
var root = metadataset[rootName];
var badValue = {};

// Defines if a not found error should be ignored
var ignoreIfNotFound = true;
// Defines the max number of errors to return
var maxErrorDisplay = 5;
var errorFound = false;
var errors = [];
var description = '';
var operator = "=";

for (var obj in pathAndWantedValues) {
  if (errors.length >= maxErrorDisplay) { break; }
  var value = getValueByPath(root, obj, pathSeparator);
  if (value === "ERROR: NOT FOUND") {
    if (ignoreIfNotFound == false ) { errorFound=true; errors.push("## required key "+obj+" not found"); }
  } else {
    badValue[obj] = true;
    operator = pathAndWantedValues[obj][0];
    switch (operator) {
      case ">" :
        for (var i=1; i < pathAndWantedValues[obj].length; i++) {
          if (value > pathAndWantedValues[obj][i]) { badValue[obj] = false; break; }
        }
        if (badValue[obj]) { errorFound=true; errors.push("## key "+obj+" doesn't have expected value"); }
        break;
      case "<" :
        for (var i=1; i < pathAndWantedValues[obj].length; i++) {
          if (value < pathAndWantedValues[obj][i]) { badValue[obj] = false; break; }
        }
        if (badValue[obj]) { errorFound=true; errors.push("## key "+obj+" doesn't have expected value"); }
        break;
      case "*=" :
          for (var item in value) {
            if (errors.length >= maxErrorDisplay) { break; }
            badValue[obj] = true;
            for (var i=1; i < pathAndWantedValues[obj].length; i++) {
              if (value[item] === pathAndWantedValues[obj][i]) { badValue[obj] = false; break; }
            }
            if (badValue[obj]) { errorFound=true; errors.push("## key "+obj+pathSeparator+item+" doesn't have expected value"); }
          }
          break;
      case "*>" :
          for (var item in value) {
            if (errors.length >= maxErrorDisplay) { break; }
            badValue[obj] = true;
            for (var i=1; i < pathAndWantedValues[obj].length; i++) {
              if (value[item] > pathAndWantedValues[obj][i]) { badValue[obj] = false; break; }
            }
            if (badValue[obj]) { errorFound=true; errors.push("## key "+obj+pathSeparator+item+" doesn't have expected value"); }
          }
          break;
      case "*<" :
          for (var item in value) {
            if (errors.length >= maxErrorDisplay) { break; }
            badValue[obj] = true;
            for (var i=1; i < pathAndWantedValues[obj].length; i++) {
              if (value[item] < pathAndWantedValues[obj][i]) { badValue[obj] = false; break; }
            }
            if (badValue[obj]) { errorFound=true; errors.push("## key "+obj+pathSeparator+item+" doesn't have expected value"); }
          }
          break;
      default :
        for (var i=1; i < pathAndWantedValues[obj].length; i++) {
          if (value === pathAndWantedValues[obj][i]) { badValue[obj] = false; break; }
        }
        if (badValue[obj]) { errorFound=true; errors.push("## key "+obj+" doesn't have expected value"); }
    }
  }
}

if (errorFound) {
  if (errors.length < maxErrorDisplay) { description = "ERRORS: " + errors.join(' '); }
  else { description = "ERRORS: only first "+maxErrorDisplay+" errors are displayed:" + errors.join(' '); }
} else { description = "Validation passed successfully"; }

return {description: description, result:!errorFound};

// Return the value of a specific key based on its complete path
// If the key is a node, then it returns a subset
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
  return subset;
}
