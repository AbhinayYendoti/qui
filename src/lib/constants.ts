// IntrovertChatter Constants

export const MOOD_ROOMS = [
  { id: 'overthinking', label: 'Overthinking', icon: '🌀', description: 'The loop you can\'t escape' },
  { id: 'social_anxiety', label: 'Social Anxiety', icon: '🫣', description: 'Replaying that conversation again' },
  { id: 'work_stress', label: 'Work Stress', icon: '💼', description: 'Sunday scaries, any day' },
  { id: 'lonely', label: 'Lonely', icon: '🌙', description: 'Even in a crowd' },
  { id: 'small_wins', label: 'Small Wins', icon: '✨', description: 'You did a thing. That counts.' },
  { id: '2am_thoughts', label: '2AM Thoughts', icon: '🌌', description: 'When everyone else is asleep' },
] as const;

export const REACTIONS = [
  { type: 'i_relate', label: "Introji's Relate", icon: '💙' },
  { type: 'heard_you', label: 'Heard You', icon: '👂' },
  { type: 'sending_strength', label: 'Sending Strength', icon: '💪' },
] as const;

export const GUIDED_PROMPTS = [
  "What's sitting in the back of your mind right now?",
  "Describe a moment you felt completely at ease.",
  "What does 'recharging' actually look like for you?",
  "What have you learned about yourself this year?",
  "What would your perfect quiet day include?",
] as const;

export const INTERESTS = [
  'reading', 'writing', 'gaming', 'art', 'music',
  'nature', 'photography', 'coding', 'cooking', 'meditation',
  'astronomy', 'philosophy', 'minimalism', 'journaling', 'podcasts',
] as const;

export const IDENTITY_SHAPES = ['Prism', 'Sphere', 'Node', 'Cube', 'Helix', 'Wave'] as const;
export const IDENTITY_PREFIXES = ['Alpha', 'Beta', 'Gamma', 'Delta', 'Theta', 'Zeta'] as const;

export type MoodRoom = typeof MOOD_ROOMS[number]['id'];
export type ReactionType = typeof REACTIONS[number]['type'];
