<template>
  <div class="asterisk-dialpad">
    <div class="dialpad-grid">
      <button 
        v-for="number in numbers" 
        :key="number.value"
        class="dialpad-button"
        @click="$emit('digit', number.value)"
      >
        <span class="number">{{ number.value }}</span>
        <span class="letters" v-if="number.letters">{{ number.letters }}</span>
      </button>
      <button class="dialpad-button" @click="$emit('digit', '*')">
        <span class="number">*</span>
      </button>
      <button class="dialpad-button" @click="$emit('digit', '0')">
        <span class="number">0</span>
        <span class="letters">+</span>
      </button>
      <button class="dialpad-button" @click="$emit('digit', '#')">
        <span class="number">#</span>
      </button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'AsteriskDialPad',
  setup() {
    const numbers = [
      { value: '1', letters: '' },
      { value: '2', letters: 'ABC' },
      { value: '3', letters: 'DEF' },
      { value: '4', letters: 'GHI' },
      { value: '5', letters: 'JKL' },
      { value: '6', letters: 'MNO' },
      { value: '7', letters: 'PQRS' },
      { value: '8', letters: 'TUV' },
      { value: '9', letters: 'WXYZ' }
    ];

    return {
      numbers
    };
  }
};
</script>

<style scoped>
.asterisk-dialpad {
  background: white;
  border-radius: 8px;
  padding: 20px;
  margin-top: 20px;
}

.dialpad-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
}

.dialpad-button {
  aspect-ratio: 1;
  border: 1px solid #ddd;
  border-radius: 8px;
  background: white;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.dialpad-button:hover {
  background: #f5f5f5;
}

.dialpad-button:active {
  background: #e0e0e0;
}

.number {
  font-size: 24px;
  font-weight: bold;
}

.letters {
  font-size: 10px;
  color: #666;
  margin-top: 4px;
}
</style> 