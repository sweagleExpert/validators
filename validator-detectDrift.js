var cds = [];
var res = true;
var errorMsg = '';

for (var component in cds[0].DEM2.currentDiscovered) {
  console.log(component);
  for (var cdi in cds[0].DEM2.currentDiscovered[component]) {
    if (cdi.endsWith("BuildNbr")) {
      if (cds[0].DEM2.currentDiscovered[component][cdi] !== cds[0].DEM2.currentDeployed[component][cdi]){
        errorMsg += cdi+", ";
        res= false;
      }
    }
  }
}
if (res === true) {
  	return { 'result': true, 'description': 'All values are identical' };
} else {
  	return { 'result': false, 'description': 'Difference in:'+ errorMsg.substring(0, errorMsg.length - 1)};
}
