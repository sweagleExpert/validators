// description: Check that all keys have values

// noEmptyValues.js
// Check that all keys have values
// Creator:   Dimitris Finas for customer POC
// Version:   1.3 - new code with path and maxErrors
//

// List of keys that won't be checked
var exceptionList= [
    "KEYNAME"
    ];

var includePath = true;
var maxErrorDisplay = 3;
var errorFound = false;
var errors = [];
var description = '';

checkValue(metadataset, [], 0, "/");

if (errorFound) {
  if (errors.length < maxErrorDisplay) { description = "ERRORS: " + errors.join(' '); }
  else { description = "ERRORS: only first "+maxErrorDisplay+" errors are displayed:" + errors.join(' '); }
} else { description = "Validation passed successfully"; }

return {description: description, result:!errorFound};


// Function to check if no value is empty
function checkValue (mds, prefix, level, pathSeparator) {
  for (var item in mds) {
    // get out if we already reach max nb of errors to display
    if (errors.length >= maxErrorDisplay) { break; }
    // check if the key has a value or points to an object
    if  (typeof(mds[item]) === "object") {
      // if value is an object call recursively the function for this subset
      prefix[level] = item;
      checkValue(mds[item], prefix, level+1, pathSeparator);
    } else if (mds[item] === "") {
      var exception = false;
      for(var exc=0; exc < exceptionList.length; exc++) {
        if (item.toLowerCase() === exceptionList[exc].toLowerCase()) { exception=true; break; }
      }
      if (exception === false) {
          errorFound = true;
          var pre=prefix[0];
          for (var i=1; i<level; i++) { pre = pre + pathSeparator + prefix[i]; }
          if (includePath) { errors.push("## key "+pre+pathSeparator+item+" must have a value"); }
          else { errors.push("## key "+item+" must have a value"); };
      }
    }
  }
}
