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

## Validates the required fields of an episode package.
func validate(data: Dictionary) -> bool:
	# 1. Episode Package Structure
	if not data.has("episode") or not data.has("storyboard"):
		push_error("Validation failed: 'episode' or 'storyboard' root objects are missing")
		return false

	var storyboard = data["storyboard"]

	# 2. Storyboard Metadata
	if not storyboard.has("title") or typeof(storyboard["title"]) != TYPE_STRING:
		push_error("Validation failed: storyboard 'title' is missing or not a string")
		return false

	# 3. Assets
	if not storyboard.has("requiredAssets") or typeof(storyboard["requiredAssets"]) != TYPE_ARRAY:
		push_error("Validation failed: storyboard 'requiredAssets' is missing or not an array")
		return false

	# 4. Scenes
	if not storyboard.has("scenes") or typeof(storyboard["scenes"]) != TYPE_ARRAY:
		push_error("Validation failed: storyboard 'scenes' is missing or not an array")
		return false

	if storyboard["scenes"].size() == 0:
		push_error("Validation failed: 'scenes' array is empty")
		return false

	for i in range(storyboard["scenes"].size()):
		var scene = storyboard["scenes"][i]
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
