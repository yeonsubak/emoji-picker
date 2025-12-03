import { searchEmojis as searchEmojisByEngine } from 'emoogle-emoji-search-engine';
import emojiDataByEmoji from 'unicode-emoji-json/data-by-emoji.json';
import { filterSupportedEmojis } from './supportedEmojis';

import type {
  EmojiData,
  EmojiDataItem,
  EmojiGroupData as EmojiGroup,
  EmojiMetaByEmoji,
  EmojiMetadata,
} from '../types/emoji';

type GroupedEmojis = {
  category: string;
  emojis: EmojiMetadata[];
};

export const processEmojiData = (emojiData: any): EmojiData[] => {
  const processed: EmojiData[] = [];

  // Process each category
  for (const group of Object.values(emojiData)) {
    if (!group || typeof group !== 'object') continue;

    const { name: groupName, emojis } = group as any;
    if (!groupName || !emojis || typeof emojis !== 'object') continue;

    // Process emojis in this group
    for (const emoji of Object.values(emojis)) {
      if (!emoji || typeof emoji !== 'object') continue;

      const {
        emoji: char,
        name,
        skin_tone_support,
        skin_tone_support_unicode_version,
        unicode_version,
        emoji_version,
      } = emoji as any;
      if (char && name) {
        processed.push({
          emoji: char,
          name: name.toLowerCase(),
          group: groupName,
          skin_tone_support: !!skin_tone_support,
          skin_tone_support_unicode_version,
          unicode_version,
          emoji_version,
        });
      }
    }
  }

  return processed;
};

export const groupEmojisByCategory = (emojiData: any): GroupedEmojis[] => {
  if (!emojiData || typeof emojiData !== 'object') {
    return [];
  }

  const groups: EmojiGroup[] = [];

  for (const group of Object.values(emojiData)) {
    if (!group || typeof group !== 'object') continue;

    const { name, slug, emojis } = group as any;
    if (!name || !emojis || typeof emojis !== 'object') continue;

    const emojiItems: EmojiDataItem[] = [];
    for (const emoji of Object.values(emojis)) {
      if (!emoji || typeof emoji !== 'object') continue;

      const {
        emoji: char,
        name: emojiName,
        slug: emojiSlug,
        skin_tone_support,
        skin_tone_support_unicode_version,
        unicode_version,
        emoji_version,
      } = emoji as any;

      if (char && emojiName) {
        emojiItems.push({
          emoji: char,
          name: emojiName,
          slug: emojiSlug || emojiName.toLowerCase().replace(/\s+/g, '_'),
          skin_tone_support: !!skin_tone_support,
          skin_tone_support_unicode_version,
          unicode_version: unicode_version || '',
          emoji_version: emoji_version || '',
        });
      }
    }

    if (emojiItems.length > 0) {
      groups.push({
        name,
        slug: slug || name.toLowerCase().replace(/\s+/g, '_'),
        emojis: emojiItems,
      });
    }
  }

  return filterSupportedEmojis(groups);
};

const getMetaByEmoji = (emoji: string) => {
  const emojiDB: Record<string, EmojiMetaByEmoji> = emojiDataByEmoji;
  return emojiDB[emoji];
};

export const searchEmojis = (searchTerm: string): GroupedEmojis[] => {
  // Return empty array for empty search
  if (!searchTerm.trim()) {
    return [];
  }

  const normalizedSearch = searchTerm.toLowerCase();
  const matchingEmojis = searchEmojisByEngine(normalizedSearch);

  if (matchingEmojis.length === 0) {
    return [];
  }

  // Group matching emojis by category
  const groupedResults = new Map<string, EmojiMetadata[]>();

  matchingEmojis.forEach((emoji) => {
    const meta = getMetaByEmoji(emoji);

    const metadata: EmojiMetadata = {
      emoji: emoji,
      name: meta.name,
      slug: meta.name.replace(/\s+/g, '_'),
      skin_tone_support: meta.skin_tone_support,
      skin_tone_support_unicode_version: meta.skin_tone_support_unicode_version,
    };

    if (!groupedResults.has(meta.group)) {
      groupedResults.set(meta.group, []);
    }
    groupedResults.get(meta.group)!.push(metadata);
  });

  return Array.from(groupedResults.entries()).map(([category, emojis]) => ({
    category,
    emojis,
  }));
};
