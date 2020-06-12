// description: Checks if ntp values are in approved list

// networkCheck-ntp.js
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
var ntpApprovedList;
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
  // Retrieve NTP approved list for this datacenter
  ntpApprovedList = Object.keys(subsetChecklist[datacenter].ntp.servers);
  for (var host in subsetTocheck) { checkEquipment(subsetTocheck[host],datacenter,ntpApprovedList); }
} else {
  // If we are at equipment, get datacenter of the equipment based on its hostname
  datacenter = getDatacenter(subsetTocheck);
  // Retrieve NTP approved list for this datacenter
  ntpApprovedList = Object.keys(subsetChecklist[datacenter].ntp.servers);
  checkEquipment(subsetTocheck,datacenter,ntpApprovedList);
}

// Display results
description = errors.join(', ');
return {description: description, result:!errorFound};


// Compare list of ntp versus approved list
function checkEquipment(subset, dc, approvedList) {

  var ntpList;
  // Retrieve equipment name
  var name = Object.keys(subset)[0];
  // Retrieve equipment NTP servers list
  if (subset.configuration.system.ntp.server == undefined) {
    errorFound = true;
    errors.push("## in DC ("+dc+"), for host ("+name+"), no ntp servers found!");
    return;
  } else {
	  ntpList = Object.keys(subset.configuration.system.ntp.server);
  }
  //console.log("approvedList"); console.log(approvedList);
  //console.log("ntpList="); console.log(ntpList);

  // Compare each NTP server of equipment to approved list
  for (var item in ntpList) {
    if (! approvedList.includes(ntpList[item] )) {
      errorFound = true;
      errors.push("## in DC ("+dc+"), for host ("+name+"), NTP server ("+ntpList[item]+") isn't in approved list");
    }
  }
  // Check that each approved NTP is configured in equipment
  for (var item in approvedList) {
    if (! ntpList.includes(approvedList[item] )) {
      errorFound = true;
      errors.push("## in DC ("+dc+"), for host ("+name+"), approved NTP server ("+approvedList[item]+") isn't used");
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
