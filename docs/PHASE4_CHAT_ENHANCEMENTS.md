# Phase 4: Advanced Chat Features - Implementation Plan

**Start Date**: October 16, 2025  
**Estimated Duration**: 2-3 days  
**Priority**: HIGH  
**Complexity**: MEDIUM

---

## 🎯 Overview

Transform the basic chat system into a feature-rich communication platform with file sharing, emoji reactions, message threading, and more.

### Current State
- ✅ Basic text messaging
- ✅ Typing indicators
- ✅ Message timestamps
- ✅ Auto-scroll to latest
- ✅ Unread counter

### Target State
- 📁 File sharing (images, PDFs, documents)
- 😀 Emoji picker with search
- 👍 Message reactions (5 quick reactions)
- 💬 Reply to messages (threading)
- ✏️ Edit messages (within 5 minutes)
- 🗑️ Delete messages
- 📋 Copy message text
- 🔍 Message search
- 📎 File previews and downloads

---

## 📋 Feature Breakdown

### 1. File Sharing 📁
**Priority**: HIGHEST | **Time**: 6-8 hours

#### Backend Implementation
**Files to create**:
- `backend/src/routes/upload.js` - File upload endpoint
- `backend/src/middleware/fileUpload.js` - Multer configuration
- `backend/src/utils/fileValidation.js` - File type/size validation
- `backend/src/utils/fileStorage.js` - File storage management

**API Endpoints**:
```javascript
POST /api/upload
- Headers: Authorization (JWT)
- Body: multipart/form-data
  - file: File
  - meetingId: string
  - messageId: string (optional)
- Response: { fileId, url, filename, size, mimeType, thumbnailUrl }

GET /api/files/:fileId
- Headers: Authorization (JWT)
- Response: File stream (download)

DELETE /api/files/:fileId
- Headers: Authorization (JWT)
- Response: { success: true }
```

**Storage Strategy**:
```javascript
// Store in Docker volume: /app/uploads
// Path structure: /uploads/:meetingId/:fileId.:ext
// Generate thumbnails for images: /uploads/:meetingId/thumbnails/:fileId.jpg
// Max file size: 25MB
// Allowed types: images (jpg, png, gif, webp), docs (pdf, docx, xlsx, pptx)
```

**File Validation**:
```javascript
// Max size: 25MB
// Allowed MIME types:
const ALLOWED_TYPES = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/gif': '.gif',
  'image/webp': '.webp',
  'application/pdf': '.pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': '.xlsx',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': '.pptx'
}

// Security checks:
// - Verify MIME type matches file extension
// - Scan for malicious content (basic)
// - Generate unique filename with UUID
// - Store original filename in metadata
```

#### Frontend Implementation
**Files to modify**:
- `frontend/src/components/ChatPanel.vue` - Add file upload UI

**UI Components**:
```vue
<!-- File Upload Button -->
<button @click="selectFile" class="file-upload-btn">
  <svg><!-- Paperclip icon --></svg>
</button>
<input 
  ref="fileInput" 
  type="file" 
  accept="image/*,.pdf,.docx,.xlsx,.pptx" 
  @change="handleFileSelect"
  style="display: none"
/>

<!-- File Preview in Message -->
<div v-if="message.file" class="file-attachment">
  <!-- Image Preview -->
  <img v-if="isImage(message.file)" :src="message.file.url" />
  
  <!-- Document Preview -->
  <div v-else class="document-preview">
    <svg><!-- File icon --></svg>
    <span>{{ message.file.filename }}</span>
    <span class="file-size">{{ formatFileSize(message.file.size) }}</span>
    <a :href="message.file.url" download>Download</a>
  </div>
</div>

<!-- Upload Progress -->
<div v-if="uploadingFiles.length" class="upload-progress">
  <div v-for="upload in uploadingFiles" :key="upload.id">
    <span>{{ upload.filename }}</span>
    <progress :value="upload.progress" max="100"></progress>
  </div>
</div>
```

**Implementation Details**:
```javascript
// File upload logic
const uploadFile = async (file) => {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('meetingId', meetingId.value)
  
  const upload = {
    id: generateId(),
    filename: file.name,
    progress: 0
  }
  uploadingFiles.value.push(upload)
  
  try {
    const response = await axios.post('/api/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (e) => {
        upload.progress = Math.round((e.loaded * 100) / e.total)
      }
    })
    
    // Send message with file attachment
    await sendMessage({
      text: '',
      file: response.data
    })
    
    uploadingFiles.value = uploadingFiles.value.filter(u => u.id !== upload.id)
  } catch (error) {
    toastStore.error('Failed to upload file: ' + error.message)
    uploadingFiles.value = uploadingFiles.value.filter(u => u.id !== upload.id)
  }
}
```

---

### 2. Emoji Picker 😀
**Priority**: HIGH | **Time**: 4-5 hours

#### Component Implementation
**Files to create**:
- `frontend/src/components/EmojiPicker.vue` - Emoji selector component

**UI Design**:
```vue
<template>
  <div class="emoji-picker" v-if="isOpen">
    <!-- Search Bar -->
    <input 
      v-model="searchQuery" 
      placeholder="Search emojis..."
      class="emoji-search"
    />
    
    <!-- Emoji Categories -->
    <div class="emoji-tabs">
      <button 
        v-for="category in categories" 
        :key="category.id"
        @click="selectedCategory = category.id"
        :class="{ active: selectedCategory === category.id }"
      >
        {{ category.icon }}
      </button>
    </div>
    
    <!-- Emoji Grid -->
    <div class="emoji-grid">
      <button
        v-for="emoji in filteredEmojis"
        :key="emoji.char"
        @click="selectEmoji(emoji)"
        :title="emoji.name"
        class="emoji-button"
      >
        {{ emoji.char }}
      </button>
    </div>
    
    <!-- Recent Emojis -->
    <div v-if="recentEmojis.length" class="recent-emojis">
      <span>Recently used:</span>
      <button 
        v-for="emoji in recentEmojis" 
        :key="emoji"
        @click="selectEmoji({ char: emoji })"
      >
        {{ emoji }}
      </button>
    </div>
  </div>
</template>
```

**Emoji Data**:
```javascript
// Use emoji-picker-element library or create custom dataset
const emojiCategories = [
  {
    id: 'smileys',
    name: 'Smileys & People',
    icon: '😀',
    emojis: [
      { char: '😀', name: 'grinning face', keywords: ['smile', 'happy'] },
      { char: '😃', name: 'grinning face with big eyes', keywords: ['smile', 'joy'] },
      // ... more emojis
    ]
  },
  {
    id: 'animals',
    name: 'Animals & Nature',
    icon: '🐶',
    emojis: [
      { char: '🐶', name: 'dog face', keywords: ['dog', 'pet'] },
      // ... more emojis
    ]
  },
  // ... more categories
]

// Or use library: npm install emoji-picker-element
import 'emoji-picker-element'
```

**Integration with ChatPanel**:
```vue
<!-- In ChatPanel.vue -->
<div class="message-input-container">
  <button @click="toggleEmojiPicker" class="emoji-button">
    😀
  </button>
  <EmojiPicker 
    v-if="showEmojiPicker" 
    @select="insertEmoji"
    @close="showEmojiPicker = false"
  />
  <input v-model="messageText" @keyup.enter="sendMessage" />
</div>
```

**Recent Emojis Persistence**:
```javascript
// Store in localStorage
const recentEmojis = ref(
  JSON.parse(localStorage.getItem('recent-emojis') || '[]')
)

const selectEmoji = (emoji) => {
  // Add to recent emojis
  recentEmojis.value = [
    emoji.char,
    ...recentEmojis.value.filter(e => e !== emoji.char)
  ].slice(0, 20)
  
  localStorage.setItem('recent-emojis', JSON.stringify(recentEmojis.value))
  
  emit('select', emoji.char)
}
```

---

### 3. Message Reactions 👍
**Priority**: HIGH | **Time**: 3-4 hours

#### Backend Implementation
**Socket Events**:
```javascript
// backend/src/socket/chat.js

socket.on('add-reaction', ({ messageId, reaction }) => {
  // Validate reaction (only allow predefined emojis)
  const allowedReactions = ['👍', '❤️', '😂', '🎉', '😮']
  if (!allowedReactions.includes(reaction)) return
  
  // Add reaction to message
  const message = messages.get(messageId)
  if (!message) return
  
  if (!message.reactions) message.reactions = {}
  if (!message.reactions[reaction]) message.reactions[reaction] = []
  
  const userId = socket.id
  if (!message.reactions[reaction].includes(userId)) {
    message.reactions[reaction].push(userId)
  }
  
  // Broadcast to room
  io.to(roomId).emit('reaction-added', {
    messageId,
    reaction,
    userId,
    reactions: message.reactions
  })
})

socket.on('remove-reaction', ({ messageId, reaction }) => {
  const message = messages.get(messageId)
  if (!message || !message.reactions) return
  
  const userId = socket.id
  if (message.reactions[reaction]) {
    message.reactions[reaction] = message.reactions[reaction].filter(
      id => id !== userId
    )
    
    // Remove reaction type if no users left
    if (message.reactions[reaction].length === 0) {
      delete message.reactions[reaction]
    }
  }
  
  io.to(roomId).emit('reaction-removed', {
    messageId,
    reaction,
    userId,
    reactions: message.reactions
  })
})
```

#### Frontend Implementation
**UI Design**:
```vue
<!-- In ChatPanel.vue message display -->
<div class="message" :class="{ 'own-message': isOwnMessage }">
  <div class="message-content">{{ message.text }}</div>
  
  <!-- Reactions Display -->
  <div v-if="message.reactions" class="message-reactions">
    <button
      v-for="(users, reaction) in message.reactions"
      :key="reaction"
      @click="toggleReaction(message.id, reaction)"
      :class="{ active: users.includes(currentUserId) }"
      class="reaction-badge"
    >
      <span class="reaction-emoji">{{ reaction }}</span>
      <span class="reaction-count">{{ users.length }}</span>
    </button>
  </div>
  
  <!-- Add Reaction Button -->
  <button 
    @click="showReactionPicker(message.id)" 
    class="add-reaction-btn"
    v-show="hoveredMessageId === message.id"
  >
    <span>😀+</span>
  </button>
  
  <!-- Quick Reactions Popup -->
  <div v-if="reactionPickerMessageId === message.id" class="quick-reactions">
    <button 
      v-for="reaction in quickReactions" 
      :key="reaction"
      @click="addReaction(message.id, reaction)"
    >
      {{ reaction }}
    </button>
  </div>
</div>
```

**Implementation Logic**:
```javascript
const quickReactions = ['👍', '❤️', '😂', '🎉', '😮']

const addReaction = (messageId, reaction) => {
  socket.value.emit('add-reaction', { messageId, reaction })
  reactionPickerMessageId.value = null
}

const toggleReaction = (messageId, reaction) => {
  const message = messages.value.find(m => m.id === messageId)
  if (message.reactions[reaction]?.includes(currentUserId.value)) {
    socket.value.emit('remove-reaction', { messageId, reaction })
  } else {
    socket.value.emit('add-reaction', { messageId, reaction })
  }
}

// Listen for reaction events
socket.value.on('reaction-added', ({ messageId, reactions }) => {
  const message = messages.value.find(m => m.id === messageId)
  if (message) {
    message.reactions = reactions
  }
})
```

---

### 4. Reply to Messages 💬
**Priority**: MEDIUM | **Time**: 3-4 hours

#### Backend Implementation
**Message Structure Update**:
```javascript
// Add replyTo field to message object
const message = {
  id: generateId(),
  userId: socket.id,
  userName: socket.data.userName,
  text: messageText,
  timestamp: Date.now(),
  replyTo: replyToMessageId || null, // NEW
  file: fileData || null,
  reactions: {}
}
```

#### Frontend Implementation
**UI Design**:
```vue
<!-- Reply Preview (when composing reply) -->
<div v-if="replyingTo" class="reply-preview">
  <div class="reply-header">
    <span>Replying to {{ replyingTo.userName }}</span>
    <button @click="cancelReply">✕</button>
  </div>
  <div class="reply-content">{{ replyingTo.text }}</div>
</div>

<!-- Reply Display (in message) -->
<div class="message">
  <div v-if="message.replyTo" class="replied-message" @click="scrollToMessage(message.replyTo)">
    <div class="reply-indicator"></div>
    <div class="reply-info">
      <span class="reply-author">{{ getMessageById(message.replyTo)?.userName }}</span>
      <span class="reply-text">{{ getMessageById(message.replyTo)?.text }}</span>
    </div>
  </div>
  
  <div class="message-content">{{ message.text }}</div>
</div>
```

**Implementation Logic**:
```javascript
const replyingTo = ref(null)

const startReply = (message) => {
  replyingTo.value = message
  // Focus on input
  nextTick(() => {
    messageInput.value?.focus()
  })
}

const cancelReply = () => {
  replyingTo.value = null
}

const sendMessage = () => {
  if (!messageText.value.trim()) return
  
  const message = {
    text: messageText.value,
    replyTo: replyingTo.value?.id || null
  }
  
  socket.value.emit('send-message', message)
  messageText.value = ''
  replyingTo.value = null
}

const scrollToMessage = (messageId) => {
  const element = document.getElementById(`message-${messageId}`)
  element?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  element?.classList.add('highlight')
  setTimeout(() => element?.classList.remove('highlight'), 2000)
}
```

---

### 5. Edit & Delete Messages ✏️🗑️
**Priority**: MEDIUM | **Time**: 3-4 hours

#### Backend Implementation
```javascript
// Edit message (within 5 minutes)
socket.on('edit-message', ({ messageId, newText }) => {
  const message = messages.get(messageId)
  if (!message) return
  
  // Verify ownership
  if (message.userId !== socket.id) {
    return socket.emit('error', { message: 'Cannot edit other users messages' })
  }
  
  // Check time limit (5 minutes)
  const timeSinceCreation = Date.now() - message.timestamp
  if (timeSinceCreation > 5 * 60 * 1000) {
    return socket.emit('error', { message: 'Edit time expired' })
  }
  
  message.text = newText
  message.edited = true
  message.editedAt = Date.now()
  
  io.to(roomId).emit('message-edited', {
    messageId,
    newText,
    edited: true,
    editedAt: message.editedAt
  })
})

// Delete message
socket.on('delete-message', ({ messageId }) => {
  const message = messages.get(messageId)
  if (!message) return
  
  // Verify ownership
  if (message.userId !== socket.id) {
    return socket.emit('error', { message: 'Cannot delete other users messages' })
  }
  
  messages.delete(messageId)
  
  io.to(roomId).emit('message-deleted', { messageId })
})
```

#### Frontend Implementation
```vue
<!-- Message Actions Menu -->
<div class="message" @mouseenter="hoveredMessageId = message.id" @mouseleave="hoveredMessageId = null">
  <div class="message-content">
    {{ message.text }}
    <span v-if="message.edited" class="edited-label">(edited)</span>
  </div>
  
  <!-- Actions Menu -->
  <div v-if="hoveredMessageId === message.id && isOwnMessage" class="message-actions">
    <button @click="startEdit(message)" v-if="canEdit(message)">
      <svg><!-- Edit icon --></svg> Edit
    </button>
    <button @click="deleteMessage(message.id)">
      <svg><!-- Delete icon --></svg> Delete
    </button>
    <button @click="copyMessage(message.text)">
      <svg><!-- Copy icon --></svg> Copy
    </button>
  </div>
</div>

<!-- Edit Mode -->
<div v-if="editingMessage?.id === message.id" class="edit-mode">
  <input v-model="editText" @keyup.enter="saveEdit" @keyup.esc="cancelEdit" />
  <button @click="saveEdit">Save</button>
  <button @click="cancelEdit">Cancel</button>
</div>
```

**Implementation Logic**:
```javascript
const editingMessage = ref(null)
const editText = ref('')

const canEdit = (message) => {
  const timeSinceCreation = Date.now() - message.timestamp
  return timeSinceCreation < 5 * 60 * 1000 // 5 minutes
}

const startEdit = (message) => {
  editingMessage.value = message
  editText.value = message.text
}

const saveEdit = () => {
  if (!editText.value.trim()) return
  
  socket.value.emit('edit-message', {
    messageId: editingMessage.value.id,
    newText: editText.value
  })
  
  editingMessage.value = null
  editText.value = ''
}

const deleteMessage = (messageId) => {
  if (!confirm('Delete this message?')) return
  
  socket.value.emit('delete-message', { messageId })
}

const copyMessage = (text) => {
  navigator.clipboard.writeText(text)
  toastStore.success('Message copied to clipboard')
}
```

---

## 📊 Implementation Timeline

### Day 1: File Sharing
- [ ] Backend: File upload endpoint (2 hours)
- [ ] Backend: File validation & storage (2 hours)
- [ ] Frontend: File upload UI (2 hours)
- [ ] Frontend: File preview & download (2 hours)
- [ ] Testing: Upload different file types (1 hour)

### Day 2: Emojis & Reactions
- [ ] Frontend: Emoji picker component (3 hours)
- [ ] Frontend: Recent emojis persistence (1 hour)
- [ ] Backend: Reaction socket events (2 hours)
- [ ] Frontend: Reaction UI & logic (2 hours)
- [ ] Testing: Add/remove reactions (1 hour)

### Day 3: Reply, Edit, Delete
- [ ] Backend: Reply-to message structure (1 hour)
- [ ] Frontend: Reply UI & scrolling (2 hours)
- [ ] Backend: Edit/delete socket events (2 hours)
- [ ] Frontend: Edit/delete UI & logic (2 hours)
- [ ] Testing: All chat features together (2 hours)

---

## 🧪 Testing Checklist

### File Sharing
- [ ] Upload image (jpg, png, gif, webp)
- [ ] Upload PDF document
- [ ] Upload Office documents (docx, xlsx, pptx)
- [ ] Reject files > 25MB
- [ ] Reject unsupported file types
- [ ] Show upload progress
- [ ] Generate thumbnails for images
- [ ] Download files
- [ ] Multiple file uploads simultaneously
- [ ] Error handling for failed uploads

### Emoji Picker
- [ ] Open/close emoji picker
- [ ] Select emoji from grid
- [ ] Search emojis by name
- [ ] Filter by category
- [ ] Recent emojis display
- [ ] Recent emojis persist
- [ ] Insert emoji at cursor position
- [ ] Close picker when clicking outside

### Message Reactions
- [ ] Add reaction to message
- [ ] Remove reaction from message
- [ ] Display reaction count
- [ ] Show who reacted (tooltip)
- [ ] Quick reactions popup
- [ ] Multiple reactions on same message
- [ ] Own reactions highlighted
- [ ] Reactions persist across refresh

### Reply to Messages
- [ ] Click reply button
- [ ] Reply preview shows
- [ ] Cancel reply
- [ ] Send reply with quoted message
- [ ] Click quoted message scrolls to original
- [ ] Highlight original message
- [ ] Reply to reply (threading)

### Edit & Delete Messages
- [ ] Edit own message within 5 minutes
- [ ] Cannot edit after 5 minutes
- [ ] Cannot edit others' messages
- [ ] Show "(edited)" label
- [ ] Delete own message
- [ ] Cannot delete others' messages
- [ ] Confirm before delete
- [ ] Copy message text
- [ ] Edit time limit enforced

---

## 📦 Dependencies to Install

### Backend
```bash
npm install multer          # File upload middleware
npm install sharp           # Image thumbnail generation
npm install file-type       # MIME type detection
npm install uuid            # Unique file IDs
```

### Frontend
```bash
npm install emoji-picker-element  # Emoji picker (optional)
# OR implement custom emoji picker with emoji data JSON
```

---

## 🚀 After Completion

### Phase 4 Progress
- ✅ File sharing (images, PDFs, documents)
- ✅ Emoji picker with search
- ✅ Message reactions
- ✅ Reply to messages
- ✅ Edit messages (5 min window)
- ✅ Delete messages
- ✅ Copy message text

### Next Priority
Move to **Option C: Host Controls & Permissions** for professional meeting management.

---

**Let's build amazing chat features! 🚀**
