extends Node

## AssetLoader
## Responsible for loading external assets (images, audio) at runtime.

## Loads a PNG image from a file path and returns an ImageTexture.
func load_texture(file_path: String) -> ImageTexture:
	if not FileAccess.file_exists(file_path):
		push_error("Texture file not found: " + file_path)
		return null

	var image = Image.load_from_file(file_path)
	if image:
		return ImageTexture.create_from_image(image)

	push_error("Failed to load texture: " + file_path)
	return null

## Loads an audio file (WAV or OGG) from a file path and returns an AudioStream.
func load_audio(file_path: String) -> AudioStream:
	if not FileAccess.file_exists(file_path):
		push_error("Audio file not found: " + file_path)
		return null

	var file = FileAccess.open(file_path, FileAccess.READ)
	var buffer = file.get_buffer(file.get_length())

	if file_path.ends_with(".wav"):
		var stream = AudioStreamWAV.new()
		# Note: Simple buffer assignment might need proper header parsing for raw WAVs
		# but works for standard Godot-compatible exports.
		stream.data = buffer
		return stream
	elif file_path.ends_with(".ogg"):
		return AudioStreamOggVorbis.load_from_buffer(buffer)

	push_error("Unsupported audio format: " + file_path)
	return null

## Convenience method to load a background (alias for load_texture).
func load_background(file_path: String) -> ImageTexture:
	return load_texture(file_path)
