// description: Check if there are duplicate values in the MDS

// duplicateValues.js
// Creator:   Dimitris Finas for customer POC
// Version:   1.O - First release
//

var exceptionList= [ "true", "false", "yes", "no", "enabled", "disabled" ];

// Defines if error must include full path of key found
var includePath = true;
// Defines the max number of errors to return
var maxErrorDisplay = 10;
var errorFound = false;
var errors = [];
var description = '';
var pathSeparator = "/";

var valuesArray = [];
var keysArray = [];

findDuplicates(metadataset, keysArray, valuesArray, '');

if (errors.length > 0) {
  errorFound = true;
  if (errors.length < maxErrorDisplay) { description = "ERRORS: " + errors.join(' '); }
  else { description = "ERRORS: only first "+maxErrorDisplay+" errors are displayed:" + errors.join(' '); }
} else { description = "Validation passed successfully"; }

return {description: description, result:!errorFound};

// Return only values of a metadataset in an array
function findDuplicates(mds, arrKeys, arrValues, path) {
  for (var item in mds) {
    if (errors.length >= maxErrorDisplay) { break; }
    if (typeof (mds[item]) === "object") {
        findDuplicates(mds[item], arrKeys, arrValues, path + item + pathSeparator);
    } else {
      // ignore if values in exception list
      if (exceptionList.indexOf(mds[item].trim().toLowerCase())==-1) {
        // if value already there, raise it as error
        var index = arrValues.indexOf(mds[item].trim());
        if (index==-1) {
          arrValues.push(mds[item].trim());
          if (includePath) { arrKeys.push(path+item); } else { arrKeys.push(item); }
        } else {
          //console.log ("KEY="+item);
          //console.log ("VALUE="+mds[item].trim());
          if (includePath) { errors.push("## keys ("+path+item+") and ("+ arrKeys[index] +") have same value"); }
          else { errors.push("## keys ("+ item +") and ("+ arrKeys[index] +") have same value"); }
        }
      }
    }
  }
}
