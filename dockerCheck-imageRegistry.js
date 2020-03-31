// description: Check if docker image registry is in allowed list

// dockerCheck-imageRegistry.js
// Creator:   Dimitris
// Version:   1.0 - New for customer demo

var allowedRegistries = [ "k8s.gcr.io", "gke.gcr.io", "docker.sweagle.com:8444", "quay.io", "jimmidyson", "prom", "busybox:latest", "busybox:1.28" ] ;
var imageRegistry = "";

var includePath = false;
var pathSeparator = '/';
var maxErrorDisplay = 5;
var errorFound = false;
var errors = [];
var description = '';

findErrors(metadataset,'');

if (errors.length > 0) {
  errorFound = true;
  if (errors.length < maxErrorDisplay) { description = "ERRORS: " + errors.join(' '); }
  else { description = "ERRORS: only first "+maxErrorDisplay+" errors are displayed:" + errors.join(' '); }
} else { description = "Validation passed successfully"; }
return {description: description, result:!errorFound};


function findErrors(mds, path) {
  for (var item in mds) {
    if (errors.length >= maxErrorDisplay) { break; }
    if  (typeof(mds[item]) == "object") {
      findErrors(mds[item], path + item + pathSeparator);
    } else {
      if (item === "image") {
          imageRegistry = mds[item].split('/')[0];
          if (allowedRegistries.indexOf(imageRegistry) == -1) {
            errorFound = true;
            if (includePath) { errors.push("## Container ("+path+"), image doesn't use good registry: " + imageRegistry); }
            else {
              var containers = path.split(pathSeparator);
              var container = containers[containers.length-2];
              errors.push("## Container "+container+" image doesn't use good registry: " + imageRegistry); }
          }
      }
    }
  }
}
