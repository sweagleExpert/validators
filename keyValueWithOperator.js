// description: Check that a list of keys respect a specific value rule based on operator

// keyValueWithOperator.js
// Creator:   Dimitris
// Version:   1.0 - First
//
// Store all the config datasets
var superCDS={};
// Root node string used to concatenate all CDS in superCDS
var rootNode="";
var operatorArray = ["=", "!=", ">", "<", "IN", "NOT IN"];
var pathSeparator = '/';

// Defines if error must include full path of key found
var includePath = true;
// Defines the max number of errors to return
var maxErrorDisplay = 5;
var errorFound = false;
var errors = [];
var description = '';
var refValues = [];

for (var i=0; i<cds.length; i++){
  rootNode = Object.keys(cds[i])[0];
  superCDS[rootNode] = cds[i][rootNode];
}

var subsetToCheck = superCDS;
var keyAndWantedValues = JSON.parse(arg);

for (var key in keyAndWantedValues) {
  if (errors.length >= maxErrorDisplay) { break; }
  var operator = keyAndWantedValues[key][0];
  //array to store refValues
  for (var i=1; i<keyAndWantedValues[key].length; i++){
    refValues.push(keyAndWantedValues[key][i]);
  }
  //console.log("operator="+operator);
  //console.log("refValues="+refValues);
  if (operatorArray.includes(operator)) {
    checkKeyValue(subsetToCheck, key, operator, refValues, [], 0, "/");
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
function checkKeyValue(subset, keyName, operator, refValue, prefix, level, pathSeparator) {
  for (var item in subset) {
    if (errors.length >= maxErrorDisplay) { break; }
    // check if the key has a value or points to an object
    if  (typeof(subset[item]) === "object") {
      // if value is an object call recursively the function to search this subset of the object
      prefix[level] = item;
      checkKeyValue(subset[item], keyName, operator, refValue, prefix, level+1, pathSeparator);
    } else {
      // check if the key equals to the search term
      if (item === keyName ) {
        var result = checkValue(subset[item], operator, refValue);
        if (! result) {
          errorFound = true;
          var pre=prefix[0];
          for (var i=1; i<level;i++) { pre = pre + pathSeparator + prefix[i]; }
          if (includePath) { errors.push("## Key ("+pre+pathSeparator+item+") has value ("+subset[item]+") not respecting rule ("+operator+" "+refValue+")"); }
          else { errors.push("## Key ("+item+") has value ("+subset[item]+") not respecting rule ("+operator+" "+refValue+")"); }
        }
      }
    }
  }
}

function checkValue (val, op, refVal) {
  //console.log("op"+op);
  //console.log("val"+val);
  //console.log("refVal"+refVal);
  switch (op) {
    case ">" :
      if (Number.parseFloat(val) <= Number.parseFloat(refVal[0])) { return false; }
      break;
    case "<" :
      if (Number.parseFloat(val) >= Number.parseFloat(refVal[0])) { return false; }
      break;
    case "=" :
      if (val != refVal[0]) { return false; }
      break;
    case "!=" :
      if (val == refVal[0]) { return false; }
      break;
    case "IN" :
      var valArray = refVal;
      // console.log(valArray);
      if (!(valArray.includes(val))) { return false; }
      break;
    case "NOT IN" :
      var valArray = refVal;
      if (valArray.includes(val)) { return false; }
      break;
  }
  return true;
}