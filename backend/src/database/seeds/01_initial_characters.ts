import { Knex } from "knex";

export async function seed(knex: Knex): Promise<void> {
    // Deletes ALL existing entries
    await knex("characters").del();

    // Inserts seed entries
    await knex("characters").insert([
        {
            name: "Toto",
            species: "Turtle",
            personality: "Thoughtful, curious, and gentle. Loves exploring at a slow and steady pace. Always notices the tiny details like a unique flower or a shiny pebble.",
            appearance: "A small, bright green turtle with a soft-edged, patterned shell in earth tones. Big, friendly brown eyes and a small, warm smile. Moves with cute, slightly clumsy steps.",
            weight: 40,
            metadata: JSON.stringify({
                role: "Protagonist",
                age_group: "Toddler",
                primary_color: "Green",
                is_canonical: true,
                traits: ["slow", "observant", "kind"]
            })
        },
        {
            name: "Bobo",
            species: "Bear",
            personality: "Playful, energetic, and a bit clumsy. Loves honey and big bear hugs.",
            appearance: "A fluffy brown bear cub with a blue scarf.",
            weight: 30,
            metadata: JSON.stringify({
                role: "Secondary",
                traits: ["energetic", "clumsy", "sweet"]
            })
        },
        {
            name: "Mimi",
            species: "Rabbit",
            personality: "Energetic, fast-talking, and loves colors.",
            appearance: "A white rabbit with a pink bow.",
            weight: 30,
            metadata: JSON.stringify({
                role: "Secondary",
                traits: ["fast", "colorful", "bright"]
            })
        }
    ]);
}
