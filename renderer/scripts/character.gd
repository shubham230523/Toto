extends Node2D

## Reusable Character Node
## Handles visual representation and basic animations for story actors.

@onready var sprite = $Sprite
@onready var anim_player = $AnimationPlayer

## Sets the character's visual texture.
func set_texture(texture: Texture2D) -> void:
	sprite.texture = texture

## Plays a basic animation by name.
func play_animation(anim_name: String) -> void:
	if anim_player.has_animation(anim_name):
		anim_player.play(anim_name)
	else:
		push_warning("Animation not found: " + anim_name)

## Convenience method to flip the character horizontally.
func set_facing_left(is_left: bool) -> void:
	sprite.flip_h = is_left

## Sets the visibility of the character.
func set_visible_state(is_visible: bool) -> void:
	visible = is_visible
