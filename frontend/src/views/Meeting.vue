<template>
  <div class="h-screen flex flex-col bg-[#202124] relative">
    <!-- Toast Notifications -->
    <ToastContainer />
    
    <!-- Waiting Room Overlay -->
    <WaitingRoom
      v-if="showWaitingRoom"
      :meeting-id="meetingId"
      :user-name="userName"
      :socket="socket"
      @admitted="handleWaitingRoomAdmitted"
      @rejected="handleWaitingRoomRejected"
      @cancel="handleWaitingRoomCancel"
      @retry="handleWaitingRoomRetry"
    />
    
    <!-- Top Bar -->
    <header class="absolute top-0 left-0 right-0 z-20 px-3 sm:px-6 py-3 sm:py-4 flex items-center justify-between bg-gradient-to-b from-black/50 to-transparent">
      <div class="flex items-center gap-2 sm:gap-4 min-w-0 flex-1">
        <div class="flex items-center gap-2 sm:gap-3 min-w-0">
          <div class="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-sm flex-shrink-0">
            <span class="text-white text-base sm:text-lg font-bold">D</span>
          </div>
          <div class="min-w-0 flex-1">
            <div class="text-white font-medium text-sm sm:text-base truncate">{{ meetingId }}</div>
            <div class="text-gray-300 text-[10px] sm:text-xs flex items-center gap-1 sm:gap-2">
              <span class="flex items-center gap-1">
                <span class="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-green-500"></span>
                <span class="hidden sm:inline">{{ currentTime }}</span>
              </span>
              <span class="hidden sm:inline">|</span>
              <span class="truncate">{{ totalParticipants }} {{ totalParticipants === 1 ? 'participant' : 'participants' }}</span>
            </div>
          </div>
        </div>
      </div>
      <div class="flex items-center gap-1.5 sm:gap-3 flex-shrink-0">
        <!-- Layout Switcher -->
        <LayoutSwitcher @layout-change="handleLayoutChange" />
        
        <!-- Meeting Info Button -->
        <button
          @click="showMeetingInfo = !showMeetingInfo"
          class="px-2 sm:px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 backdrop-blur-sm transition-all text-white text-sm font-medium"
          title="Meeting details"
        >
          <svg class="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </button>
      </div>
    </header>

    <!-- Error Message Toast -->
    <transition
      enter-active-class="transition duration-300 ease-out"
      enter-from-class="transform translate-y-2 opacity-0"
      enter-to-class="transform translate-y-0 opacity-100"
      leave-active-class="transition duration-200 ease-in"
      leave-from-class="transform translate-y-0 opacity-100"
      leave-to-class="transform translate-y-2 opacity-0"
    >
      <div v-if="errorMessage" class="absolute top-16 sm:top-20 left-2 right-2 sm:left-1/2 sm:right-auto sm:transform sm:-translate-x-1/2 z-50 bg-red-600 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg shadow-2xl flex items-center gap-2 sm:gap-3 max-w-md mx-auto sm:mx-0">
        <svg class="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span class="text-xs sm:text-sm flex-1">{{ errorMessage }}</span>
        <button @click="errorMessage = null" class="ml-2 hover:bg-red-700 p-1 rounded">
          <svg class="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </transition>

    <!-- Screen Sharing Banner -->
    <transition
      enter-active-class="transition duration-300 ease-out"
      enter-from-class="transform -translate-y-full opacity-0"
      enter-to-class="transform translate-y-0 opacity-100"
      leave-active-class="transition duration-200 ease-in"
      leave-from-class="transform translate-y-0 opacity-100"
      leave-to-class="transform -translate-y-full opacity-0"
    >
      <div v-if="hasScreenShare" class="absolute top-16 sm:top-20 left-2 right-2 sm:left-1/2 sm:right-auto sm:transform sm:-translate-x-1/2 z-50 bg-blue-600 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg shadow-2xl flex items-center gap-2 sm:gap-3 mx-auto sm:mx-0 max-w-md">
        <svg class="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
        <span class="text-xs sm:text-sm font-medium flex-1">You are sharing your screen</span>
        <button
          @click="handleScreenShare"
          class="bg-white/20 hover:bg-white/30 px-2 sm:px-3 py-1 rounded text-xs sm:text-sm font-medium transition-colors whitespace-nowrap"
        >
          Stop
        </button>
      </div>
    </transition>

    <!-- Loading State -->
    <div v-if="isLoading" class="flex-1 flex items-center justify-center">
      <div class="text-center">
        <div class="relative w-20 h-20 mx-auto mb-6">
          <div class="absolute inset-0 rounded-full border-4 border-white/20"></div>
          <div class="absolute inset-0 rounded-full border-4 border-transparent border-t-white animate-spin"></div>
        </div>
        <p class="text-white text-lg font-medium mb-2">Joining meeting...</p>
        <p class="text-gray-400 text-sm">Setting up your audio and video</p>
      </div>
    </div>

    <!-- Main Content -->
    <main v-else class="flex-1 flex items-center justify-center p-2 sm:p-4 md:p-6 pt-16 sm:pt-20 md:pt-24 pb-24 sm:pb-28 md:pb-32">
      <!-- Grid Layout -->
      <div v-if="currentLayout === 'grid'" class="w-full h-full max-w-[1800px]">
        <div 
          :class="[
            'grid h-full w-full transition-all duration-500 ease-in-out auto-rows-fr',
            getGridClass
          ]"
        >
          <!-- Local Video -->
          <div 
            class="relative bg-[#3C4043] rounded-xl overflow-hidden shadow-2xl group transition-all duration-300 hover:scale-[1.02] hover:shadow-3xl"
            :class="[
              {'ring-4 ring-green-500 shadow-[0_0_20px_rgba(34,197,94,0.5)] animate-pulse': isLocalSpeaking},
              totalParticipants === 1 ? 'max-w-4xl max-h-[80vh]' : ''
            ]"
          >
            <video
              ref="localVideoRef"
              autoplay
              playsinline
              muted
              class="w-full h-full object-cover transform -scale-x-100"
              :class="{ 'hidden': !localStream }"
            ></video>
            <!-- No Stream Placeholder -->
            <div v-if="!localStream" class="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-700 to-gray-800">
              <div class="text-center">
                <div class="w-24 h-24 rounded-full bg-blue-600 flex items-center justify-center mx-auto mb-4">
                  <span class="text-white text-4xl font-bold">{{ userName.charAt(0).toUpperCase() }}</span>
                </div>
                <p class="text-white text-lg font-medium">{{ userName }}</p>
              </div>
            </div>
            
            <!-- Host Badge (Top Left) -->
            <div v-if="isHost" class="absolute top-3 left-3 z-10 flex items-center gap-1.5 bg-gradient-to-r from-yellow-400 to-orange-500 px-3 py-1.5 rounded-full shadow-lg">
              <svg class="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <span class="text-white text-xs font-bold">Host</span>
            </div>
            
            <!-- Persistent Name Badge & Status -->
            <div class="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-3">
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <span class="text-white font-medium text-sm drop-shadow">{{ userName }} (You)</span>
                  <!-- Audio Level Indicator -->
                  <div v-if="hasAudio && isLocalSpeaking" class="flex items-center gap-0.5">
                    <div class="w-0.5 h-3 bg-green-400 rounded animate-pulse"></div>
                    <div class="w-0.5 h-4 bg-green-400 rounded animate-pulse" style="animation-delay: 0.1s"></div>
                    <div class="w-0.5 h-2 bg-green-400 rounded animate-pulse" style="animation-delay: 0.2s"></div>
                  </div>
                </div>
                <!-- Connection Quality - Always Visible -->
                <div class="flex items-center gap-0.5" title="Connection quality: Good">
                  <div class="w-1 h-2 bg-green-400 rounded"></div>
                  <div class="w-1 h-3 bg-green-400 rounded"></div>
                  <div class="w-1 h-4 bg-green-400 rounded"></div>
                </div>
              </div>
            </div>
            
            <!-- Status Indicators (Top Right) -->
            <div class="absolute top-3 right-3 flex gap-2">
              <!-- Muted Indicator -->
              <div v-if="!hasAudio" class="bg-red-600 p-2 rounded-lg shadow-lg backdrop-blur-sm" title="Microphone off">
                <svg class="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M13.477 14.89A6 6 0 015.11 6.524l8.367 8.368zm1.414-1.414L6.524 5.11a6 6 0 018.367 8.367zM18 10a8 8 0 11-16 0 8 8 0 0116 0z" clip-rule="evenodd" />
                </svg>
              </div>
              <!-- Camera Off Indicator -->
              <div v-if="!hasVideo" class="bg-gray-700 p-2 rounded-lg shadow-lg backdrop-blur-sm" title="Camera off">
                <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3l18 18" />
                </svg>
              </div>
            </div>
          </div>

          <!-- Remote Videos -->
          <div
            v-for="[participantId, stream] in remoteStreams"
            :key="participantId"
            class="relative bg-[#3C4043] rounded-xl overflow-hidden shadow-2xl group transition-all duration-300 hover:scale-[1.02] hover:shadow-3xl hover:z-10"
            :class="[
              {'ring-4 ring-green-500 shadow-[0_0_20px_rgba(34,197,94,0.5)] animate-pulse': activeSpeakerId === participantId},
              totalParticipants === 2 ? 'max-w-4xl max-h-[80vh]' : ''
            ]"
          >
            <video
              :ref="el => setRemoteVideoRef(el, participantId)"
              autoplay
              playsinline
              class="w-full h-full object-cover"
            ></video>
            
            <!-- Host Badge (Top Left) -->
            <div v-if="hostId === participantId" class="absolute top-3 left-3 z-10 flex items-center gap-1.5 bg-gradient-to-r from-yellow-400 to-orange-500 px-3 py-1.5 rounded-full shadow-lg">
              <svg class="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <span class="text-white text-xs font-bold">Host</span>
            </div>
            
            <!-- Persistent Name Badge & Status -->
            <div class="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-3">
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <span class="text-white font-medium text-sm drop-shadow">
                    {{ participants.get(participantId)?.userName || `Guest ${participantId.slice(0, 6)}` }}
                  </span>
                  <!-- Audio Level Indicator (when speaking) -->
                  <div v-if="activeSpeakerId === participantId" class="flex items-center gap-0.5">
                    <div class="w-0.5 h-3 bg-green-400 rounded animate-pulse"></div>
                    <div class="w-0.5 h-4 bg-green-400 rounded animate-pulse" style="animation-delay: 0.1s"></div>
                    <div class="w-0.5 h-2 bg-green-400 rounded animate-pulse" style="animation-delay: 0.2s"></div>
                  </div>
                </div>
                <!-- Connection Quality - Always Visible -->
                <div class="flex items-center gap-0.5" title="Connection quality: Good">
                  <div class="w-1 h-2 bg-green-400 rounded"></div>
                  <div class="w-1 h-3 bg-green-400 rounded"></div>
                  <div class="w-1 h-4 bg-green-400 rounded"></div>
                </div>
              </div>
            </div>
            
            <!-- Status Indicators (Top Right) -->
            <div class="absolute top-3 right-3 flex gap-2">
              <!-- Pin Button (on hover) -->
              <button 
                class="bg-gray-800/80 hover:bg-gray-700 p-2 rounded-lg shadow-lg backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity"
                title="Pin participant"
                @click="setSpotlightParticipant(participantId)"
              >
                <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Spotlight Layout -->
      <div v-else-if="currentLayout === 'spotlight'" class="w-full h-full flex gap-4">
        <!-- Main spotlight video (large) -->
        <div class="flex-1 flex items-center justify-center">
          <div
            v-if="spotlightParticipant"
            class="relative bg-[#3C4043] rounded-xl overflow-hidden shadow-2xl w-full h-full max-h-full"
            :class="{'ring-4 ring-green-500 shadow-[0_0_20px_rgba(34,197,94,0.5)]': activeSpeakerId === spotlightParticipant}"
          >
            <video
              :ref="el => setRemoteVideoRef(el, spotlightParticipant)"
              autoplay
              playsinline
              class="w-full h-full object-contain"
            ></video>
          </div>
          <!-- Local video in spotlight if no remote participants -->
          <div
            v-else
            class="relative bg-[#3C4043] rounded-xl overflow-hidden shadow-2xl w-full max-w-4xl aspect-video"
            :class="{'ring-4 ring-green-500 shadow-[0_0_20px_rgba(34,197,94,0.5)]': isLocalSpeaking}"
          >
            <video ref="localVideoRef" autoplay playsinline muted class="w-full h-full object-cover transform -scale-x-100"></video>
            <div v-if="!localStream" class="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-700 to-gray-800">
              <div class="w-32 h-32 rounded-full bg-blue-600 flex items-center justify-center">
                <span class="text-white text-5xl font-bold">{{ userName.charAt(0).toUpperCase() }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Thumbnail strip (bottom) -->
        <div class="flex gap-2 flex-wrap content-start max-h-full overflow-y-auto" style="max-width: 160px;">
          <!-- Local thumbnail -->
          <div
            @click="setSpotlightParticipant(null)"
            class="relative bg-[#3C4043] rounded-lg overflow-hidden shadow-lg cursor-pointer hover:ring-2 hover:ring-blue-500 transition-all w-36 h-24"
            :class="{'ring-2 ring-blue-500': !spotlightParticipant}"
          >
            <video ref="localVideoRef" autoplay playsinline muted class="w-full h-full object-cover transform -scale-x-100"></video>
            <div class="absolute bottom-1 left-1 text-white text-xs bg-black/60 px-2 py-1 rounded">You</div>
          </div>

          <!-- Remote thumbnails -->
          <div
            v-for="{ id, stream } in thumbnailParticipants"
            :key="id"
            @click="setSpotlightParticipant(id)"
            class="relative bg-[#3C4043] rounded-lg overflow-hidden shadow-lg cursor-pointer hover:ring-2 hover:ring-blue-500 transition-all w-36 h-24"
            :class="{'ring-2 ring-blue-500': spotlightParticipant === id}"
          >
            <video :ref="el => setRemoteVideoRef(el, id)" autoplay playsinline class="w-full h-full object-cover"></video>
            <div class="absolute bottom-1 left-1 text-white text-xs bg-black/60 px-2 py-1 rounded">
              {{ participants.get(id)?.userName || 'Guest' }}
            </div>
          </div>
        </div>
      </div>

      <!-- Sidebar Layout -->
      <div v-else-if="currentLayout === 'sidebar'" class="w-full h-full flex gap-4">
        <!-- Main video area (large, left side) -->
        <div class="flex-1 flex items-center justify-center">
          <div
            v-if="spotlightParticipant"
            class="relative bg-[#3C4043] rounded-xl overflow-hidden shadow-2xl w-full h-full"
            :class="{'ring-4 ring-green-500 shadow-[0_0_20px_rgba(34,197,94,0.5)]': activeSpeakerId === spotlightParticipant}"
          >
            <video
              :ref="el => setRemoteVideoRef(el, spotlightParticipant)"
              autoplay
              playsinline
              class="w-full h-full object-contain"
            ></video>
          </div>
          <div
            v-else
            class="relative bg-[#3C4043] rounded-xl overflow-hidden shadow-2xl w-full max-w-4xl aspect-video"
            :class="{'ring-4 ring-green-500 shadow-[0_0_20px_rgba(34,197,94,0.5)]': isLocalSpeaking}"
          >
            <video ref="localVideoRef" autoplay playsinline muted class="w-full h-full object-cover transform -scale-x-100"></video>
            <div v-if="!localStream" class="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-700 to-gray-800">
              <div class="w-32 h-32 rounded-full bg-blue-600 flex items-center justify-center">
                <span class="text-white text-5xl font-bold">{{ userName.charAt(0).toUpperCase() }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Sidebar (right side, vertical) -->
        <div class="flex flex-col gap-3 overflow-y-auto" style="width: 280px;">
          <!-- Local video in sidebar -->
          <div
            @click="setSpotlightParticipant(null)"
            class="relative bg-[#3C4043] rounded-lg overflow-hidden shadow-lg cursor-pointer hover:ring-2 hover:ring-blue-500 transition-all aspect-video"
            :class="{'ring-2 ring-blue-500': !spotlightParticipant}"
          >
            <video ref="localVideoRef" autoplay playsinline muted class="w-full h-full object-cover transform -scale-x-100"></video>
            <div class="absolute bottom-2 left-2 text-white text-sm bg-black/70 px-2 py-1 rounded">You</div>
          </div>

          <!-- Remote videos in sidebar -->
          <div
            v-for="{ id, stream } in thumbnailParticipants"
            :key="id"
            @click="setSpotlightParticipant(id)"
            class="relative bg-[#3C4043] rounded-lg overflow-hidden shadow-lg cursor-pointer hover:ring-2 hover:ring-blue-500 transition-all aspect-video"
            :class="{'ring-2 ring-blue-500': spotlightParticipant === id}"
          >
            <video :ref="el => setRemoteVideoRef(el, id)" autoplay playsinline class="w-full h-full object-cover"></video>
            <div class="absolute bottom-2 left-2 text-white text-sm bg-black/70 px-2 py-1 rounded">
              {{ participants.get(id)?.userName || 'Guest' }}
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- Bottom Control Bar -->
    <footer class="absolute bottom-0 left-0 right-0 z-20 pb-4 sm:pb-6 md:pb-8 px-2 sm:px-4">
      <div class="max-w-2xl mx-auto">
        <div class="bg-[#3C4043] rounded-full shadow-2xl px-3 sm:px-4 md:px-6 py-3 sm:py-3.5 md:py-4 backdrop-blur-xl">
          <div class="flex items-center justify-between gap-1 sm:gap-2">
            <!-- Left Controls -->
            <div class="flex items-center gap-1 sm:gap-2">
              <!-- Meeting Time -->
              <div class="hidden sm:block px-2 md:px-3 py-2 text-white text-xs sm:text-sm font-medium">
                {{ meetingDuration }}
              </div>
            </div>

            <!-- Center Controls -->
            <div class="flex items-center gap-1 sm:gap-2 md:gap-3">
              <!-- Microphone -->
              <button
                @click="handleToggleAudio"
                :class="[
                  'p-2 sm:p-3 md:p-4 rounded-full transition-all duration-200 transform hover:scale-110',
                  hasAudio ? 'bg-[#5F6368] hover:bg-[#6F7378]' : 'bg-red-600 hover:bg-red-700'
                ]"
                :disabled="isLoading"
                :title="hasAudio ? 'Turn off microphone' : 'Turn on microphone'"
              >
                <svg v-if="hasAudio" class="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clip-rule="evenodd" />
                </svg>
                <svg v-else class="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M13.477 14.89A6 6 0 015.11 6.524l8.367 8.368zm1.414-1.414L6.524 5.11a6 6 0 018.367 8.367zM18 10a8 8 0 11-16 0 8 8 0 0116 0z" clip-rule="evenodd" />
                </svg>
              </button>

              <!-- Camera -->
              <button
                @click="handleToggleVideo"
                :class="[
                  'p-2 sm:p-3 md:p-4 rounded-full transition-all duration-200 transform hover:scale-110',
                  hasVideo ? 'bg-[#5F6368] hover:bg-[#6F7378]' : 'bg-red-600 hover:bg-red-700'
                ]"
                :disabled="isLoading"
                :title="hasVideo ? 'Turn off camera' : 'Turn on camera'"
              >
                <svg v-if="hasVideo" class="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                <svg v-else class="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                </svg>
              </button>

              <!-- Screen Share (Hidden on small screens) -->
              <button
                @click="handleScreenShare"
                :class="[
                  'hidden sm:flex p-2 sm:p-3 md:p-4 rounded-full transition-all duration-200 transform hover:scale-110',
                  hasScreenShare ? 'bg-blue-600 hover:bg-blue-700' : 'bg-[#5F6368] hover:bg-[#6F7378]'
                ]"
                :disabled="isLoading"
                :title="hasScreenShare ? 'Stop sharing' : 'Share screen'"
              >
                <svg class="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </button>

              <!-- Settings (Hidden on small screens) -->
              <button
                @click="showSettings = !showSettings"
                :class="[
                  'hidden md:flex p-2 sm:p-3 md:p-4 rounded-full transition-all duration-200 transform hover:scale-110',
                  showSettings ? 'bg-blue-600 hover:bg-blue-700' : 'bg-[#5F6368] hover:bg-[#6F7378]'
                ]"
                title="Settings"
              >
                <svg class="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </button>

              <!-- Leave Meeting -->
              <button
                @click="handleLeaveMeeting"
                class="p-2 px-4 sm:p-3 sm:px-6 md:p-4 md:px-8 bg-red-600 hover:bg-red-700 rounded-full transition-all duration-200 transform hover:scale-110 shadow-lg"
                :disabled="isLoading"
                title="Leave meeting"
              >
                <svg class="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <!-- Right Controls -->
            <div class="flex items-center gap-1 sm:gap-2">
              <!-- Chat -->
              <button
                @click="chatStore.toggleChat()"
                class="relative p-2 sm:p-2.5 md:p-3 rounded-full bg-[#5F6368] hover:bg-[#6F7378] transition-all"
                title="Toggle chat"
              >
                <svg class="w-4 h-4 sm:w-4.5 sm:h-4.5 md:w-5 md:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <!-- Unread Badge -->
                <span
                  v-if="chatStore.unreadCount > 0"
                  class="absolute -top-0.5 sm:-top-1 -right-0.5 sm:-right-1 bg-red-600 text-white text-[10px] sm:text-xs font-bold rounded-full w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center"
                >
                  {{ chatStore.unreadCount > 9 ? '9+' : chatStore.unreadCount }}
                </span>
              </button>
              
              <!-- Participants -->
              <button
                @click="showParticipants = !showParticipants"
                class="p-2 sm:p-2.5 md:p-3 rounded-full bg-[#5F6368] hover:bg-[#6F7378] transition-all"
                :class="{ 'bg-blue-600 hover:bg-blue-700': showParticipants }"
                title="Show participants"
              >
                <svg class="w-4 h-4 sm:w-4.5 sm:h-4.5 md:w-5 md:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </footer>

    <!-- Chat Panel -->
    <transition
      enter-active-class="transition duration-300 ease-out"
      enter-from-class="transform translate-x-full"
      enter-to-class="transform translate-x-0"
      leave-active-class="transition duration-200 ease-in"
      leave-from-class="transform translate-x-0"
      leave-to-class="transform translate-x-full"
    >
      <ChatPanel
        v-if="chatStore.chatOpen"
        :current-user-id="socket?.id || ''"
        :participant-count="totalParticipants"
        @send-message="handleSendMessage"
        @typing-start="handleChatTypingStart"
        @typing-stop="handleChatTypingStop"
        @close="chatStore.closeChat()"
      />
    </transition>

    <!-- Participants Panel -->
    <transition
      enter-active-class="transition duration-300 ease-out"
      enter-from-class="transform translate-x-full"
      enter-to-class="transform translate-x-0"
      leave-active-class="transition duration-200 ease-in"
      leave-from-class="transform translate-x-0"
      leave-to-class="transform translate-x-full"
    >
      <ParticipantsPanel
        v-if="showParticipants"
        :participant-count="totalParticipants"
        :remote-participants="participants"
        :local-user-name="userName"
        :meeting-id="meetingId"
        :is-audio-enabled="isAudioEnabled"
        :is-video-enabled="isVideoEnabled"
        @close="showParticipants = false"
        @update-name="updateUserName"
      />
    </transition>

    <!-- Settings Panel -->
    <transition
      enter-active-class="transition duration-300 ease-out"
      enter-from-class="transform translate-x-full"
      enter-to-class="transform translate-x-0"
      leave-active-class="transition duration-200 ease-in"
      leave-from-class="transform translate-x-0"
      leave-to-class="transform translate-x-full"
    >
      <SettingsPanel
        v-if="showSettings"
        :display-name="userName"
        @close="showSettings = false"
        @update-name="updateUserName"
      />
    </transition>

    <!-- Host Controls Panel (Fixed Position) -->
    <div v-if="isHost" class="fixed bottom-20 sm:bottom-24 right-2 sm:right-6 z-30 max-w-[calc(100vw-1rem)] sm:max-w-md">
      <HostControls
        :is-host="isHost"
        :is-locked="isLocked"
        :waiting-participants="waitingParticipants"
        :participant-count="totalParticipants"
        :socket="socket"
        :meeting-id="meetingId"
        @lock-changed="handleLockChanged"
        @mute-all="() => {}"
        @admit-participant="handleAdmitParticipant"
        @reject-participant="handleRejectParticipant"
        @admit-all="handleAdmitAll"
        @end-meeting="handleEndMeeting"
      />
    </div>

    <!-- Meeting Info Panel -->
    <transition
      enter-active-class="transition duration-300 ease-out"
      enter-from-class="transform translate-x-full"
      enter-to-class="transform translate-x-0"
      leave-active-class="transition duration-200 ease-in"
      leave-from-class="transform translate-x-0"
      leave-to-class="transform translate-x-full"
    >
      <div v-if="showMeetingInfo" class="absolute top-0 right-0 bottom-0 w-full sm:w-96 bg-white shadow-2xl z-30 p-4 sm:p-6">
        <div class="flex items-center justify-between mb-4 sm:mb-6">
          <h2 class="text-lg sm:text-xl font-semibold">Meeting details</h2>
          <button @click="showMeetingInfo = false" class="p-2 hover:bg-gray-100 rounded-full">
            <svg class="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div class="space-y-4 sm:space-y-6">
          <!-- Meeting ID Section -->
          <div>
            <label class="text-xs sm:text-sm text-gray-600 block mb-2">Meeting ID</label>
            <div class="flex items-center gap-2 bg-gray-100 p-2.5 sm:p-3 rounded-lg">
              <span class="text-xs sm:text-sm font-mono flex-1 truncate">{{ meetingId }}</span>
              <button 
                @click="copyMeetingId"
                class="text-blue-600 hover:text-blue-700 text-xs sm:text-sm font-medium whitespace-nowrap"
              >
                Copy
              </button>
            </div>
          </div>

          <!-- Meeting Link Section -->
          <div>
            <label class="text-xs sm:text-sm text-gray-600 block mb-2">Share link</label>
            <div class="flex items-center gap-2 bg-gray-100 p-2.5 sm:p-3 rounded-lg">
              <span class="text-xs sm:text-sm flex-1 truncate">{{ meetingLink }}</span>
              <button 
                @click="copyMeetingLink"
                class="text-blue-600 hover:text-blue-700 text-xs sm:text-sm font-medium whitespace-nowrap"
              >
                Copy link
              </button>
            </div>
          </div>

          <!-- Meeting Info -->
          <div class="space-y-2 sm:space-y-3">
            <div>
              <label class="text-xs sm:text-sm text-gray-600 block mb-1">Your name</label>
              <div class="bg-gray-100 p-2.5 sm:p-3 rounded-lg text-xs sm:text-sm">{{ userName }}</div>
            </div>
            <div>
              <label class="text-xs sm:text-sm text-gray-600 block mb-1">Duration</label>
              <div class="bg-gray-100 p-2.5 sm:p-3 rounded-lg text-xs sm:text-sm">{{ meetingDuration }}</div>
            </div>
            <div>
              <label class="text-xs sm:text-sm text-gray-600 block mb-1">Participants</label>
              <div class="bg-gray-100 p-2.5 sm:p-3 rounded-lg text-xs sm:text-sm">{{ totalParticipants }}</div>
            </div>
          </div>

          <!-- Meeting Controls -->
          <div class="pt-3 sm:pt-4 border-t border-gray-200">
            <h3 class="text-sm font-semibold text-gray-700 mb-3">Meeting controls</h3>
            <div class="space-y-2">
              <!-- Add People Button -->
              <button 
                @click="copyMeetingLink"
                class="w-full flex items-center gap-3 px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors text-left"
              >
                <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
                <span class="text-sm font-medium text-gray-700">Add people</span>
              </button>

              <!-- End Meeting Button -->
              <button 
                @click="handleLeaveMeeting"
                class="w-full flex items-center gap-3 px-4 py-3 bg-red-50 hover:bg-red-100 rounded-lg transition-colors text-left"
              >
                <svg class="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span class="text-sm font-medium text-red-700">Leave meeting</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch, nextTick } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useWebRTC } from '../composables/useWebRTC'
import { useMediaStream } from '../composables/useMediaStream'
import { useChat } from '../composables/useChat'
import { useActiveSpeaker } from '../composables/useActiveSpeaker'
import { useChatStore } from '../stores/chat'
import { useToastStore } from '../stores/toast'
import ChatPanel from '../components/ChatPanel.vue'
import ParticipantsPanel from '../components/ParticipantsPanel.vue'
import LayoutSwitcher from '../components/LayoutSwitcher.vue'
import SettingsPanel from '../components/SettingsPanel.vue'
import ToastContainer from '../components/ToastContainer.vue'
import HostControls from '../components/HostControls.vue'
import WaitingRoom from '../components/WaitingRoom.vue'

const router = useRouter()
const route = useRoute()
const chatStore = useChatStore()
const toastStore = useToastStore()

// Refs
const localVideoRef = ref(null)
const remoteVideoRefs = new Map()
const isLoading = ref(true)
const errorMessage = ref(null)
const showMeetingInfo = ref(false)
const showParticipants = ref(false)
const showSettings = ref(false)
const currentTime = ref('')
const meetingStartTime = ref(Date.now())
const meetingDuration = ref('00:00')
const isLocalActive = ref(false)
const currentLayout = ref('grid')
const spotlightParticipant = ref(null)
const screenShareParticipant = ref(null)
const previousLayout = ref('grid')

// Host Controls refs
const isHost = ref(false)
const hostId = ref(null)
const isLocked = ref(false)
const waitingParticipants = ref([])
const showWaitingRoom = ref(false)

// Route params
const appName = import.meta.env.VITE_APP_NAME || 'Discus'
const meetingId = ref(route.params.id)

// Load user preferences from localStorage (saved in PreJoin)
let userPreferences = { name: 'Guest', video: true, audio: true }
try {
  const saved = localStorage.getItem('userPreferences')
  if (saved) {
    userPreferences = JSON.parse(saved)
  }
} catch (e) {
  console.warn('[Meeting] Failed to load preferences:', e)
}

const userName = ref(userPreferences.name || 'Guest')
const initialVideo = userPreferences.video !== false
const initialAudio = userPreferences.audio !== false

// Initialize composables
const {
  initialize: initWebRTC,
  joinRoom,
  produce,
  consumePendingProducers,
  leaveRoom,
  remoteStreams,
  isConnected,
  participants,
  socket,
} = useWebRTC()

const {
  localStream,
  videoEnabled,
  audioEnabled,
  screenShareEnabled,
  hasVideo,
  hasAudio,
  hasScreenShare,
  permissionsGranted,
  requestPermissions,
  startLocalStream,
  stopLocalStream,
  toggleVideo,
  toggleAudio,
  startScreenShare,
  stopScreenShare,
  getVideoTrack,
  getAudioTrack,
  getScreenTrack,
} = useMediaStream()

// Initialize chat
const {
  sendMessage,
  handleTypingStart,
  handleTypingStop,
  setupChatListeners,
  cleanupChatListeners,
} = useChat(socket, meetingId.value)

// Initialize active speaker detection
const {
  activeSpeakerId,
  audioLevels,
  startMonitoring,
  stopMonitoring,
  startDetection,
  stopDetection,
  cleanup: cleanupActiveSpeaker
} = useActiveSpeaker()

// Computed
const totalParticipants = computed(() => {
  return 1 + (participants.value?.size || 0) // 1 (local) + remote participants
})

const isLocalSpeaking = computed(() => {
  return activeSpeakerId.value === socket.value?.id
})

const meetingLink = computed(() => {
  return `${window.location.origin}/meeting/${meetingId.value}`
})

const getGridClass = computed(() => {
  const total = totalParticipants.value
  
  // 1 user: Large centered video (like Google Meet when alone)
  if (total === 1) {
    return 'grid-cols-1 place-items-center'
  }
  
  // 2 users: Side by side (equal split)
  if (total === 2) {
    return 'grid-cols-1 md:grid-cols-2 gap-4'
  }
  
  // 3-4 users: 2x2 grid
  if (total <= 4) {
    return 'grid-cols-2 gap-4'
  }
  
  // 5-6 users: 2x3 grid on desktop, 2 columns on mobile
  if (total <= 6) {
    return 'grid-cols-2 lg:grid-cols-3 gap-4'
  }
  
  // 7-9 users: 3x3 grid on desktop, 2 columns on mobile
  if (total <= 9) {
    return 'grid-cols-2 lg:grid-cols-3 gap-3'
  }
  
  // 10-12 users: 3x4 grid
  if (total <= 12) {
    return 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3'
  }
  
  // 13-16 users: 4x4 grid
  if (total <= 16) {
    return 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2'
  }
  
  // 17-25 users: 5x5 grid with smaller gaps
  if (total <= 25) {
    return 'grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-2'
  }
  
  // 26+ users: Dense 6-column grid
  return 'grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-1'
})

// Get participants for spotlight mode (all except the spotlighted one)
const thumbnailParticipants = computed(() => {
  const thumbnails = []
  
  // Add remote participants
  for (const [participantId, stream] of remoteStreams.value) {
    if (participantId !== spotlightParticipant.value) {
      thumbnails.push({ id: participantId, stream, type: 'remote' })
    }
  }
  
  return thumbnails
})

// Handle layout change
const handleLayoutChange = (layout) => {
  currentLayout.value = layout
  console.log(`[Meeting] Layout changed to: ${layout}`)
  
  // Auto-select active speaker for spotlight if not manually selected
  if (layout === 'spotlight' && !spotlightParticipant.value) {
    if (activeSpeakerId.value) {
      spotlightParticipant.value = activeSpeakerId.value
    } else if (remoteStreams.value.size > 0) {
      // Default to first remote participant
      spotlightParticipant.value = Array.from(remoteStreams.value.keys())[0]
    }
  }
}

// Switch spotlight participant
const setSpotlightParticipant = (participantId) => {
  spotlightParticipant.value = participantId
  console.log(`[Meeting] Spotlight participant: ${participantId}`)
}

// Copy meeting ID
const copyMeetingId = () => {
  navigator.clipboard.writeText(meetingId.value)
    .then(() => {
      toastStore.success('Meeting ID copied to clipboard!')
    })
    .catch(() => {
      toastStore.error('Failed to copy meeting ID')
    })
}

// Copy meeting link
const copyMeetingLink = () => {
  navigator.clipboard.writeText(meetingLink.value)
    .then(() => {
      toastStore.success('Meeting link copied! Share it with others to join.')
    })
    .catch(() => {
      toastStore.error('Failed to copy meeting link')
    })
}

// Update time
const updateTime = () => {
  const now = new Date()
  currentTime.value = now.toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit',
    hour12: true 
  })
  
  // Update meeting duration
  const duration = Math.floor((Date.now() - meetingStartTime.value) / 1000)
  const hours = Math.floor(duration / 3600)
  const minutes = Math.floor((duration % 3600) / 60)
  const seconds = duration % 60
  
  if (hours > 0) {
    meetingDuration.value = `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  } else {
    meetingDuration.value = `${minutes}:${seconds.toString().padStart(2, '0')}`
  }
}

// Track which participants are currently being played to avoid duplicate play() calls
const playingParticipants = new Set()

// Set remote video ref
const setRemoteVideoRef = (el, participantId) => {
  if (el) {
    console.log('[Meeting] Video ref created for peer:', participantId)
    remoteVideoRefs.set(participantId, el)
    
    // If we already have a stream for this participant, attach it now
    const stream = remoteStreams.value.get(participantId)
    if (stream && el.srcObject !== stream) {
      console.log('[Meeting] Attaching existing stream to new video element for peer:', participantId)
      el.srcObject = stream
      
      // Only attempt to play if we're not already playing this participant
      if (!playingParticipants.has(participantId)) {
        playingParticipants.add(participantId)
        el.play()
          .then(() => {
            console.log('[Meeting] ✅ Video playing for peer:', participantId)
            // Remove from set after a short delay to allow for re-plays if needed
            setTimeout(() => playingParticipants.delete(participantId), 500)
          })
          .catch(e => {
            console.error('[Meeting] ❌ Play error:', e)
            playingParticipants.delete(participantId)
          })
      }
    }
  }
}

// Initialize meeting
const initializeMeeting = async () => {
  try {
    isLoading.value = true
    errorMessage.value = null

    console.log('[Meeting] Starting initialization...')
    console.log('[Meeting] User Agent:', navigator.userAgent)
    console.log('[Meeting] Is HTTPS:', window.location.protocol === 'https:')

    // Request media permissions (but don't fail if denied)
    console.log('[Meeting] Requesting permissions...')
    try {
      // Add timeout for permission request (30 seconds)
      const permissionPromise = requestPermissions(initialVideo, initialAudio)
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Permission request timeout')), 30000)
      )
      
      await Promise.race([permissionPromise, timeoutPromise])
      console.log('[Meeting] Permissions granted successfully')
    } catch (permError) {
      console.warn('[Meeting] Media permission error (continuing anyway):', permError.message)
      toastStore.warning('Media permissions denied or timed out. You can still join the meeting.', 5000)
      // Continue without media - user can still join meeting
    }

    // Start local stream if permissions granted
    if (permissionsGranted.value.camera || permissionsGranted.value.microphone) {
      try {
        console.log('[Meeting] Starting local stream...')
        await startLocalStream(
          initialVideo && permissionsGranted.value.camera,
          initialAudio && permissionsGranted.value.microphone
        )
        console.log('[Meeting] Local stream started successfully')
        // Note: Will attach to video element after loading completes
      } catch (streamError) {
        console.warn('[Meeting] Failed to start stream (continuing):', streamError.message)
        toastStore.info('Could not start camera/microphone. You can enable them later.', 5000)
        // Continue without stream
      }
    } else {
      console.log('[Meeting] No media permissions, joining without camera/mic')
    }

    // Initialize WebRTC
    // Use empty string to connect to same origin (nginx will proxy to backend)
    const socketUrl = import.meta.env.VITE_SOCKET_URL || window.location.origin
    console.log('[Meeting] Initializing WebRTC...', socketUrl)
    
    try {
      // Add timeout for WebRTC initialization (10 seconds)
      const initPromise = initWebRTC(socketUrl)
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('WebRTC initialization timeout')), 10000)
      )
      
      await Promise.race([initPromise, timeoutPromise])
      console.log('[Meeting] WebRTC initialized successfully')
    } catch (initError) {
      console.error('[Meeting] WebRTC init failed:', initError)
      throw new Error(`Failed to initialize: ${initError.message}`)
    }

    // Join room
    console.log('[Meeting] Joining room...', meetingId.value, userName.value)
    
    let joinResponse
    try {
      // Add timeout for join room (15 seconds)
      const joinPromise = joinRoom(meetingId.value, userName.value)
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Join room timeout - server not responding')), 15000)
      )
      
      joinResponse = await Promise.race([joinPromise, timeoutPromise])
      console.log('[Meeting] Successfully joined room')
    } catch (joinError) {
      console.error('[Meeting] Join room failed:', joinError)
      throw new Error(`Failed to join room: ${joinError.message}`)
    }
    
    // Check if waiting for admission
    if (!joinResponse.success && joinResponse.error === 'WAITING_FOR_ADMISSION') {
      showWaitingRoom.value = true
      isLoading.value = false
      return
    }
    
    // Save session to localStorage (for refresh recovery)
    try {
      sessionStorage.setItem('active-meeting', JSON.stringify({
        meetingId: meetingId.value,
        userName: userName.value,
        joinedAt: Date.now(),
      }))
      console.log('[Meeting] Session saved for refresh recovery')
    } catch (e) {
      console.warn('[Meeting] Failed to save session:', e)
    }
    
    // Set host status
    if (joinResponse.isHost !== undefined) {
      isHost.value = joinResponse.isHost
      hostId.value = joinResponse.hostId
      isLocked.value = joinResponse.isLocked
      console.log('[Meeting] Host status:', isHost.value ? 'YES' : 'NO')
    }
    
    // Load chat history from backend
    if (joinResponse.chatHistory && joinResponse.chatHistory.length > 0) {
      console.log(`[Meeting] Loading ${joinResponse.chatHistory.length} chat messages from history`)
      joinResponse.chatHistory.forEach(msg => {
        chatStore.addMessage(msg)
      })
      console.log('[Meeting] Chat history loaded')
    }

    // Produce video track if enabled
    if (hasVideo.value) {
      const videoTrack = getVideoTrack()
      if (videoTrack) {
        try {
          console.log('[Meeting] Producing video track...')
          await produce(videoTrack, 'video')
        } catch (produceError) {
          console.error('[Meeting] Failed to produce video:', produceError)
        }
      }
    }

    // Produce audio track if enabled
    if (hasAudio.value) {
      const audioTrack = getAudioTrack()
      if (audioTrack) {
        try {
          console.log('[Meeting] Producing audio track...')
          await produce(audioTrack, 'audio')
        } catch (produceError) {
          console.error('[Meeting] Failed to produce audio:', produceError)
        }
      }
    }

    // Consume existing producers from peers who joined before us
    try {
      console.log('[Meeting] Consuming existing producers from other peers...')
      await consumePendingProducers()
    } catch (consumeError) {
      console.error('[Meeting] Failed to consume pending producers:', consumeError)
    }

    isLoading.value = false
    console.log('[Meeting] Initialization complete!')
    
    // Setup chat listeners
    setupChatListeners()
    
    // Now that loading is false, the video element should be rendered
    // Attach the stream to the video element
    await nextTick()
    if (localVideoRef.value && localStream.value) {
      console.log('[Meeting] Post-init: Attaching stream to now-visible video element')
      localVideoRef.value.srcObject = localStream.value
      await localVideoRef.value.play().catch(e => console.log('[Meeting] Post-init play error:', e.message))
    }
  } catch (error) {
    console.error('[Meeting] Initialization failed:', error)
    errorMessage.value = error.message || 'Failed to join meeting'
    toastStore.error(error.message || 'Failed to join meeting')
    isLoading.value = false
  }
}

// Chat handlers
const handleSendMessage = async (message) => {
  try {
    await sendMessage(message)
  } catch (error) {
    console.error('[Meeting] Failed to send message:', error)
    toastStore.error('Failed to send message. Please try again.')
  }
}

const handleChatTypingStart = () => {
  handleTypingStart()
}

const handleChatTypingStop = () => {
  handleTypingStop()
}

// Update user name
const updateUserName = (newName) => {
  userName.value = newName
  console.log('[Meeting] User name updated to:', newName)
  // TODO: Emit socket event to update name for other participants
}

// Handle toggle audio
const handleToggleAudio = async () => {
  try {
    await toggleAudio()
    
    if (hasAudio.value) {
      // Produce new audio track
      const audioTrack = getAudioTrack()
      if (audioTrack) {
        await produce(audioTrack, 'audio')
      }
    }
  } catch (error) {
    console.error('[Meeting] Failed to toggle audio:', error)
    toastStore.error('Failed to toggle microphone. Please check permissions.')
  }
}

// Handle toggle video
const handleToggleVideo = async () => {
  try {
    await toggleVideo()
    
    if (hasVideo.value) {
      // Produce new video track
      const videoTrack = getVideoTrack()
      if (videoTrack) {
        await produce(videoTrack, 'video')
      }
    }
  } catch (error) {
    console.error('[Meeting] Failed to toggle video:', error)
    toastStore.error('Failed to toggle camera. Please check permissions.')
  }
}

// Handle screen share
const handleScreenShare = async () => {
  try {
    if (hasScreenShare.value) {
      // Stop screen sharing
      stopScreenShare()
      screenShareParticipant.value = null
      
      // Restore previous layout
      if (previousLayout.value && previousLayout.value !== currentLayout.value) {
        currentLayout.value = previousLayout.value
        console.log('[Meeting] Restored layout to:', previousLayout.value)
      }
    } else {
      // Start screen sharing
      await startScreenShare()
      const screenTrack = getScreenTrack()
      if (screenTrack) {
        await produce(screenTrack, 'screen')
        
        // Mark local user as screen sharer
        screenShareParticipant.value = socket.value?.id
        
        // Auto-switch to spotlight layout for better screen sharing experience
        if (currentLayout.value !== 'spotlight') {
          previousLayout.value = currentLayout.value
          currentLayout.value = 'spotlight'
          console.log('[Meeting] Auto-switched to spotlight layout for screen sharing')
        }
        
        // Set self as spotlight participant
        spotlightParticipant.value = socket.value?.id
      }
    }
  } catch (error) {
    console.error('[Meeting] Failed to toggle screen share:', error)
    toastStore.error('Failed to share screen. Please grant screen sharing permission.')
  }
}

// Handle leave meeting
const handleLeaveMeeting = async () => {
  try {
    // Clear session storage on intentional leave
    try {
      sessionStorage.removeItem('active-meeting')
      localStorage.removeItem('userPreferences')
      chatStore.clearMessages() // Clear chat messages
      console.log('[Meeting] Session and preferences cleared')
    } catch (e) {
      console.warn('[Meeting] Failed to clear session:', e)
    }
    
    await leaveRoom()
    stopLocalStream()
    router.push('/')
  } catch (error) {
    console.error('[Meeting] Failed to leave meeting:', error)
    router.push('/')
  }
}

// Watch local stream and attach to video element
watch(localStream, (stream) => {
  nextTick(() => {
    if (localVideoRef.value && stream) {
      console.log('[Meeting] Watch: Attaching local stream to video element')
      console.log('[Meeting] Watch: Stream active?', stream.active)
      console.log('[Meeting] Watch: Video tracks:', stream.getVideoTracks().map(t => ({
        id: t.id,
        label: t.label,
        enabled: t.enabled,
        readyState: t.readyState,
        muted: t.muted
      })))
      localVideoRef.value.srcObject = stream
      // Ensure video plays
      localVideoRef.value.play()
        .then(() => console.log('[Meeting] Watch: Video playing successfully'))
        .catch(e => console.log('[Meeting] Watch: Video autoplay error:', e.message))
      
      // Monitor local audio for active speaker detection
      const localAudioTrack = stream.getAudioTracks()[0]
      if (localAudioTrack && socket.value?.id) {
        console.log('[Meeting] 🎤 Starting active speaker monitoring for local user')
        startMonitoring(socket.value.id, localAudioTrack)
      }
    } else {
      console.log('[Meeting] Watch: Missing ref or stream', {
        hasRef: !!localVideoRef.value,
        hasStream: !!stream
      })
    }
  })
}, { immediate: true })

// Watch remote streams and attach to video elements
watch(remoteStreams, (streams) => {
  // Use double nextTick to ensure DOM is fully updated with new video elements
  nextTick(() => {
    nextTick(() => {
      console.log('[Meeting] ===== Remote streams updated =====')
      console.log('[Meeting] Total remote streams:', streams.size)
      console.log('[Meeting] Remote video refs available:', remoteVideoRefs.size)
      
      for (const [participantId, stream] of streams.entries()) {
        const videoEl = remoteVideoRefs.get(participantId)
        console.log('[Meeting] Processing peer:', participantId)
        console.log('[Meeting]   - Has video element?', !!videoEl)
        console.log('[Meeting]   - Has stream?', !!stream)
        
        if (videoEl && stream) {
          const tracks = stream.getTracks()
          console.log('[Meeting]   - Stream ID:', stream.id)
          console.log('[Meeting]   - Stream active?', stream.active)
          console.log('[Meeting]   - Total tracks:', tracks.length)
          tracks.forEach(track => {
            console.log(`[Meeting]   - Track: ${track.kind}, enabled: ${track.enabled}, readyState: ${track.readyState}, id: ${track.id}`)
          })
          
          // Only set srcObject if it's different to avoid interrupting ongoing play() attempts
          if (videoEl.srcObject !== stream) {
            console.log('[Meeting]   - Setting srcObject...')
            videoEl.srcObject = stream
          }
          
          console.log('[Meeting]   - Video element ready state:', videoEl.readyState)
          console.log('[Meeting]   - Video element paused?', videoEl.paused)
          
          // Only play if not already playing this participant
          if (!playingParticipants.has(participantId) && videoEl.paused) {
            playingParticipants.add(participantId)
            videoEl.play()
              .then(() => {
                console.log('[Meeting]   ✅ Video playing successfully for peer:', participantId)
                console.log('[Meeting]   - Video dimensions:', videoEl.videoWidth, 'x', videoEl.videoHeight)
                
                // Start monitoring audio for active speaker detection
                const audioTrack = stream.getAudioTracks()[0]
                if (audioTrack) {
                  console.log('[Meeting]   🎤 Starting active speaker monitoring for:', participantId)
                  startMonitoring(participantId, audioTrack)
                }
                
                // Remove from set after a short delay
                setTimeout(() => playingParticipants.delete(participantId), 500)
              })
              .catch(e => {
                console.error('[Meeting]   ❌ Video play error:', e)
                playingParticipants.delete(participantId)
              })
          } else {
            console.log('[Meeting]   ⏭️ Skipping play() - already playing or play in progress for:', participantId)
          }
        } else {
          if (!videoEl) {
            console.log('[Meeting]   ⚠️ No video element found for peer:', participantId)
            console.log('[Meeting]   ⚠️ Will retry after next render cycle...')
            // Retry after another tick to catch late-rendered elements
            setTimeout(() => {
              const retryEl = remoteVideoRefs.get(participantId)
              if (retryEl && stream && retryEl.srcObject !== stream) {
                console.log('[Meeting]   ✅ Found video element on retry for peer:', participantId)
                retryEl.srcObject = stream
                
                if (!playingParticipants.has(participantId)) {
                  playingParticipants.add(participantId)
                  retryEl.play()
                    .then(() => {
                      console.log('[Meeting]   ✅ Video playing after retry')
                      setTimeout(() => playingParticipants.delete(participantId), 500)
                    })
                    .catch(e => {
                      console.error('[Meeting]   ❌ Retry play error:', e)
                      playingParticipants.delete(participantId)
                    })
                }
              }
            }, 100)
          }
          if (!stream) console.log('[Meeting]   ⚠️ No stream found for peer:', participantId)
        }
      }
      console.log('[Meeting] ===== End remote streams update =====')
    })
  })
}, { deep: true, immediate: true })

// Watch for participant changes to show notifications
watch(() => participants.value.size, (newSize, oldSize) => {
  if (oldSize !== undefined && newSize > oldSize) {
    // Someone joined
    const newParticipants = Array.from(participants.value.values())
    const newParticipant = newParticipants[newParticipants.length - 1]
    if (newParticipant?.userName) {
      toastStore.info(`${newParticipant.userName} joined the meeting`, 3000)
    }
  } else if (oldSize !== undefined && newSize < oldSize) {
    // Someone left
    toastStore.info(`A participant left the meeting`, 3000)
  }
})

// Host Control Handlers
const handleLockChanged = (locked) => {
  isLocked.value = locked
}

const handleAdmitParticipant = (peerId) => {
  waitingParticipants.value = waitingParticipants.value.filter(p => p.peerId !== peerId)
}

const handleRejectParticipant = (peerId) => {
  waitingParticipants.value = waitingParticipants.value.filter(p => p.peerId !== peerId)
}

const handleAdmitAll = () => {
  waitingParticipants.value = []
}

const handleEndMeeting = () => {
  // Kick all participants
  for (const [participantId] of participants.value) {
    socket.value.emit('kick-participant', { 
      meetingId: meetingId.value, 
      peerId: participantId, 
      reason: 'Host ended the meeting for everyone' 
    })
  }
  
  // Leave meeting after 1 second
  setTimeout(() => {
    handleLeaveMeeting()
  }, 1000)
}

const handleWaitingRoomAdmitted = (meetingIdFromEvent) => {
  showWaitingRoom.value = false
  // Retry initialization
  initializeMeeting()
}

const handleWaitingRoomRejected = () => {
  showWaitingRoom.value = false
  router.push('/')
}

const handleWaitingRoomCancel = () => {
  showWaitingRoom.value = false
  router.push('/')
}

const handleWaitingRoomRetry = () => {
  showWaitingRoom.value = false
  // Retry join
  initializeMeeting()
}

// Setup socket listeners for host controls
const setupHostControlListeners = () => {
  if (!socket.value) return
  
  // Meeting locked/unlocked
  socket.value.on('meeting-locked', ({ isLocked: locked, hostId: host }) => {
    isLocked.value = locked
    hostId.value = host
    toastStore.info(locked ? 'Meeting locked by host' : 'Meeting unlocked by host')
  })
  
  // Participant knocking (waiting to join)
  socket.value.on('participant-knock', ({ peerId, userName: name }) => {
    waitingParticipants.value.push({ peerId, userName: name })
    toastStore.info(`${name} wants to join the meeting`, 0) // Don't auto-dismiss
  })
  
  // Force mute
  socket.value.on('force-mute', ({ message }) => {
    toastStore.warning(message || 'You have been muted by the host')
    if (hasAudio.value) {
      handleToggleAudio()
    }
  })
  
  // Kicked from meeting
  socket.value.on('kicked-from-meeting', ({ reason }) => {
    toastStore.error(reason || 'You have been removed from the meeting')
    setTimeout(() => {
      handleLeaveMeeting()
    }, 2000)
  })
  
  // Host changed
  socket.value.on('host-changed', ({ newHostId, hostName, reason }) => {
    hostId.value = newHostId
    isHost.value = newHostId === socket.value.id
    
    if (isHost.value) {
      toastStore.success(`You are now the host! ${reason || ''}`)
    } else {
      toastStore.info(`${hostName} is now the host. ${reason || ''}`)
    }
  })
}

const cleanupHostControlListeners = () => {
  if (!socket.value) return
  
  socket.value.off('meeting-locked')
  socket.value.off('participant-knock')
  socket.value.off('force-mute')
  socket.value.off('kicked-from-meeting')
  socket.value.off('host-changed')
}

// Lifecycle hooks
onMounted(() => {
  initializeMeeting()
  updateTime()
  const timeInterval = setInterval(updateTime, 1000)
  
  // Start active speaker detection
  startDetection()
  console.log('[Meeting] Active speaker detection started')
  
  // Setup host control listeners
  // Use a small delay to ensure socket is ready
  setTimeout(() => {
    setupHostControlListeners()
    console.log('[Meeting] Host control listeners setup')
  }, 500)
  
  // Cleanup on unmount
  onBeforeUnmount(() => {
    clearInterval(timeInterval)
  })
})

onBeforeUnmount(() => {
  cleanupChatListeners()
  cleanupActiveSpeaker()
  cleanupHostControlListeners()
  chatStore.clearMessages()
  leaveRoom()
  stopLocalStream()
  console.log('[Meeting] Cleaned up')
})
</script>
