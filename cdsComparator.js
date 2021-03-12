// description: Compare all CDS provided as CDS Args to the main one

// cdsComparator.js
// Inputs are
//    - all CDS to compare from
// Creator:   Dimitris for customer POC, based on AllEnvsComparator.js
// Version:   1.0

// defines if error must include full path of key found
var includePath = true;
// defines max errors to display in result, put 0 for no limit
var maxErrorDisplay = 0;
var errorFound = false;
var errors = [];
var description = "Validation passed successfully";
// Define key or node names to exclude from the research
var exceptionList = ["KEYNAME","NODENAME"];
var pathSeparator = "/";

// rules variables
var ignoreNodes = false;
var fromKeysFlat = {};
var toKeysFlat = {};

var fromCDSName = Object.keys(cds[0])[0];
var fromRootNode = cds[0][fromCDSName];
if (ignoreNodes) { flattenObject(cds[0], fromKeysFlat); }

// loop over all CDS to compare to
for (var i=1; i<cds.length; i++){
  var toCDSName = Object.keys(cds[i])[0];
  var toRootNode = cds[i][toCDSName];
  if (ignoreNodes) {
    flattenObject(cds[i], toKeysFlat);
    compareSubsetsFrom(fromKeysFlat, toKeysFlat, toCDSName, [], 0, pathSeparator);
    compareSubsetsTo(fromKeysFlat, toKeysFlat, toCDSName, [], 0, pathSeparator);
  } else {
    compareSubsetsFrom(fromRootNode, toRootNode, toCDSName, [], 0, pathSeparator);
    compareSubsetsTo(fromRootNode, toRootNode, toCDSName, [], 0, pathSeparator);
  }
}

// Display result
if (errors.length > 0) {
  errorFound = true;
  if (maxErrorDisplay == 0 || errors.length < maxErrorDisplay) { description = "ERRORS: " + errors.join(', '); }
  else { description = "ERRORS: only first "+maxErrorDisplay+" errors are displayed:" + errors.join(', '); }
}
return {description: description, result:!errorFound};


// Compare 2 subsets with Subset Source as source of truth to identify missing data
function compareSubsetsFrom (subsetSource, subsetToCheck, subsetToCheckName, prefix, level, pathSeparator) {
  var pre = "";
  // First, check if items values are the same
  for (var item in subsetSource) {
    if (maxErrorDisplay != 0 && errors.length >= maxErrorDisplay) { break; }
    if (exceptionList.includes(item)) { continue; }
    if (sweagleUtils.checkIsNode(subsetSource[item])) {
        prefix[level] = item;
	    if (subsetToCheck.hasOwnProperty(item)) {
        // If it is a node present both sides, do recursive call
        compareSubsetsFrom (subsetSource[item], subsetToCheck[item], subsetToCheckName, prefix, level+1, pathSeparator);
      } else {
        // node is not present in second subset
        if (includePath) {
          pre=prefix[0];
          for (var i=1; i<level;i++) { pre = pre + pathSeparator + prefix[i]; }
          errors.push("## Node "+pre+" is not found in CDS ("+subsetToCheckName+")");
        } else { errors.push("## Node '"+item+"' is not found in CDS ("+subsetToCheckName+")"); }
      }
    } else {
      // Else it is key/value, check if present both sides
      if (subsetToCheck.hasOwnProperty(item)) {
        // now check if values are equals
        if (subsetSource[item] != subsetToCheck[item]) {
          // Key values are different
          if (includePath) {
            pre=prefix[0];
            for (var i=1; i<level;i++) { pre = pre + pathSeparator + prefix[i]; }
            errors.push("## Key "+pre+pathSeparator+item+" is a having a different value in CDS ("+subsetToCheckName+")");
          } else { errors.push("## Key '"+item+"' is a having a different value in CDS ("+subsetToCheckName+")"); }
        }
      } else {
        // Key is not in second CDS
        if (includePath) {
          pre=prefix[0];
          for (var i=1; i<level;i++) { pre = pre + pathSeparator + prefix[i]; }
          errors.push("## Key "+pre+pathSeparator+item+" is not found in CDS ("+subsetToCheckName+")");
        } else { errors.push("## Key or Node '"+item+"' is not found in CDS ("+subsetToCheckName+")"); }
      }
    }
  }
}


// Compare 2 subsets with Subset Source as source of truth to identify missing data
function compareSubsetsTo (subsetSource, subsetToCheck, subsetToCheckName, prefix, level, pathSeparator) {
  var pre = "";
  // Second, check if some items are only present in subsetToCheckName
  for (var item in subsetToCheck) {
    if (maxErrorDisplay != 0 && errors.length >= maxErrorDisplay) { break; }
    if (exceptionList.includes(item)) { continue; }
    if (sweagleUtils.checkIsNode(subsetToCheck[item])) {
      prefix[level] = item;
      if (subsetSource.hasOwnProperty(item)) {
        // If it is a node present both sides, do recursive call
        compareSubsetsTo (subsetSource[item], subsetToCheck[item], subsetToCheckName, prefix, level+1, pathSeparator);
      } else {
        // Node from second dataset is not in first one
        if (includePath) {
          pre=prefix[0];
          for (var i=1; i<level;i++) { pre = pre + pathSeparator + prefix[i]; }
          errors.push("## Node "+pre+" from CDS ("+subsetToCheckName+") is not found in source CDS");
        } else { errors.push("## Node '"+item+"' from CDS ("+subsetToCheckName+") is not found in source CDS"); }
      }
    } else {
      // It is key/Value, check if present
      if (! subsetSource.hasOwnProperty(item)) {
        // Keys from second dataset is not in first one
        if (includePath) {
          pre=prefix[0];
          for (var i=1; i<level;i++) { pre = pre + pathSeparator + prefix[i]; }
          errors.push("## Key "+pre+pathSeparator+item+" from CDS ("+subsetToCheckName+") is not found in source CDS");
        } else { errors.push("## Key '"+item+"' from CDS ("+subsetToCheckName+") is not found in source CDS"); }
      }
    }
  }
}


// Return a flat list of all keys included in subset
function flattenObject (subset , flatObject) {
    for (var item in subset) {
        if (sweagleUtils.checkIsNode(subset[item])) {
            flattenObject(subset[item] , flatObject);
        } else {
          // check if not in exception list
          var exception = false;
          for(var exc=0; exc < exceptionList.length; exc++) {
            if (item === exceptionList[exc]) { exception=true; break; }
          }
          if (exception === false) { flatObject[item] = subset[item]; }
        }
    }
}
