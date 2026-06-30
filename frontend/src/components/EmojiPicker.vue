<template>
  <div class="emoji-picker bg-gray-800 rounded-lg shadow-2xl border border-gray-700 w-80" @click.stop>
    <!-- Header with search -->
    <div class="p-3 border-b border-gray-700">
      <input
        v-model="searchQuery"
        type="text"
        placeholder="Search emojis..."
        class="w-full px-3 py-2 bg-gray-900 text-white rounded-lg border border-gray-600 focus:outline-none focus:border-blue-500 text-sm"
        @input="filterEmojis"
      />
    </div>

    <!-- Category tabs -->
    <div class="flex overflow-x-auto border-b border-gray-700 px-2 py-2 space-x-1">
      <button
        v-for="category in categories"
        :key="category.name"
        @click="selectedCategory = category.name"
        :class="[
          'px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap',
          selectedCategory === category.name
            ? 'bg-blue-600 text-white'
            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
        ]"
      >
        {{ category.icon }} {{ category.label }}
      </button>
    </div>

    <!-- Emoji grid -->
    <div class="p-3 h-64 overflow-y-auto custom-scrollbar">
      <div v-if="filteredEmojis.length === 0" class="text-center text-gray-400 py-10">
        No emojis found
      </div>
      <div v-else class="grid grid-cols-8 gap-2">
        <button
          v-for="emoji in filteredEmojis"
          :key="emoji.emoji"
          @click="selectEmoji(emoji)"
          :title="emoji.name"
          class="text-2xl hover:bg-gray-700 rounded p-1 transition-colors"
        >
          {{ emoji.emoji }}
        </button>
      </div>
    </div>

    <!-- Recently used -->
    <div v-if="recentEmojis.length > 0 && !searchQuery" class="border-t border-gray-700 p-3">
      <div class="text-xs text-gray-400 mb-2">Recently Used</div>
      <div class="flex space-x-2">
        <button
          v-for="emoji in recentEmojis.slice(0, 10)"
          :key="emoji"
          @click="selectEmoji({ emoji })"
          class="text-2xl hover:bg-gray-700 rounded p-1 transition-colors"
        >
          {{ emoji }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

const emit = defineEmits(['select'])

const searchQuery = ref('')
const selectedCategory = ref('Smileys')
const recentEmojis = ref([])

// Emoji categories with comprehensive emoji data
const categories = [
  { name: 'Smileys', label: 'Smileys', icon: '😀' },
  { name: 'Gestures', label: 'Gestures', icon: '👍' },
  { name: 'People', label: 'People', icon: '👨' },
  { name: 'Animals', label: 'Animals', icon: '🐶' },
  { name: 'Food', label: 'Food', icon: '🍕' },
  { name: 'Travel', label: 'Travel', icon: '✈️' },
  { name: 'Activities', label: 'Activities', icon: '⚽' },
  { name: 'Objects', label: 'Objects', icon: '💡' },
  { name: 'Symbols', label: 'Symbols', icon: '❤️' },
  { name: 'Flags', label: 'Flags', icon: '🏁' }
]

// Comprehensive emoji database
const emojis = [
  // Smileys & Emotion
  { emoji: '😀', name: 'grinning face', category: 'Smileys' },
  { emoji: '😃', name: 'grinning face with big eyes', category: 'Smileys' },
  { emoji: '😄', name: 'grinning face with smiling eyes', category: 'Smileys' },
  { emoji: '😁', name: 'beaming face with smiling eyes', category: 'Smileys' },
  { emoji: '😆', name: 'grinning squinting face', category: 'Smileys' },
  { emoji: '😅', name: 'grinning face with sweat', category: 'Smileys' },
  { emoji: '🤣', name: 'rolling on the floor laughing', category: 'Smileys' },
  { emoji: '😂', name: 'face with tears of joy', category: 'Smileys' },
  { emoji: '🙂', name: 'slightly smiling face', category: 'Smileys' },
  { emoji: '🙃', name: 'upside down face', category: 'Smileys' },
  { emoji: '😉', name: 'winking face', category: 'Smileys' },
  { emoji: '😊', name: 'smiling face with smiling eyes', category: 'Smileys' },
  { emoji: '😇', name: 'smiling face with halo', category: 'Smileys' },
  { emoji: '🥰', name: 'smiling face with hearts', category: 'Smileys' },
  { emoji: '😍', name: 'smiling face with heart-eyes', category: 'Smileys' },
  { emoji: '🤩', name: 'star-struck', category: 'Smileys' },
  { emoji: '😘', name: 'face blowing a kiss', category: 'Smileys' },
  { emoji: '😗', name: 'kissing face', category: 'Smileys' },
  { emoji: '😚', name: 'kissing face with closed eyes', category: 'Smileys' },
  { emoji: '😙', name: 'kissing face with smiling eyes', category: 'Smileys' },
  { emoji: '🥲', name: 'smiling face with tear', category: 'Smileys' },
  { emoji: '😋', name: 'face savoring food', category: 'Smileys' },
  { emoji: '😛', name: 'face with tongue', category: 'Smileys' },
  { emoji: '😜', name: 'winking face with tongue', category: 'Smileys' },
  { emoji: '🤪', name: 'zany face', category: 'Smileys' },
  { emoji: '😝', name: 'squinting face with tongue', category: 'Smileys' },
  { emoji: '🤑', name: 'money-mouth face', category: 'Smileys' },
  { emoji: '🤗', name: 'hugging face', category: 'Smileys' },
  { emoji: '🤭', name: 'face with hand over mouth', category: 'Smileys' },
  { emoji: '🤫', name: 'shushing face', category: 'Smileys' },
  { emoji: '🤔', name: 'thinking face', category: 'Smileys' },
  { emoji: '🤐', name: 'zipper-mouth face', category: 'Smileys' },
  { emoji: '🤨', name: 'face with raised eyebrow', category: 'Smileys' },
  { emoji: '😐', name: 'neutral face', category: 'Smileys' },
  { emoji: '😑', name: 'expressionless face', category: 'Smileys' },
  { emoji: '😶', name: 'face without mouth', category: 'Smileys' },
  { emoji: '😏', name: 'smirking face', category: 'Smileys' },
  { emoji: '😒', name: 'unamused face', category: 'Smileys' },
  { emoji: '🙄', name: 'face with rolling eyes', category: 'Smileys' },
  { emoji: '😬', name: 'grimacing face', category: 'Smileys' },
  { emoji: '🤥', name: 'lying face', category: 'Smileys' },
  { emoji: '😌', name: 'relieved face', category: 'Smileys' },
  { emoji: '😔', name: 'pensive face', category: 'Smileys' },
  { emoji: '😪', name: 'sleepy face', category: 'Smileys' },
  { emoji: '🤤', name: 'drooling face', category: 'Smileys' },
  { emoji: '😴', name: 'sleeping face', category: 'Smileys' },
  { emoji: '😷', name: 'face with medical mask', category: 'Smileys' },
  { emoji: '🤒', name: 'face with thermometer', category: 'Smileys' },
  { emoji: '🤕', name: 'face with head-bandage', category: 'Smileys' },
  { emoji: '🤢', name: 'nauseated face', category: 'Smileys' },
  { emoji: '🤮', name: 'face vomiting', category: 'Smileys' },
  { emoji: '🤧', name: 'sneezing face', category: 'Smileys' },
  { emoji: '🥵', name: 'hot face', category: 'Smileys' },
  { emoji: '🥶', name: 'cold face', category: 'Smileys' },
  { emoji: '😎', name: 'smiling face with sunglasses', category: 'Smileys' },
  { emoji: '🤓', name: 'nerd face', category: 'Smileys' },
  { emoji: '🧐', name: 'face with monocle', category: 'Smileys' },
  { emoji: '😕', name: 'confused face', category: 'Smileys' },
  { emoji: '😟', name: 'worried face', category: 'Smileys' },
  { emoji: '🙁', name: 'slightly frowning face', category: 'Smileys' },
  { emoji: '☹️', name: 'frowning face', category: 'Smileys' },
  { emoji: '😮', name: 'face with open mouth', category: 'Smileys' },
  { emoji: '😯', name: 'hushed face', category: 'Smileys' },
  { emoji: '😲', name: 'astonished face', category: 'Smileys' },
  { emoji: '😳', name: 'flushed face', category: 'Smileys' },
  { emoji: '🥺', name: 'pleading face', category: 'Smileys' },
  { emoji: '😦', name: 'frowning face with open mouth', category: 'Smileys' },
  { emoji: '😧', name: 'anguished face', category: 'Smileys' },
  { emoji: '😨', name: 'fearful face', category: 'Smileys' },
  { emoji: '😰', name: 'anxious face with sweat', category: 'Smileys' },
  { emoji: '😥', name: 'sad but relieved face', category: 'Smileys' },
  { emoji: '😢', name: 'crying face', category: 'Smileys' },
  { emoji: '😭', name: 'loudly crying face', category: 'Smileys' },
  { emoji: '😱', name: 'face screaming in fear', category: 'Smileys' },
  { emoji: '😖', name: 'confounded face', category: 'Smileys' },
  { emoji: '😣', name: 'persevering face', category: 'Smileys' },
  { emoji: '😞', name: 'disappointed face', category: 'Smileys' },
  { emoji: '😓', name: 'downcast face with sweat', category: 'Smileys' },
  { emoji: '😩', name: 'weary face', category: 'Smileys' },
  { emoji: '😫', name: 'tired face', category: 'Smileys' },
  { emoji: '🥱', name: 'yawning face', category: 'Smileys' },
  { emoji: '😤', name: 'face with steam from nose', category: 'Smileys' },
  { emoji: '😡', name: 'pouting face', category: 'Smileys' },
  { emoji: '😠', name: 'angry face', category: 'Smileys' },
  { emoji: '🤬', name: 'face with symbols on mouth', category: 'Smileys' },

  // Gestures & Body Parts
  { emoji: '👍', name: 'thumbs up', category: 'Gestures' },
  { emoji: '👎', name: 'thumbs down', category: 'Gestures' },
  { emoji: '👌', name: 'OK hand', category: 'Gestures' },
  { emoji: '✌️', name: 'victory hand', category: 'Gestures' },
  { emoji: '🤞', name: 'crossed fingers', category: 'Gestures' },
  { emoji: '🤟', name: 'love-you gesture', category: 'Gestures' },
  { emoji: '🤘', name: 'sign of the horns', category: 'Gestures' },
  { emoji: '🤙', name: 'call me hand', category: 'Gestures' },
  { emoji: '👈', name: 'backhand index pointing left', category: 'Gestures' },
  { emoji: '👉', name: 'backhand index pointing right', category: 'Gestures' },
  { emoji: '👆', name: 'backhand index pointing up', category: 'Gestures' },
  { emoji: '👇', name: 'backhand index pointing down', category: 'Gestures' },
  { emoji: '☝️', name: 'index pointing up', category: 'Gestures' },
  { emoji: '✋', name: 'raised hand', category: 'Gestures' },
  { emoji: '🤚', name: 'raised back of hand', category: 'Gestures' },
  { emoji: '🖐️', name: 'hand with fingers splayed', category: 'Gestures' },
  { emoji: '🖖', name: 'vulcan salute', category: 'Gestures' },
  { emoji: '👋', name: 'waving hand', category: 'Gestures' },
  { emoji: '🤝', name: 'handshake', category: 'Gestures' },
  { emoji: '🙏', name: 'folded hands', category: 'Gestures' },
  { emoji: '✍️', name: 'writing hand', category: 'Gestures' },
  { emoji: '💪', name: 'flexed biceps', category: 'Gestures' },
  { emoji: '👏', name: 'clapping hands', category: 'Gestures' },
  { emoji: '🙌', name: 'raising hands', category: 'Gestures' },
  { emoji: '👐', name: 'open hands', category: 'Gestures' },
  { emoji: '🤲', name: 'palms up together', category: 'Gestures' },

  // People
  { emoji: '👶', name: 'baby', category: 'People' },
  { emoji: '👧', name: 'girl', category: 'People' },
  { emoji: '🧒', name: 'child', category: 'People' },
  { emoji: '👦', name: 'boy', category: 'People' },
  { emoji: '👩', name: 'woman', category: 'People' },
  { emoji: '🧑', name: 'person', category: 'People' },
  { emoji: '👨', name: 'man', category: 'People' },
  { emoji: '👵', name: 'old woman', category: 'People' },
  { emoji: '🧓', name: 'older person', category: 'People' },
  { emoji: '👴', name: 'old man', category: 'People' },
  { emoji: '👱‍♀️', name: 'woman blond hair', category: 'People' },
  { emoji: '👱', name: 'person blond hair', category: 'People' },
  { emoji: '👱‍♂️', name: 'man blond hair', category: 'People' },
  { emoji: '👨‍💻', name: 'man technologist', category: 'People' },
  { emoji: '👩‍💻', name: 'woman technologist', category: 'People' },
  { emoji: '👨‍🎓', name: 'man student', category: 'People' },
  { emoji: '👩‍🎓', name: 'woman student', category: 'People' },
  { emoji: '👨‍🏫', name: 'man teacher', category: 'People' },
  { emoji: '👩‍🏫', name: 'woman teacher', category: 'People' },

  // Animals & Nature
  { emoji: '🐶', name: 'dog face', category: 'Animals' },
  { emoji: '🐱', name: 'cat face', category: 'Animals' },
  { emoji: '🐭', name: 'mouse face', category: 'Animals' },
  { emoji: '🐹', name: 'hamster', category: 'Animals' },
  { emoji: '🐰', name: 'rabbit face', category: 'Animals' },
  { emoji: '🦊', name: 'fox', category: 'Animals' },
  { emoji: '🐻', name: 'bear', category: 'Animals' },
  { emoji: '🐼', name: 'panda', category: 'Animals' },
  { emoji: '🐨', name: 'koala', category: 'Animals' },
  { emoji: '🐯', name: 'tiger face', category: 'Animals' },
  { emoji: '🦁', name: 'lion', category: 'Animals' },
  { emoji: '🐮', name: 'cow face', category: 'Animals' },
  { emoji: '🐷', name: 'pig face', category: 'Animals' },
  { emoji: '🐸', name: 'frog', category: 'Animals' },
  { emoji: '🐵', name: 'monkey face', category: 'Animals' },
  { emoji: '🙈', name: 'see-no-evil monkey', category: 'Animals' },
  { emoji: '🙉', name: 'hear-no-evil monkey', category: 'Animals' },
  { emoji: '🙊', name: 'speak-no-evil monkey', category: 'Animals' },
  { emoji: '🐔', name: 'chicken', category: 'Animals' },
  { emoji: '🐧', name: 'penguin', category: 'Animals' },
  { emoji: '🐦', name: 'bird', category: 'Animals' },
  { emoji: '🐤', name: 'baby chick', category: 'Animals' },
  { emoji: '🦆', name: 'duck', category: 'Animals' },
  { emoji: '🦅', name: 'eagle', category: 'Animals' },
  { emoji: '🦉', name: 'owl', category: 'Animals' },
  { emoji: '🦇', name: 'bat', category: 'Animals' },
  { emoji: '🐺', name: 'wolf', category: 'Animals' },
  { emoji: '🐗', name: 'boar', category: 'Animals' },
  { emoji: '🐴', name: 'horse face', category: 'Animals' },
  { emoji: '🦄', name: 'unicorn', category: 'Animals' },
  { emoji: '🐝', name: 'honeybee', category: 'Animals' },
  { emoji: '🐛', name: 'bug', category: 'Animals' },
  { emoji: '🦋', name: 'butterfly', category: 'Animals' },
  { emoji: '🐌', name: 'snail', category: 'Animals' },
  { emoji: '🐞', name: 'lady beetle', category: 'Animals' },
  { emoji: '🐢', name: 'turtle', category: 'Animals' },
  { emoji: '🐍', name: 'snake', category: 'Animals' },
  { emoji: '🦎', name: 'lizard', category: 'Animals' },
  { emoji: '🦖', name: 'T-Rex', category: 'Animals' },
  { emoji: '🦕', name: 'sauropod', category: 'Animals' },
  { emoji: '🐙', name: 'octopus', category: 'Animals' },
  { emoji: '🦑', name: 'squid', category: 'Animals' },
  { emoji: '🦐', name: 'shrimp', category: 'Animals' },
  { emoji: '🦞', name: 'lobster', category: 'Animals' },
  { emoji: '🦀', name: 'crab', category: 'Animals' },
  { emoji: '🐡', name: 'blowfish', category: 'Animals' },
  { emoji: '🐠', name: 'tropical fish', category: 'Animals' },
  { emoji: '🐟', name: 'fish', category: 'Animals' },
  { emoji: '🐬', name: 'dolphin', category: 'Animals' },
  { emoji: '🐳', name: 'spouting whale', category: 'Animals' },
  { emoji: '🐋', name: 'whale', category: 'Animals' },
  { emoji: '🦈', name: 'shark', category: 'Animals' },

  // Food & Drink
  { emoji: '🍎', name: 'red apple', category: 'Food' },
  { emoji: '🍊', name: 'tangerine', category: 'Food' },
  { emoji: '🍋', name: 'lemon', category: 'Food' },
  { emoji: '🍌', name: 'banana', category: 'Food' },
  { emoji: '🍉', name: 'watermelon', category: 'Food' },
  { emoji: '🍇', name: 'grapes', category: 'Food' },
  { emoji: '🍓', name: 'strawberry', category: 'Food' },
  { emoji: '🍈', name: 'melon', category: 'Food' },
  { emoji: '🍒', name: 'cherries', category: 'Food' },
  { emoji: '🍑', name: 'peach', category: 'Food' },
  { emoji: '🥭', name: 'mango', category: 'Food' },
  { emoji: '🍍', name: 'pineapple', category: 'Food' },
  { emoji: '🥥', name: 'coconut', category: 'Food' },
  { emoji: '🥝', name: 'kiwi fruit', category: 'Food' },
  { emoji: '🍅', name: 'tomato', category: 'Food' },
  { emoji: '🍆', name: 'eggplant', category: 'Food' },
  { emoji: '🥑', name: 'avocado', category: 'Food' },
  { emoji: '🥦', name: 'broccoli', category: 'Food' },
  { emoji: '🥬', name: 'leafy green', category: 'Food' },
  { emoji: '🥒', name: 'cucumber', category: 'Food' },
  { emoji: '🌶️', name: 'hot pepper', category: 'Food' },
  { emoji: '🌽', name: 'ear of corn', category: 'Food' },
  { emoji: '🥕', name: 'carrot', category: 'Food' },
  { emoji: '🥔', name: 'potato', category: 'Food' },
  { emoji: '🍠', name: 'roasted sweet potato', category: 'Food' },
  { emoji: '🥐', name: 'croissant', category: 'Food' },
  { emoji: '🥖', name: 'baguette bread', category: 'Food' },
  { emoji: '🥨', name: 'pretzel', category: 'Food' },
  { emoji: '🥯', name: 'bagel', category: 'Food' },
  { emoji: '🥞', name: 'pancakes', category: 'Food' },
  { emoji: '🧇', name: 'waffle', category: 'Food' },
  { emoji: '🧀', name: 'cheese wedge', category: 'Food' },
  { emoji: '🍖', name: 'meat on bone', category: 'Food' },
  { emoji: '🍗', name: 'poultry leg', category: 'Food' },
  { emoji: '🥩', name: 'cut of meat', category: 'Food' },
  { emoji: '🥓', name: 'bacon', category: 'Food' },
  { emoji: '🍔', name: 'hamburger', category: 'Food' },
  { emoji: '🍟', name: 'french fries', category: 'Food' },
  { emoji: '🍕', name: 'pizza', category: 'Food' },
  { emoji: '🌭', name: 'hot dog', category: 'Food' },
  { emoji: '🥪', name: 'sandwich', category: 'Food' },
  { emoji: '🌮', name: 'taco', category: 'Food' },
  { emoji: '🌯', name: 'burrito', category: 'Food' },
  { emoji: '🥙', name: 'stuffed flatbread', category: 'Food' },
  { emoji: '🧆', name: 'falafel', category: 'Food' },
  { emoji: '🥚', name: 'egg', category: 'Food' },
  { emoji: '🍳', name: 'cooking', category: 'Food' },
  { emoji: '🥘', name: 'shallow pan of food', category: 'Food' },
  { emoji: '🍲', name: 'pot of food', category: 'Food' },
  { emoji: '🥣', name: 'bowl with spoon', category: 'Food' },
  { emoji: '🥗', name: 'green salad', category: 'Food' },
  { emoji: '🍿', name: 'popcorn', category: 'Food' },
  { emoji: '🧈', name: 'butter', category: 'Food' },
  { emoji: '🧂', name: 'salt', category: 'Food' },
  { emoji: '🥫', name: 'canned food', category: 'Food' },
  { emoji: '🍱', name: 'bento box', category: 'Food' },
  { emoji: '🍘', name: 'rice cracker', category: 'Food' },
  { emoji: '🍙', name: 'rice ball', category: 'Food' },
  { emoji: '🍚', name: 'cooked rice', category: 'Food' },
  { emoji: '🍛', name: 'curry rice', category: 'Food' },
  { emoji: '🍜', name: 'steaming bowl', category: 'Food' },
  { emoji: '🍝', name: 'spaghetti', category: 'Food' },
  { emoji: '🍠', name: 'roasted sweet potato', category: 'Food' },
  { emoji: '🍢', name: 'oden', category: 'Food' },
  { emoji: '🍣', name: 'sushi', category: 'Food' },
  { emoji: '🍤', name: 'fried shrimp', category: 'Food' },
  { emoji: '🍥', name: 'fish cake with swirl', category: 'Food' },
  { emoji: '🥮', name: 'moon cake', category: 'Food' },
  { emoji: '🍡', name: 'dango', category: 'Food' },
  { emoji: '🥟', name: 'dumpling', category: 'Food' },
  { emoji: '🥠', name: 'fortune cookie', category: 'Food' },
  { emoji: '🥡', name: 'takeout box', category: 'Food' },
  { emoji: '🦪', name: 'oyster', category: 'Food' },
  { emoji: '🍦', name: 'soft ice cream', category: 'Food' },
  { emoji: '🍧', name: 'shaved ice', category: 'Food' },
  { emoji: '🍨', name: 'ice cream', category: 'Food' },
  { emoji: '🍩', name: 'doughnut', category: 'Food' },
  { emoji: '🍪', name: 'cookie', category: 'Food' },
  { emoji: '🎂', name: 'birthday cake', category: 'Food' },
  { emoji: '🍰', name: 'shortcake', category: 'Food' },
  { emoji: '🧁', name: 'cupcake', category: 'Food' },
  { emoji: '🥧', name: 'pie', category: 'Food' },
  { emoji: '🍫', name: 'chocolate bar', category: 'Food' },
  { emoji: '🍬', name: 'candy', category: 'Food' },
  { emoji: '🍭', name: 'lollipop', category: 'Food' },
  { emoji: '🍮', name: 'custard', category: 'Food' },
  { emoji: '🍯', name: 'honey pot', category: 'Food' },
  { emoji: '🍼', name: 'baby bottle', category: 'Food' },
  { emoji: '🥛', name: 'glass of milk', category: 'Food' },
  { emoji: '☕', name: 'hot beverage', category: 'Food' },
  { emoji: '🍵', name: 'teacup without handle', category: 'Food' },
  { emoji: '🍶', name: 'sake', category: 'Food' },
  { emoji: '🍾', name: 'bottle with popping cork', category: 'Food' },
  { emoji: '🍷', name: 'wine glass', category: 'Food' },
  { emoji: '🍸', name: 'cocktail glass', category: 'Food' },
  { emoji: '🍹', name: 'tropical drink', category: 'Food' },
  { emoji: '🍺', name: 'beer mug', category: 'Food' },
  { emoji: '🍻', name: 'clinking beer mugs', category: 'Food' },
  { emoji: '🥂', name: 'clinking glasses', category: 'Food' },
  { emoji: '🥃', name: 'tumbler glass', category: 'Food' },
  { emoji: '🥤', name: 'cup with straw', category: 'Food' },
  { emoji: '🧃', name: 'beverage box', category: 'Food' },
  { emoji: '🧉', name: 'mate', category: 'Food' },
  { emoji: '🧊', name: 'ice', category: 'Food' },

  // Travel & Places
  { emoji: '🚗', name: 'automobile', category: 'Travel' },
  { emoji: '🚕', name: 'taxi', category: 'Travel' },
  { emoji: '🚙', name: 'sport utility vehicle', category: 'Travel' },
  { emoji: '🚌', name: 'bus', category: 'Travel' },
  { emoji: '🚎', name: 'trolleybus', category: 'Travel' },
  { emoji: '🏎️', name: 'racing car', category: 'Travel' },
  { emoji: '🚓', name: 'police car', category: 'Travel' },
  { emoji: '🚑', name: 'ambulance', category: 'Travel' },
  { emoji: '🚒', name: 'fire engine', category: 'Travel' },
  { emoji: '🚐', name: 'minibus', category: 'Travel' },
  { emoji: '🚚', name: 'delivery truck', category: 'Travel' },
  { emoji: '🚛', name: 'articulated lorry', category: 'Travel' },
  { emoji: '🚜', name: 'tractor', category: 'Travel' },
  { emoji: '🛴', name: 'kick scooter', category: 'Travel' },
  { emoji: '🚲', name: 'bicycle', category: 'Travel' },
  { emoji: '🛵', name: 'motor scooter', category: 'Travel' },
  { emoji: '🏍️', name: 'motorcycle', category: 'Travel' },
  { emoji: '✈️', name: 'airplane', category: 'Travel' },
  { emoji: '🚁', name: 'helicopter', category: 'Travel' },
  { emoji: '🚂', name: 'locomotive', category: 'Travel' },
  { emoji: '🚆', name: 'train', category: 'Travel' },
  { emoji: '🚇', name: 'metro', category: 'Travel' },
  { emoji: '🚊', name: 'tram', category: 'Travel' },
  { emoji: '🚉', name: 'station', category: 'Travel' },
  { emoji: '🚄', name: 'high-speed train', category: 'Travel' },
  { emoji: '🚅', name: 'bullet train', category: 'Travel' },
  { emoji: '🚈', name: 'light rail', category: 'Travel' },
  { emoji: '🚝', name: 'monorail', category: 'Travel' },
  { emoji: '🚞', name: 'mountain railway', category: 'Travel' },
  { emoji: '🚋', name: 'tram car', category: 'Travel' },
  { emoji: '🚃', name: 'railway car', category: 'Travel' },
  { emoji: '🚟', name: 'suspension railway', category: 'Travel' },
  { emoji: '🚠', name: 'mountain cableway', category: 'Travel' },
  { emoji: '🚡', name: 'aerial tramway', category: 'Travel' },
  { emoji: '🚢', name: 'ship', category: 'Travel' },
  { emoji: '⛴️', name: 'ferry', category: 'Travel' },
  { emoji: '🛳️', name: 'passenger ship', category: 'Travel' },
  { emoji: '⛵', name: 'sailboat', category: 'Travel' },
  { emoji: '🚤', name: 'speedboat', category: 'Travel' },
  { emoji: '⚓', name: 'anchor', category: 'Travel' },
  { emoji: '🚀', name: 'rocket', category: 'Travel' },
  { emoji: '🛸', name: 'flying saucer', category: 'Travel' },

  // Activities
  { emoji: '⚽', name: 'soccer ball', category: 'Activities' },
  { emoji: '🏀', name: 'basketball', category: 'Activities' },
  { emoji: '🏈', name: 'american football', category: 'Activities' },
  { emoji: '⚾', name: 'baseball', category: 'Activities' },
  { emoji: '🥎', name: 'softball', category: 'Activities' },
  { emoji: '🎾', name: 'tennis', category: 'Activities' },
  { emoji: '🏐', name: 'volleyball', category: 'Activities' },
  { emoji: '🏉', name: 'rugby football', category: 'Activities' },
  { emoji: '🥏', name: 'flying disc', category: 'Activities' },
  { emoji: '🎱', name: 'pool 8 ball', category: 'Activities' },
  { emoji: '🏓', name: 'ping pong', category: 'Activities' },
  { emoji: '🏸', name: 'badminton', category: 'Activities' },
  { emoji: '🏒', name: 'ice hockey', category: 'Activities' },
  { emoji: '🏑', name: 'field hockey', category: 'Activities' },
  { emoji: '🥍', name: 'lacrosse', category: 'Activities' },
  { emoji: '🏏', name: 'cricket game', category: 'Activities' },
  { emoji: '⛳', name: 'flag in hole', category: 'Activities' },
  { emoji: '🏹', name: 'bow and arrow', category: 'Activities' },
  { emoji: '🎣', name: 'fishing pole', category: 'Activities' },
  { emoji: '🥊', name: 'boxing glove', category: 'Activities' },
  { emoji: '🥋', name: 'martial arts uniform', category: 'Activities' },
  { emoji: '🎮', name: 'video game', category: 'Activities' },
  { emoji: '🕹️', name: 'joystick', category: 'Activities' },
  { emoji: '🎲', name: 'game die', category: 'Activities' },
  { emoji: '♠️', name: 'spade suit', category: 'Activities' },
  { emoji: '♥️', name: 'heart suit', category: 'Activities' },
  { emoji: '♦️', name: 'diamond suit', category: 'Activities' },
  { emoji: '♣️', name: 'club suit', category: 'Activities' },
  { emoji: '🎯', name: 'direct hit', category: 'Activities' },
  { emoji: '🎨', name: 'artist palette', category: 'Activities' },
  { emoji: '🎭', name: 'performing arts', category: 'Activities' },
  { emoji: '🎪', name: 'circus tent', category: 'Activities' },
  { emoji: '🎬', name: 'clapper board', category: 'Activities' },
  { emoji: '🎤', name: 'microphone', category: 'Activities' },
  { emoji: '🎧', name: 'headphone', category: 'Activities' },
  { emoji: '🎼', name: 'musical score', category: 'Activities' },
  { emoji: '🎹', name: 'musical keyboard', category: 'Activities' },
  { emoji: '🥁', name: 'drum', category: 'Activities' },
  { emoji: '🎷', name: 'saxophone', category: 'Activities' },
  { emoji: '🎺', name: 'trumpet', category: 'Activities' },
  { emoji: '🎸', name: 'guitar', category: 'Activities' },
  { emoji: '🎻', name: 'violin', category: 'Activities' },

  // Objects
  { emoji: '⌚', name: 'watch', category: 'Objects' },
  { emoji: '📱', name: 'mobile phone', category: 'Objects' },
  { emoji: '💻', name: 'laptop', category: 'Objects' },
  { emoji: '⌨️', name: 'keyboard', category: 'Objects' },
  { emoji: '🖥️', name: 'desktop computer', category: 'Objects' },
  { emoji: '🖨️', name: 'printer', category: 'Objects' },
  { emoji: '🖱️', name: 'computer mouse', category: 'Objects' },
  { emoji: '🖲️', name: 'trackball', category: 'Objects' },
  { emoji: '💾', name: 'floppy disk', category: 'Objects' },
  { emoji: '💿', name: 'optical disk', category: 'Objects' },
  { emoji: '📀', name: 'dvd', category: 'Objects' },
  { emoji: '🎥', name: 'movie camera', category: 'Objects' },
  { emoji: '📷', name: 'camera', category: 'Objects' },
  { emoji: '📸', name: 'camera with flash', category: 'Objects' },
  { emoji: '📹', name: 'video camera', category: 'Objects' },
  { emoji: '📼', name: 'videocassette', category: 'Objects' },
  { emoji: '🔍', name: 'magnifying glass tilted left', category: 'Objects' },
  { emoji: '🔎', name: 'magnifying glass tilted right', category: 'Objects' },
  { emoji: '💡', name: 'light bulb', category: 'Objects' },
  { emoji: '🔦', name: 'flashlight', category: 'Objects' },
  { emoji: '🏮', name: 'red paper lantern', category: 'Objects' },
  { emoji: '📔', name: 'notebook with decorative cover', category: 'Objects' },
  { emoji: '📕', name: 'closed book', category: 'Objects' },
  { emoji: '📖', name: 'open book', category: 'Objects' },
  { emoji: '📗', name: 'green book', category: 'Objects' },
  { emoji: '📘', name: 'blue book', category: 'Objects' },
  { emoji: '📙', name: 'orange book', category: 'Objects' },
  { emoji: '📚', name: 'books', category: 'Objects' },
  { emoji: '📓', name: 'notebook', category: 'Objects' },
  { emoji: '📒', name: 'ledger', category: 'Objects' },
  { emoji: '📃', name: 'page with curl', category: 'Objects' },
  { emoji: '📜', name: 'scroll', category: 'Objects' },
  { emoji: '📄', name: 'page facing up', category: 'Objects' },
  { emoji: '📰', name: 'newspaper', category: 'Objects' },
  { emoji: '📑', name: 'bookmark tabs', category: 'Objects' },
  { emoji: '🔖', name: 'bookmark', category: 'Objects' },
  { emoji: '💰', name: 'money bag', category: 'Objects' },
  { emoji: '💴', name: 'yen banknote', category: 'Objects' },
  { emoji: '💵', name: 'dollar banknote', category: 'Objects' },
  { emoji: '💶', name: 'euro banknote', category: 'Objects' },
  { emoji: '💷', name: 'pound banknote', category: 'Objects' },
  { emoji: '💸', name: 'money with wings', category: 'Objects' },
  { emoji: '💳', name: 'credit card', category: 'Objects' },
  { emoji: '🎁', name: 'wrapped gift', category: 'Objects' },
  { emoji: '🎀', name: 'ribbon', category: 'Objects' },
  { emoji: '🎈', name: 'balloon', category: 'Objects' },
  { emoji: '🎉', name: 'party popper', category: 'Objects' },
  { emoji: '🎊', name: 'confetti ball', category: 'Objects' },

  // Symbols
  { emoji: '❤️', name: 'red heart', category: 'Symbols' },
  { emoji: '🧡', name: 'orange heart', category: 'Symbols' },
  { emoji: '💛', name: 'yellow heart', category: 'Symbols' },
  { emoji: '💚', name: 'green heart', category: 'Symbols' },
  { emoji: '💙', name: 'blue heart', category: 'Symbols' },
  { emoji: '💜', name: 'purple heart', category: 'Symbols' },
  { emoji: '🖤', name: 'black heart', category: 'Symbols' },
  { emoji: '🤍', name: 'white heart', category: 'Symbols' },
  { emoji: '🤎', name: 'brown heart', category: 'Symbols' },
  { emoji: '💔', name: 'broken heart', category: 'Symbols' },
  { emoji: '❣️', name: 'heart exclamation', category: 'Symbols' },
  { emoji: '💕', name: 'two hearts', category: 'Symbols' },
  { emoji: '💞', name: 'revolving hearts', category: 'Symbols' },
  { emoji: '💓', name: 'beating heart', category: 'Symbols' },
  { emoji: '💗', name: 'growing heart', category: 'Symbols' },
  { emoji: '💖', name: 'sparkling heart', category: 'Symbols' },
  { emoji: '💘', name: 'heart with arrow', category: 'Symbols' },
  { emoji: '💝', name: 'heart with ribbon', category: 'Symbols' },
  { emoji: '💟', name: 'heart decoration', category: 'Symbols' },
  { emoji: '☮️', name: 'peace symbol', category: 'Symbols' },
  { emoji: '✝️', name: 'latin cross', category: 'Symbols' },
  { emoji: '☪️', name: 'star and crescent', category: 'Symbols' },
  { emoji: '🕉️', name: 'om', category: 'Symbols' },
  { emoji: '☸️', name: 'wheel of dharma', category: 'Symbols' },
  { emoji: '✡️', name: 'star of David', category: 'Symbols' },
  { emoji: '🔯', name: 'dotted six-pointed star', category: 'Symbols' },
  { emoji: '🕎', name: 'menorah', category: 'Symbols' },
  { emoji: '☯️', name: 'yin yang', category: 'Symbols' },
  { emoji: '☦️', name: 'orthodox cross', category: 'Symbols' },
  { emoji: '♈', name: 'Aries', category: 'Symbols' },
  { emoji: '♉', name: 'Taurus', category: 'Symbols' },
  { emoji: '♊', name: 'Gemini', category: 'Symbols' },
  { emoji: '♋', name: 'Cancer', category: 'Symbols' },
  { emoji: '♌', name: 'Leo', category: 'Symbols' },
  { emoji: '♍', name: 'Virgo', category: 'Symbols' },
  { emoji: '♎', name: 'Libra', category: 'Symbols' },
  { emoji: '♏', name: 'Scorpio', category: 'Symbols' },
  { emoji: '♐', name: 'Sagittarius', category: 'Symbols' },
  { emoji: '♑', name: 'Capricorn', category: 'Symbols' },
  { emoji: '♒', name: 'Aquarius', category: 'Symbols' },
  { emoji: '♓', name: 'Pisces', category: 'Symbols' },
  { emoji: '⛎', name: 'Ophiuchus', category: 'Symbols' },
  { emoji: '⚛️', name: 'atom symbol', category: 'Symbols' },
  { emoji: '🔱', name: 'trident emblem', category: 'Symbols' },
  { emoji: '⚜️', name: 'fleur-de-lis', category: 'Symbols' },
  { emoji: '♻️', name: 'recycling symbol', category: 'Symbols' },
  { emoji: '✅', name: 'check mark button', category: 'Symbols' },
  { emoji: '☑️', name: 'check box with check', category: 'Symbols' },
  { emoji: '✔️', name: 'check mark', category: 'Symbols' },
  { emoji: '✖️', name: 'multiplication sign', category: 'Symbols' },
  { emoji: '❌', name: 'cross mark', category: 'Symbols' },
  { emoji: '❎', name: 'cross mark button', category: 'Symbols' },
  { emoji: '➕', name: 'plus sign', category: 'Symbols' },
  { emoji: '➖', name: 'minus sign', category: 'Symbols' },
  { emoji: '➗', name: 'division sign', category: 'Symbols' },
  { emoji: '➰', name: 'curly loop', category: 'Symbols' },
  { emoji: '➿', name: 'double curly loop', category: 'Symbols' },
  { emoji: '〽️', name: 'part alternation mark', category: 'Symbols' },
  { emoji: '✳️', name: 'eight-spoked asterisk', category: 'Symbols' },
  { emoji: '✴️', name: 'eight-pointed star', category: 'Symbols' },
  { emoji: '❇️', name: 'sparkle', category: 'Symbols' },
  { emoji: '‼️', name: 'double exclamation mark', category: 'Symbols' },
  { emoji: '⁉️', name: 'exclamation question mark', category: 'Symbols' },
  { emoji: '❓', name: 'question mark', category: 'Symbols' },
  { emoji: '❔', name: 'white question mark', category: 'Symbols' },
  { emoji: '❕', name: 'white exclamation mark', category: 'Symbols' },
  { emoji: '❗', name: 'exclamation mark', category: 'Symbols' },
  { emoji: '〰️', name: 'wavy dash', category: 'Symbols' },
  { emoji: '💱', name: 'currency exchange', category: 'Symbols' },
  { emoji: '💲', name: 'heavy dollar sign', category: 'Symbols' },
  { emoji: '⚕️', name: 'medical symbol', category: 'Symbols' },
  { emoji: '🔟', name: 'keycap: 10', category: 'Symbols' },
  { emoji: '🔠', name: 'input latin uppercase', category: 'Symbols' },
  { emoji: '🔡', name: 'input latin lowercase', category: 'Symbols' },
  { emoji: '🔢', name: 'input numbers', category: 'Symbols' },
  { emoji: '🔣', name: 'input symbols', category: 'Symbols' },
  { emoji: '🔤', name: 'input latin letters', category: 'Symbols' },
  { emoji: '🆎', name: 'AB button (blood type)', category: 'Symbols' },
  { emoji: '🆑', name: 'CL button', category: 'Symbols' },
  { emoji: '🆒', name: 'COOL button', category: 'Symbols' },
  { emoji: '🆓', name: 'FREE button', category: 'Symbols' },
  { emoji: 'ℹ️', name: 'information', category: 'Symbols' },
  { emoji: '🆔', name: 'ID button', category: 'Symbols' },
  { emoji: '🆕', name: 'NEW button', category: 'Symbols' },
  { emoji: '🆖', name: 'NG button', category: 'Symbols' },
  { emoji: '🆗', name: 'OK button', category: 'Symbols' },
  { emoji: '🆘', name: 'SOS button', category: 'Symbols' },
  { emoji: '🆙', name: 'UP! button', category: 'Symbols' },
  { emoji: '🆚', name: 'VS button', category: 'Symbols' },
  { emoji: '⭐', name: 'star', category: 'Symbols' },
  { emoji: '🌟', name: 'glowing star', category: 'Symbols' },
  { emoji: '💫', name: 'dizzy', category: 'Symbols' },
  { emoji: '✨', name: 'sparkles', category: 'Symbols' },
  { emoji: '⚡', name: 'high voltage', category: 'Symbols' },
  { emoji: '🔥', name: 'fire', category: 'Symbols' },
  { emoji: '💥', name: 'collision', category: 'Symbols' },
  { emoji: '☄️', name: 'comet', category: 'Symbols' },

  // Flags
  { emoji: '🏁', name: 'chequered flag', category: 'Flags' },
  { emoji: '🚩', name: 'triangular flag', category: 'Flags' },
  { emoji: '🎌', name: 'crossed flags', category: 'Flags' },
  { emoji: '🏴', name: 'black flag', category: 'Flags' },
  { emoji: '🏳️', name: 'white flag', category: 'Flags' },
  { emoji: '🏳️‍🌈', name: 'rainbow flag', category: 'Flags' },
  { emoji: '🇺🇸', name: 'flag United States', category: 'Flags' },
  { emoji: '🇬🇧', name: 'flag United Kingdom', category: 'Flags' },
  { emoji: '🇨🇦', name: 'flag Canada', category: 'Flags' },
  { emoji: '🇦🇺', name: 'flag Australia', category: 'Flags' },
  { emoji: '🇫🇷', name: 'flag France', category: 'Flags' },
  { emoji: '🇩🇪', name: 'flag Germany', category: 'Flags' },
  { emoji: '🇮🇹', name: 'flag Italy', category: 'Flags' },
  { emoji: '🇪🇸', name: 'flag Spain', category: 'Flags' },
  { emoji: '🇯🇵', name: 'flag Japan', category: 'Flags' },
  { emoji: '🇨🇳', name: 'flag China', category: 'Flags' },
  { emoji: '🇰🇷', name: 'flag South Korea', category: 'Flags' },
  { emoji: '🇮🇳', name: 'flag India', category: 'Flags' },
  { emoji: '🇧🇷', name: 'flag Brazil', category: 'Flags' },
  { emoji: '🇲🇽', name: 'flag Mexico', category: 'Flags' },
  { emoji: '🇷🇺', name: 'flag Russia', category: 'Flags' },
  { emoji: '🇪🇬', name: 'flag Egypt', category: 'Flags' },
  { emoji: '🇿🇦', name: 'flag South Africa', category: 'Flags' }
]

// Filtered emojis based on search and category
const filteredEmojis = computed(() => {
  let result = emojis.filter(e => e.category === selectedCategory.value)
  
  if (searchQuery.value) {
    const search = searchQuery.value.toLowerCase()
    result = emojis.filter(e => 
      e.name.toLowerCase().includes(search) || 
      e.emoji.includes(search)
    )
  }
  
  return result
})

const filterEmojis = () => {
  // Filter happens automatically through computed property
}

const selectEmoji = (emoji) => {
  const emojiChar = emoji.emoji
  emit('select', emojiChar)
  
  // Add to recent emojis
  const recent = [...recentEmojis.value]
  const index = recent.indexOf(emojiChar)
  if (index > -1) {
    recent.splice(index, 1)
  }
  recent.unshift(emojiChar)
  recentEmojis.value = recent.slice(0, 20) // Keep only 20 recent
  
  // Save to localStorage
  localStorage.setItem('recentEmojis', JSON.stringify(recentEmojis.value))
}

// Load recent emojis from localStorage
onMounted(() => {
  const stored = localStorage.getItem('recentEmojis')
  if (stored) {
    try {
      recentEmojis.value = JSON.parse(stored)
    } catch (e) {
      console.error('Failed to load recent emojis:', e)
    }
  }
})
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 8px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: #1f2937;
  border-radius: 4px;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #4b5563;
  border-radius: 4px;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #6b7280;
}
</style>
