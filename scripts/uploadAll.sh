args=("$@")
echo starting Parser upload..
echo "IP/DN->" ${args[0]}
sweagleURL=${args[0]}
echo "API key->" ${args[1]}
aToken=${args[1]}
./uploadParser.sh "${sweagleURL}" "${aToken}" validator-consistency .validator-consistency.js VALIDATOR
./uploadParser.sh "${sweagleURL}" "${aToken}" validator-forbiddenKVpairs ./validator-forbiddenKVpairs.js VALIDATOR
./uploadParser.sh "${sweagleURL}" "${aToken}" validator-searchthrouCDS ./validator-searchthrouCDS.js VALIDATOR
./uploadParser.sh "${sweagleURL}" "${aToken}" exporter-diffCheck ./exporter-diffCheck.js EXPORTER
./uploadParser.sh "${sweagleURL}" "${aToken}"exporter-forbiddenKVpairs ./exporter-forbiddenKVpairs.js EXPORTER