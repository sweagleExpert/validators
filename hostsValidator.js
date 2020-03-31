// description: Checks if MDS hosts (in values in specified domain) are in approved list

// hostsValidator.js
// Creator:   Dimitris for customer POC
// Version:   1.0 - first release
//
var rootName = Object.keys(metadataset)[0];
var root = metadataset[rootName];
var approvedNode = root.approved.hosts;
var domain = "groupama.fr";
var validHostRegex = new RegExp ("^([a-zA-Z0-9]|[a-zA-Z0-9][a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])(\.([a-zA-Z0-9]|[a-zA-Z0-9][a-zA-Z0-9\-]{0,61}[a-zA-Z0-9]))*."+domain+"$");

// Defines if error must include full path of key found
var includePath = true;
// Defines the max number of errors to return
var maxErrorDisplay = 3;
var errorFound = false;
var errors = [];
var description = '';

if (approvedNode != undefined) { var approvedArray = Object.keys(approvedNode); }
else { return {description: "## ERROR: Approved list not found ", result: false}; }

checkMatchingHosts(metadataset, validHostRegex, [], 0, "/");

if (errorFound) {
  if (errors.length < maxErrorDisplay) { description = "ERRORS: " + errors.join(' '); }
  else { description = "ERRORS: only first "+maxErrorDisplay+" errors are displayed:" + errors.join(' '); }
} else { description = "Validation passed successfully"; }

return {description: description, result:!errorFound};


/// Function to return all values matching a specific regex in an array
function checkMatchingHosts(mds, regex, prefix, level, pathSeparator) {
  for (var item in mds) {
    if (errors.length >= maxErrorDisplay) { break; }
    if  ( typeof(mds[item]) === "object") {
      // If we are on a node call recursively the function, skipping approved node
      if (item != "approved") {
        prefix[level] = item;
        checkMatchingHosts (mds[item], regex, prefix, level+1, pathSeparator);
      }
    } else if (mds[item].indexOf(domain)!=-1 && regex.test(mds[item])) {
      if (! approvedArray.includes(mds[item])) {
        errorFound = true;
        var pre=prefix[0];
        for (var i=1; i<level;i++) { pre = pre + pathSeparator + prefix[i]; }
        if (includePath) { errors.push("## Key ("+pre+pathSeparator+item+") has not approved value: ("+mds[item]+")"); }
        else { errors.push("## Key ("+item+") has not approved value: ("+mds[item]+")"); }
      }
    }
  }
}
