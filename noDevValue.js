// description: Check if values contains a string identifying a DEV value (like DEV server or DEBUG log level)

// noDevValue.js
// For each key in MDS, check if value contains a string identifying a DEV server
// Creator:   Dimitris Finas for customer POC
// Creator:   Use substringValidator.js as source
// Version:   1.2 - add error array, max error display, and path mngt
//

// Define keywords in key values that defines a DEV value
// like a DEV server, or DEBUG log level, or HTTP url instead of HTTPS
// search for value is case insensitive
 var keyValuesWithDevValue = [
  "DEBUG",
  "http:/",
];

// List of keys that won't be checked
var exceptionList= [
    "KEYNAME"
    ];

// Defines if error must include full path of key found
var includePath = false;
// Defines the max number of errors to return
var maxErrorDisplay = 5;
var errorFound = false;
var errors = [];
var description = '';

// here we call our function with different search terms
for (var i= 0; i < keyValuesWithDevValue.length; i++) {
  searchSubstring(metadataset, keyValuesWithDevValue[i].toLowerCase(), [], 0, "/");
}

if (errorFound) {
  if (errors.length < maxErrorDisplay) { description = "ERRORS: " + errors.join(' '); }
  else { description = "ERRORS: only first "+maxErrorDisplay+" errors are displayed:" + errors.join(' '); }
} else { description = "Validation passed successfully"; }

return {description: description, result:!errorFound};


// searchSubsting function searches the whole metadataset to find keys that include a given substring
function searchSubstring (mds, searchValue, prefix, level, pathSeparator) {
  for (var item in mds) {
    // get out if we already reach max nb of errors to display
    if (errors.length >= maxErrorDisplay) { break; }
    // check if the key has a value or points to an object
    if  (typeof (mds[item]) === "object") {
      // if value is an object call recursively the function to search this subset of the object
      prefix[level] = item;
      searchSubstring (mds[item], searchValue, prefix, level+1, pathSeparator);
    } else {
      // check if the key contains the search term
      if (mds[item].toLowerCase().includes(searchValue)) {
        var exception = false;
        for(var exc=0; exc < exceptionList.length; exc++) {
          if (item.toLowerCase() === exceptionList[exc].toLowerCase()) { exception=true; break; }
        }
        if (exception === false) {
          errorFound = true;
          var pre=prefix[0];
          for (var i=1; i<level;i++) { pre = pre + pathSeparator + prefix[i]; }
          if (includePath) { errors.push("## key "+pre+pathSeparator+item+" contains DEV value: "+mds[item]); }
          else { errors.push("## key "+item+" contains DEV value: "+mds[item]); }
        }
      }
    }
  }
}
