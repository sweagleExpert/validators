// description: Checks if a host specified in API arg can be resolved in DNS A record
// dnsCheck-endpoint.js
//
// Inputs are: the UNIQUE hostname across all assigned CDS
//    Input type: an object arg containing a string
//
// Creator: Dimtris
// Version:   1.0
// Support: Sweagle version >= 3.11

// VARIABLES DEFINITION
// Root node string used to concatenate all CDS in superCDS
var rootNode=Object.keys(cds[0]);
// Defines the host to check
var host = "";
// Errors variables
var errorFound = false;
var errors = [];
var errors_description = '';

// HANDLERS
// Inputs parser and checker
if (args[0]!=null) {
  // Input value in old notation (for retro compatibility)
  host=args[0];
} else if (arg!=null && arg!="") {
  // Input values in object notation
  // Checking the assigned config datasets and parse the node name from input values in object notation
  host=objFormat(arg);
} else {
  errorFound=true;
  errors.push("ERROR: No inputs provided! Please provide at least one arg in object notation.");
}

//console.log("host="+host);
//console.log("rootNode="+rootNode);

// MAIN
// If the node name has been correctly parsed without any error detected so far!
if (host!=null && !errorFound) {
  if (rootNode == "dns") {
    // We are checking the full dns, check for each zone
    // We initiate error at true and check if any zone contains A-record, then we set it to false and break
    errorFound = true;
    errors.push("## Host ("+host+") cannot be resolved to an A-Record in all DNS");
    for (var zone in cds[0][rootNode]) {
  	  // console.log("zone="+zone);
      if (hasARecord(host, [], cds[0][rootNode][zone])) { errorFound = false; break; }
    }
  } else {
    // We are checking a single dns zone
    if (! hasARecord(host, [], cds[0][rootNode])) {
      errorFound = true;
      errors.push("## Host ("+host+") cannot be resolved to an A-Record in selected DNS("+rootNode+")");
    }
  }
}

// Return the list of all errors trapped
errors_description = errors.join(', ');
return {description: errors_description, result:!errorFound};


// FUNCTIONS LIST
// Parse the object notation: check upon against the RegEx format
function objFormat(obj) {
  var valueToCheck;
  // <nodeName>Value</nodeName>
  var xmlRegex='^\<.*\>(.*)<\/.*\>$';
  // ---
  //nodeName: Value
  var yamlRegex='^---\n.*\:\ (.*)$';
  switch (obj.charAt(0)) {
	  // JSON
    case '{':
    case '[':
      var jsonObj=JSON.parse(obj);
      for (var key in jsonObj) { valueToCheck = jsonObj[key]; }
      return valueToCheck;
    // XML
    case '<':
      valueToCheck=obj.match(xmlRegex)[1];
      return valueToCheck;
    // YAML
    case '-':
      valueToCheck=obj.match(yamlRegex)[1];
      return valueToCheck;
    default:
      errorFound=true;
      errors.push("ERROR: Inputs unexpected!, please provide an object notation (arg). Inputs variables list (args[]) is deprecated.");
  }
}


// Function to check if A-record exists for this host
function hasARecord(cname, checked, dnsSubset) {
    // check for cyclical dependencies, ie host A pointing to host B
    // and host B pointing to host A
    if (checked.includes(cname)) { return false; }

    // if the host we are currently checking does not have a node in the
    // data model, it cannot be resolved to an A-record
    if (typeof(dnsSubset[cname]) === 'undefined') { return false; }
    // if the host does not have a 'type' attribute it is invalid and cannot be resolved
  	else if (typeof(dnsSubset[cname].type) === 'undefined') { return false; }

    if (dnsSubset[cname].type == 'A') {
        // if we found the A-record we can exit the function
        return true;
    } else {
        // if we haven't found the A-record yet, add it to the list of hosts that
        // we have already checked
        checked.push(cname);
        // recursively check for the host that is defined as 'canonical' attribute
        return hasARecord(dnsSubset[cname].canonical, checked, dnsSubset);
    }
}
