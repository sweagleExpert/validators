// description: Check if all same cdis of different nodes have the same value
var cds = [];

var res = true;
var errorMsg = '';
var rootNode = Object.keys(cds[0])[0];

for (var component in cds[0][rootNode].currentDiscovered) {
  for (var cdi in cds[0][rootNode].currentDiscovered[component]) {
    if (cdi.endsWith("BuildNbr")) {
      if (cds[0][rootNode].currentDiscovered[component][cdi] !== cds[0][rootNode].currentDeployed[component][cdi]){
        errorMsg += component+" - deployed: " + cds[0][rootNode].currentDeployed[component][cdi] +" discovered: " +  cds[0][rootNode].currentDiscovered[component][cdi] +"\n";
        res= false;
      }
    }
  }
}
if (res === true) {
  	return { 'result': true, 'description': 'All values are identical' };
} else {
  	return { 'result': false, 'description': 'Difference in:\n'+ errorMsg.substring(0, errorMsg.length - 1)};
}
