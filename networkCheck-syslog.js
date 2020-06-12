// description: Checks if syslog values are in approved list

// networkCheck-syslog.js
// Creator:   Dimitris for customer POC
// Version:   1.0 - First
//

// VARIABLES DEFINITION
// This is the subset that we need to approve
var subsetTocheck = cds[0];
// This is the name of CDS to check
var rootName = Object.keys(subsetTocheck)[0];
// This is the subset that contains approval list
var subsetChecklist;
var syslogApprovedList;
var datacenter ="";
// Default Datacenter to use if none is found
var defaultDatacenter ="frcn";
var hostname = "";

// Errors variables
var errorFound = false;
var errors = [];
var description = '';


subsetTocheck = subsetTocheck[rootName];
// Get approved checklist from mdsArgs (default) or include
if (cds.length > 1) { subsetChecklist = cds[1].group_vars; }
else { subsetChecklist = subsetTocheck.approved.group_vars; }

// Get list of datacenters
var datacenters = Object.keys(subsetChecklist);
//console.log("datacenter list"); console.log(datacenters);

// Check if we are at equipment or datacenter level
subsetTocheck = subsetTocheck[rootName];
if (datacenters.includes(rootName)) {
  // we are at datacenter level, check for each equipment in it
  datacenter=rootName;
  // Retrieve syslog approved list for this datacenter
  syslogApprovedList = Object.keys(subsetChecklist[datacenter].syslog.servers);
  for (var host in subsetTocheck) { checkEquipment(host,subsetTocheck[host],datacenter,syslogApprovedList); }
} else {
  // If we are at equipment, get datacenter of the equipment based on its hostname
  datacenter = getDatacenter(subsetTocheck);
  // Retrieve syslog approved list for this datacenter
  syslogApprovedList = Object.keys(subsetChecklist[datacenter].syslog.servers);
  checkEquipment(rootName,subsetTocheck,datacenter,syslogApprovedList);
}

// Display results
description = errors.join(', ');
return {description: description, result:!errorFound};


// Compare list of syslog versus approved list
function checkEquipment(name, subset, dc, approvedList) {

  var syslogList;
  // Retrieve equipment syslog servers list
  if (subset.configuration.system.syslog.host == undefined) {
    errorFound = true;
    errors.push("## in DC ("+dc+"), for host ("+name+"), no syslog servers found!");
    return;
  } else {
	syslogList = Object.keys(subset.configuration.system.syslog.host);
  }
  //console.log("approvedList"); console.log(approvedList);
  //console.log("syslogList="); console.log(syslogList);

  // Compare each syslog server of equipment to approved list
  for (var item in syslogList) {
    if (! approvedList.includes(syslogList[item] )) {
      errorFound = true;
      errors.push("## in DC ("+dc+"), for host ("+name+"), syslog server ("+syslogList[item]+") isn't in approved list");
    }
  }
  // Check that each approved syslog is configured in equipment
  for (var item in approvedList) {
    if (! syslogList.includes(approvedList[item] )) {
      errorFound = true;
      errors.push("## in DC ("+dc+"), for host ("+name+"), approved syslog server ("+approvedList[item]+") isn't used");
    }
  }
}


// Get datacenter of this host subset
function getDatacenter(subset) {
  var dc = getValueByName(subset, "host-name");
  if (typeof (dc) === "object") { dc = Object.keys(dc)[0]; }
  if (dc.indexOf('-') > 0) {
    dc = dc.substring(dc.indexOf('.')+1,dc.indexOf('-'));
  } else {
    dc = dc.substring(dc.indexOf('.')+1);
  }
  // Check if datacenter is in approved list, if not put equipment in default DC
  if (! datacenters.includes(dc)) { dc = defaultDatacenter; }
  //console.log("datacenter="+dc);
  return dc;
}


// Return the value of a specific key based on its name
// If the key is a node, then it returns a subset
// If multiple keys with same name, the first value found is returned
// If not found, then "ERROR: NOT FOUND" is returned
function getValueByName(dataset, name) {
  var value = "ERROR: NOT FOUND";
  for (var item in dataset) {
    // check if the key equals to the search term
    if (item === name ) { return dataset[item]; }
    // check if the key points to an object
    if  (typeof (dataset[item]) === "object") {
      // if value is an object call recursively the function to search this subset of the object
      value = getValueByName(dataset[item], name);
      // if key was found, returns it
      if (value != "ERROR: NOT FOUND") { return value; }
      // if not, continue the loop
    }
  }
  return value;
}
