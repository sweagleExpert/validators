// description: Does several simple validation based on datamodel rules

// generic-simple-validator.js
// Creator:   Dimitris for customer POC
// Version:   1.0 - First
//
var rootName = Object.keys(metadataset)[0];
var root = metadataset[rootName];
var rulesNode = root.rules;
var subsetToCheck = root.outputs;
var operatorSeparator = ':';
var operatorArray = ["=", ">", "<", "IN", "NOT IN"];
var pathSeparator = '/';
var valArray = [];

// Defines if error must include full path of key found
var includePath = true;
// Defines the max number of errors to return
var maxErrorDisplay = 6;
var errorFound = false;
var errors = [];
var description = '';

if (rulesNode == undefined) {
    return {description: "*** ERROR: Rules list not found ", result: false};
}

for (var ruleKey in rulesNode) {
  var index = rulesNode[ruleKey].indexOf(operatorSeparator);
  var operator = rulesNode[ruleKey].substring(0, index);
  var value = rulesNode[ruleKey].substring(index+1);
  //console.log("operator="+operator);
  //console.log("value="+value);
  if (operatorArray.includes(operator)) {
    checkKeyValue(subsetToCheck, ruleKey, operator, value, ["outputs"], 1, "/");
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
function checkKeyValue(mds, keyName, operator, refValue, prefix, level, pathSeparator) {
  for (var item in mds) {
    // check if the key has a value or points to an object
    if  (typeof(mds[item]) === "object" && item != rulesNode) {
      // if value is an object call recursively the function to search this subset of the object
      prefix[level] = item;
      checkKeyValue(mds[item], keyName, operator, refValue, prefix, level+1, pathSeparator);
    } else {
      // check if the key equals to the search term
      if (item === keyName ) {
        var result = checkValue(mds[item], operator, refValue);
        if (! result) {
          errorFound = true;
          var pre=prefix[0];
          for (var i=1; i<level;i++) { pre = pre + pathSeparator + prefix[i]; }
          if (includePath) { errors.push("## Key ("+pre+pathSeparator+item+") has value ("+mds[item]+") not respecting rule ("+operator+" "+refValue+")"); }
          else { errors.push("## Key ("+item+") has value ("+mds[item]+") not respecting rule ("+operator+" "+refValue+")"); }
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
      if (Number.parseFloat(val) <= Number.parseFloat(refVal)) { return false; }
      break;
    case "<" :
      if (Number.parseFloat(val) >= Number.parseFloat(refVal)) { return false; }
      break;
    case "=" :
      if (val != refVal) { return false; }
      break;
    case "IN" :
      valArray = refVal.split(',');
      // console.log(valArray);
      if (!(valArray.includes(val))) { return false; }
      break;
    case "NOT IN" :
      valArray = refVal.split(',');
      if (valArray.includes(val)) { return false; }
      break;
  }
  return true;
}
