extends Node2D

## Reusable Object Node
## Handles visual representation for props (apples, flowers, etc.)

@onready var sprite = $Sprite

## Sets the object's visual texture.
func set_texture(tex: Texture2D) -> void:
	if sprite:
		sprite.texture = tex
	else:
		# Fallback if called before @onready
		var s = get_node_or_null("Sprite")
		if s:
			s.texture = tex

## Convenience method to flip the object horizontally.
func set_facing_left(is_left: bool) -> void:
	sprite.flip_h = is_left

## Sets the visibility of the object.
func set_visible_state(is_visible: bool) -> void:
	visible = is_visible
