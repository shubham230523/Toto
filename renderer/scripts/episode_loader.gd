extends Node

## EpisodeLoader
## Responsible for loading and validating storyboard JSON files.

## Loads an episode definition from a JSON file.
func load_from_file(file_path: String) -> Dictionary:
	if not FileAccess.file_exists(file_path):
		push_error("Episode file not found: " + file_path)
		return {}

	var file = FileAccess.open(file_path, FileAccess.READ)
	var content = file.get_as_text()
	var json = JSON.new()
	var error = json.parse(content)

	if error != OK:
		push_error("Failed to parse JSON: " + json.get_error_message())
		return {}

	var data = json.get_data()
	if typeof(data) != TYPE_DICTIONARY:
		push_error("Episode JSON must be a dictionary")
		return {}

	if validate(data):
		return data

	return {}

## Validates the required fields of an episode definition.
func validate(data: Dictionary) -> bool:
	# 1. Metadata
	if not data.has("title") or typeof(data["title"]) != TYPE_STRING:
		push_error("Validation failed: 'title' is missing or not a string")
		return false

	# 2. Assets
	if not data.has("requiredAssets") or typeof(data["requiredAssets"]) != TYPE_ARRAY:
		push_error("Validation failed: 'requiredAssets' is missing or not an array")
		return false

	# 3. Scenes
	if not data.has("scenes") or typeof(data["scenes"]) != TYPE_ARRAY:
		push_error("Validation failed: 'scenes' is missing or not an array")
		return false

	if data["scenes"].size() == 0:
		push_error("Validation failed: 'scenes' array is empty")
		return false

	for i in range(data["scenes"].size()):
		var scene = data["scenes"][i]
		if typeof(scene) != TYPE_DICTIONARY:
			push_error("Validation failed: Scene at index %d is not a dictionary" % i)
			return false

		if not scene.has("background") or not scene.has("duration") or not scene.has("actions"):
			push_error("Validation failed: Scene at index %d is missing required fields" % i)
			return false

		if typeof(scene["actions"]) != TYPE_ARRAY:
			push_error("Validation failed: Scene at index %d 'actions' is not an array" % i)
			return false

	return true
