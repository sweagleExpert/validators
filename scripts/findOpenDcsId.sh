args=("$@")
if [ ${args[0]} == "-h" ];then
    echo "Find an Open DCS id by name."
    echo "to run:"
    echo "./findOpendDcsId.sh <system IP or Domain> <access token> <DCS name>"
    exit 0
fi
sweagleURL=${args[0]}
aToken=${args[1]}
dcsName=${args[2]}



res=$(curl -sX GET -H "Authorization: bearer $aToken" "$sweagleURL/api/v1/data/changeset?limit=200")
entities=$(echo "${res}" | jq -r '._entities[] | @base64')

for entry in $entities; do
    _jq() {
        echo ${entry} | base64 --decode | jq -r ${1}
    }
    entry_status=$(_jq '.changeset.status')
    entry_id=$(_jq '.changeset.id')
    entry_name=$(_jq '.changeset.title')
    if [ "$entry_name" == "$dcsName" ]; then
        echo $entry_id
        break;
    fi
done