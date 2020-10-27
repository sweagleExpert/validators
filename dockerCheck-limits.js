// description: Check replicaCount if superior to 1, needed for containers in production that must be highly available
// description: This is based on generic simple validator rule with a static keyAndWantedValues

// generic-simple-validator.js
// Creator:   Dimitris for customer POC
// Version:   1.0 - First
//
var subsetToCheck = cds[0];
var pathAndWantedValues = {
  "*/resources/limits/cpu" : ["<", "500m"],
  "*/resources/limits/memory" : ["<", "1Gi"]
};
var subsetToCheck = cds[0];
var operatorArray = ["=", ">", "<", "IN", "NOT IN"];
var pathSeparator = '/';

// Defines if error must include full path of key found
var includePath = true;
// Defines the max number of errors to return
var maxErrorDisplay = 5;
var errorFound = false;
var errors = [];
var description = '';

for (var path in pathAndWantedValues) {
  if (errors.length >= maxErrorDisplay) { break; }
  var operator = pathAndWantedValues[path][0];
  var value = pathAndWantedValues[path][1];
  //console.log("operator="+operator);
  //console.log("value="+value);
  if (operatorArray.includes(operator)) {
    checkPathValue(subsetToCheck, path, operator, value, [], 0, pathSeparator);
  } else {
    errorFound=true;
    errors.push("## operator ("+operator+") unknown");
  }
}

if (errorFound) {
  if (errors.length < maxErrorDisplay) { description = "ERRORS: " + errors.join(' '); }
  else { description = "ERRORS: only first "+maxErrorDisplay+" errors are displayed:" + errors.join(' '); }
} else { description = "Validation passed successfully"; }

return {description: description, result:!errorFound};


// Check the value of a specific key based on its name
function checkPathValue(subset, path, operator, refValue, prefix, level, pathSeparator) {
  var pathSteps =  path.split(pathSeparator);

  if (pathSteps[0] == "*") {
    // This is dynamic path, search for the root node
    subset = getValueByName(subset, pathSteps[1], prefix, level, pathSeparator);
    if (subset == "ERROR: NOT FOUND") {
      errorFound=true;
      errors.push("## "+path+" node "+pathSteps[1]+" not found");
      return false;
    }
    // Remove first 2 items of the array and continue as if static path now
    level = level+1;
    prefix[level] = "*";
    level = level+1;
    prefix[level] = pathSteps[1];
    pathSteps.shift(); pathSteps.shift();
  }
  for (var i = 0; i < pathSteps.length; i++ ) {
    if (subset.hasOwnProperty(pathSteps[i])) {
      level = level+1;
      prefix[level] = pathSteps[i];
      subset = subset[pathSteps[i]];
    } else {
      errorFound=true;
      errors.push("## "+path+" node "+pathSteps[i]+" not found");
      return false;
    }
  }
  var item=pathSteps[pathSteps.length-1];
  //console.log(subset);
  // check if the key equals to the search term
  var result = checkValue(subset, operator, refValue);
  if (! result) {
    errorFound = true;
    var pre=prefix[0];
    for (var i=1; i<level;i++) { pre = pre + pathSeparator + prefix[i]; }
    if (includePath) { errors.push("## Key ("+pre+pathSeparator+item+") has value ("+subset+") not respecting rule ("+operator+" "+refValue+") or not in good format"); }
    else { errors.push("## Key ("+item+") has value ("+subset+") not respecting rule ("+operator+" "+refValue+") or not in good format"); }
  }
}


function getValueByName(subset, name, prefix, level, pathSeparator) {
  var value = "ERROR: NOT FOUND";
  for (var item in subset) {
    // check if the key points to an object
    if  (typeof (subset[item]) === "object") {
      // check if the key equals to the search term
      if (item === name ) { return subset[item]; }
      // if value is an object call recursively the function to search this subset of the object
      prefix[level] = item;
      value = getValueByName(subset[item], name, prefix, level+1, pathSeparator);
      // if key was found, returns it
      if (value != "ERROR: NOT FOUND") { return value; }
      // if not, continue the loop
    }
  }
  return value;
}


function checkValue (val, op, refVal) {
  //console.log("op"+op);
  //console.log("val"+val);
  //console.log("refVal"+refVal);
  switch (op) {
    case ">" :
      if (isNaN(val)) { val = convertToNum(val); }
      if (isNaN(refVal)) { refVal = convertToNum(refVal); }
      if (val <= refVal) { return false; }
      break;
    case "<" :
      if (isNaN(val)) { val = convertToNum(val); }
      if (isNaN(refVal)) { refVal = convertToNum(refVal); }
      if (val >= refVal) { return false; }
      break;
    case "=" :
      if (val != refVal) { return false; }
      break;
    case "IN" :
      var valArray = refVal.split(',');
      // console.log(valArray);
      if (!(valArray.includes(val))) { return false; }
      break;
    case "NOT IN" :
      var valArray = refVal.split(',');
      if (valArray.includes(val)) { return false; }
      break;
  }
  return true;
}

function convertToNum (val) {
  // This is RAM in megabytes, return as is without unit
  if (val.toLowerCase().endsWith("mi")) { return Number.parseFloat(val.slice(0, -2)); }
  // This is RAM in Gigabytes, multiply it by 1024 to compare with megabytes
  if (val.toLowerCase().endsWith("gi")) { return Number.parseFloat(val.slice(0, -2))*1024; }
  // This is CPU milliseconds, divide it to 1000 to compare it with CPU units
  if (val.toLowerCase().endsWith("m")) { return Number.parseFloat(val.slice(0, -1))/1000; }
  return false;
}
