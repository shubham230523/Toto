extends Node2D

## Reusable Object Node
## Handles visual representation for props (apples, flowers, etc.)

@onready var sprite = $Sprite

## Sets the object's visual texture.
func set_texture(texture: Texture2D) -> void:
	sprite.texture = texture

## Convenience method to flip the object horizontally.
func set_facing_left(is_left: bool) -> void:
	sprite.flip_h = is_left

## Sets the visibility of the object.
func set_visible_state(is_visible: bool) -> void:
	visible = is_visible
