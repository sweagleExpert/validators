"""
Check all key values in the CDS for 'http://' URLs
"""

# VARIABLES
NO_HTTP = 0
BAD_KEYS = []

def find_no_http(subset: dict) -> None:
  """Recursive function to iterate through values."""
  for key, value in subset.items():
    if isinstance(value, str) and value.startswith("http://"):
      global NO_HTTP, BAD_KEYS
      NO_HTTP += 1
      BAD_KEYS.append(key)
    elif isinstance(value, dict):
      find_no_http(value)


"""Call the function to check the values in the CDS."""
for item in cds:
  global NO_HTTP, BAD_KEYS
  find_no_http(item)
  if NO_HTTP == 0:
    return {"result": True, "description": "Successfully validated metadataset."}
  else:
    output = "ERROR: {} keys containing 'http://' found in {}".format(NO_HTTP, BAD_KEYS)
    return {"result": False, "description": output}
