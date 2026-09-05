extends Node2D

## Renderer
## Main controller for executing storyboard instructions.

const CHARACTER_SCENE = preload("res://scenes/character.tscn")
const OBJECT_SCENE = preload("res://scenes/object.tscn")

@onready var background_node = $Background
@onready var characters_container = $Characters
@onready var objects_container = $Objects
@onready var audio_node = $Audio
@onready var audio_player = $Audio/GlobalPlayer

## Map of character/object names to their node instances.
var _registry = {}
## Map of resource names to their loaded objects (AudioStream, Texture2D).
var _resource_registry = {}

signal episode_finished

## SHOW command: Makes a character or object visible.
func show_target(target_name: String) -> void:
	var node = _get_target(target_name)
	if node:
		if node.has_method("set_visible_state"):
			node.set_visible_state(true)
		else:
			node.visible = true
	else:
		push_error("Target not found for SHOW: " + target_name)

## HIDE command: Makes a character or object invisible.
func hide_target(target_name: String) -> void:
	var node = _get_target(target_name)
	if node:
		if node.has_method("set_visible_state"):
			node.set_visible_state(false)
		else:
			node.visible = false
	else:
		push_error("Target not found for HIDE: " + target_name)

## MOVE command: Smoothly moves a target to a new position.
func move_target(target_name: String, target_position: Vector2, duration: float) -> void:
	var node = _get_target(target_name)
	if node:
		var tween = create_tween()
		tween.tween_property(node, "position", target_position, duration).set_trans(Tween.TRANS_SINE).set_ease(Tween.EASE_IN_OUT)
	else:
		push_error("Target not found for MOVE: " + target_name)

## ANIMATE command: Triggers a pre-defined animation on a character.
func animate_target(target_name: String, animation_name: String) -> void:
	var node = _get_target(target_name)
	if node:
		if node.has_method("play_animation"):
			node.play_animation(animation_name)
		else:
			push_error("Target does not support animations: " + target_name)
	else:
		push_error("Target not found for ANIMATE: " + target_name)

## SCALE command: Smoothly scales a target to a new size.
func scale_target(target_name: String, target_scale: Vector2, duration: float) -> void:
	var node = _get_target(target_name)
	if node:
		var tween = create_tween()
		tween.tween_property(node, "scale", target_scale, duration).set_trans(Tween.TRANS_SINE).set_ease(Tween.EASE_IN_OUT)
	else:
		push_error("Target not found for SCALE: " + target_name)

## ROTATE command: Smoothly rotates a target to a new angle.
func rotate_target(target_name: String, target_degrees: float, duration: float) -> void:
	var node = _get_target(target_name)
	if node:
		var tween = create_tween()
		tween.tween_property(node, "rotation_degrees", target_degrees, duration).set_trans(Tween.TRANS_SINE).set_ease(Tween.EASE_IN_OUT)
	else:
		push_error("Target not found for ROTATE: " + target_name)

## PLAY_SOUND command: Plays an audio asset.
func play_sound(sound_name: String) -> void:
	var stream = _resource_registry.get(sound_name)
	if stream and stream is AudioStream:
		audio_player.stream = stream
		audio_player.play()
	else:
		push_error("Audio resource not found or invalid: " + sound_name)

## Registers a node in the internal registry for command targeting.
func register_node(node_name: String, node: Node) -> void:
	_registry[node_name] = node

## Registers a resource in the internal registry.
func register_resource(res_name: String, resource: Resource) -> void:
	_resource_registry[res_name] = resource

## Internal helper to fetch a node by its registered name.
func _get_target(target_name: String) -> Node:
	return _registry.get(target_name)

## Dispatches an action based on its type.
func execute_action(action: Dictionary) -> void:
	var type = action.get("type", "")
	var target = action.get("target", "")

	match type:
		"SHOW":
			show_target(target)
		"HIDE":
			hide_target(target)
		"MOVE":
			var params = action.get("params", {})
			var x = params.get("x", 0)
			var y = params.get("y", 0)
			var duration = action.get("duration", 1.0)
			move_target(target, Vector2(x, y), duration)
		"ANIMATE":
			var params = action.get("params", {})
			var animation_name = params.get("animation", "")
			animate_target(target, animation_name)
		"WAIT":
			var duration = action.get("duration", 1.0)
			await get_tree().create_timer(duration).timeout
		"SCALE":
			var params = action.get("params", {})
			var sx = params.get("x", params.get("scale", 1.0))
			var sy = params.get("y", params.get("scale", 1.0))
			var duration = action.get("duration", 1.0)
			scale_target(target, Vector2(sx, sy), duration)
		"ROTATE":
			var params = action.get("params", {})
			var degrees = params.get("degrees", 0.0)
			var duration = action.get("duration", 1.0)
			rotate_target(target, degrees, duration)
		"PLAY_SOUND":
			var params = action.get("params", {})
			var sound_name = params.get("sound", target)
			play_sound(sound_name)
		_:
			push_warning("Unsupported action type: " + type)

## Executes a sequence of actions.
func execute_sequence(actions: Array) -> void:
	for action in actions:
		await execute_action(action)

func _ready() -> void:
	# For testing: Auto-load the test episode if it exists
	var test_path = "res://test_episode.json"
	if FileAccess.file_exists(test_path):
		# Pre-register mock resources to allow the test to run without actual files
		_register_mock_resources()

		var data = EpisodeLoader.load_from_file(test_path)
		if not data.is_empty():
			# Wait a frame to ensure everything is initialized
			await get_tree().process_frame
			play_episode(data)

func _register_mock_resources() -> void:
	# Creates 1x1 placeholder textures so the engine doesn't complain about missing assets
	var mock_tex = ImageTexture.create_from_image(Image.create(1, 1, false, Image.FORMAT_RGBA8))
	register_resource("Toto", mock_tex)
	register_resource("forest", mock_tex)
	register_resource("apple", mock_tex)

## Prepares the scene by setting background and spawning actors.
func setup_scene(scene_data: Dictionary) -> void:
	# 1. Clear previous actors
	_clear_registry()

	# 2. Set Background
	var bg_name = scene_data.get("background", "")
	var bg_texture = _resource_registry.get(bg_name)
	if bg_texture:
		background_node.texture = bg_texture

	# 3. Spawn Characters
	for char_name in scene_data.get("characters", []):
		var char_instance = CHARACTER_SCENE.instantiate()
		characters_container.add_child(char_instance)
		register_node(char_name, char_instance)

		# Set default texture if available
		var texture = _resource_registry.get(char_name)
		if texture:
			char_instance.set_texture(texture)

	# 4. Spawn Objects
	for obj_name in scene_data.get("objects", []):
		var obj_instance = OBJECT_SCENE.instantiate()
		objects_container.add_child(obj_instance)
		register_node(obj_name, obj_instance)

		var texture = _resource_registry.get(obj_name)
		if texture:
			obj_instance.set_texture(texture)

## Resets the registry and clears instantiated actors.
func _clear_registry() -> void:
	_registry.clear()
	for child in characters_container.get_children():
		child.queue_free()
	for child in objects_container.get_children():
		child.queue_free()

## Loads and plays an entire episode.
func play_episode(data: Dictionary) -> void:
	print("[renderer]: Playing episode: ", data.get("title", "Untitled"))

	# Loop through scenes
	for scene in data.get("scenes", []):
		await setup_scene(scene)
		await execute_sequence(scene.get("actions", []))

	print("[renderer]: Episode complete.")
	episode_finished.emit()
