import gleam/json
import gleam/dynamic/decode
import gleam/result

pub type CharacterInfo {
  CharacterInfo(
    character_id: String,
    class_type: Int,
    light: Int,
    emblem_path: String,
    background_path: String,
  )
}

fn character_info_decoder() -> decode.Decoder(CharacterInfo) {
  use character_id <- decode.field("characterId", decode.string)
  use class_type <- decode.field("classType", decode.int)
  use light <- decode.field("light", decode.int)
  use emblem_path <- decode.field("emblemPath", decode.string)
  use emblem_background_path <- decode.field("emblemBackgroundPath", decode.string)

  decode.success(CharacterInfo(
    character_id: character_id,
    class_type: class_type,
    light: light,
    emblem_path: emblem_path,
    background_path: emblem_background_path,
  ))
}

pub fn parse_linked_profiles(json_str: String) -> Result(List(CharacterInfo), String) {
  let decoder = decode.list(character_info_decoder())
  
  json.parse(from: json_str, using: decoder)
  |> result.map_error(fn(_) { "Failed to decode characters JSON" })
}
