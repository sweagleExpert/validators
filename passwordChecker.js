// description: Check if sensitive values are encrypted or replaced by tokens

// passwordChecker.js
// For each key that is suspected to be sensitive, check if value is put as sensitive data ro a token
// Creator:   Dimitris Finas for customer POC
// Creator:   Use substringValidator.js as source
// Version:   1.7 - Minor corrections
//

// Define keywords in key name that defines a password
 var keyNamesWithPasswordValues = [
//  "password", This is already handled by "pass" below
  "pass",
  "pwd",
  "secret"
];

var exceptionList= [
    "KEYNAME"
    ];

// Defines if error must include full path of key found
var includePath = true;
// Defines the max number of errors to return
var maxErrorDisplay = 3;
var errorFound = false;
var errors = [];
var description = '';
var tokenPrefix = "@@";
var pathSeparator = "/";

// here we call our function with different search terms
for (var i= 0; i < keyNamesWithPasswordValues.length; i++) {
  searchSubstring(metadataset, keyNamesWithPasswordValues[i].toLowerCase(), [], 0, pathSeparator);
}

if (errorFound) {
  if (errors.length < maxErrorDisplay) { description = "ERRORS: " + errors.join(' '); }
  else { description = "ERRORS: only first "+maxErrorDisplay+" errors are displayed:" + errors.join(' '); }
} else { description = "Validation passed successfully"; }

return {description: description, result:!errorFound};


/**
 * searchSubsting function searches the whole metadataset to find keys that include a given substring
 * and checks if their values is protected as sensitive data
 *
 * mds must be the given metadataset,
 * searchKey must be the string we want to check in the keys,
 */
function searchSubstring (mds, searchKey, prefix, level, pathSeparator) {
  for (var item in mds) {
    // get out if we already reach max nb of errors to display
    if (errors.length >= maxErrorDisplay) { break; }
    // check if the key has a value or points to an object
    if  (typeof (mds[item]) === "object") {
      // if value is an object call recursively the function to search this subset of the object
      prefix[level] = item;
      searchSubstring (mds[item], searchKey, prefix, level+1, pathSeparator);
    } else {
      // check if the key contains the search term
      if (item.toLowerCase().includes(searchKey)) {
        // check if not in exception list
        var exception = false;
        for(var exc=0; exc < exceptionList.length; exc++) {
          if (item.toLowerCase() === exceptionList[exc].toLowerCase()) { exception=true; break; }
        }
        if (exception === false) {
            // check if password is not encrypted and is not a token
            if  (!( mds[item] === "..." || mds[item].startsWith(tokenPrefix) )) {
              errorFound = true;
              var pre=prefix[0];
              for (var i=1; i<level;i++) { pre = pre + pathSeparator + prefix[i]; }
              if (includePath) { errors.push("## key "+pre+pathSeparator+item+" is not encrypted"); }
              else { errors.push("## key "+item+" is not encrypted"); }
            }
        }
      }
    }
  }
}
