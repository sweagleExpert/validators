#!/usr/bin/env bash
function createValidator(){
res=$(curl -s -X POST -o /dev/null -w "%{http_code}" -H "Authorization: bearer $aToken" -H "Accept: application/vnd.siren+json;charset=UTF-8" -H "Content-Type: application/x-www-form-urlencoded" "$sweagleURL/api/v1/tenant/metadata-parser" \
--data-urlencode "name=$validatorName" \
--data-urlencode "description=uploaded via automated script" \
--data-urlencode "parserType=${parserType}" \
--data-urlencode "scriptDraft=$(readScript)" \
--data-urlencode "errorDescriptionDraft=Failure")
if [ "$res" == "201" ];then
    echo -e "\e[32mvalidator: $validatorName created successfully\e[m"
else
    echo -e "\e[31mFailed to create validator: $validatorName\e[m"
fi
}
function readScript() {
    cat ${validatorPath}
}

args=("$@")
if [ ${args[0]} == "-h" ];then
    echo "upload validator to SWEAGLE"
    echo "to run:"
    echo "./uploadParser.sh <system IP or Domain> <access token> <parser's name> <path to js file> <parser's type in capital>"
    exit 0
fi
echo starting Parser upload..
echo "IP/DN->" ${args[0]}
sweagleURL=${args[0]}
echo "API key->" ${args[1]}
aToken=${args[1]}
echo "Parser's name->" ${args[2]}
validatorName=${args[2]}
echo "Parser's path->" ${args[3]}
validatorPath=${args[3]}
echo "Parser's type->" ${args[4]}
parserType=${args[4]}
createValidator