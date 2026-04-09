<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { NTable, NInput } from 'naive-ui'
import { useTableNavigation } from '../composables/useTableNavigation'
import type { InputInst } from 'naive-ui'
import type { VNodeRef } from 'vue'

const ROWS = 5
const COLS = 5

const data = ref(
  Array.from({ length: ROWS }, (_, r) =>
    Array.from({ length: COLS }, (_, c) => `R${r + 1}C${c + 1}`)
  )
)

const inputRefs = ref<Map<string, InputInst>>(new Map())

const setInputRef = (key: string) => (el: Element | InputInst | null) => {
  if (el && 'focus' in el) {
    inputRefs.value.set(key, el as InputInst)
  } else if (el === null) {
    inputRefs.value.delete(key)
  }
}

const getInputRef = (row: number, col: number) => {
  return inputRefs.value.get(`${row},${col}`)
}

const wrapper = ref<HTMLDivElement | null>(null)

const getWrapperRef = () => wrapper.value

const {
  active,
  editing,
  handleKeydown,
  saveEdit,  
  cancelEdit
} = useTableNavigation(ROWS, COLS, data, getInputRef, getWrapperRef)

onMounted(() => {
  wrapper.value?.focus()
})

const setActive = (row: number, col: number) => {
  if (editing.value) {
    cancelEdit()
  }
  active.value = { row, col }
}

const isEditing = (row: number, col: number) => {
  return editing.value?.row === row && editing.value?.col === col
}

const cellClass = (row: number, col: number) => ({
  active: active.value.row === row && active.value.col === col
})
</script>

<template>
  <div ref="wrapper" tabindex="0" class="wrapper" @keydown="handleKeydown">
    <n-table bordered>
      <tbody>
        <tr v-for="(row, r) in data" :key="r">
          <td
            v-for="(cell, c) in row"
            :key="c"
            :class="cellClass(r, c)"
            @click="setActive(r, c)"
          >
            <n-input
              v-show="isEditing(r, c)"
              v-model:value="data[r][c]"
              size="small"
              :ref="setInputRef(`${r},${c}`) as VNodeRef"
              @keydown.enter.stop="saveEdit"
              @keydown.escape.stop="cancelEdit"
            />
            <div v-show="!isEditing(r, c)">
              {{ cell }}
            </div>
          </td>
        </tr>
      </tbody>
    </n-table>
  </div>
</template>
  
  <style scoped>
  .wrapper {
    outline: none;
    width: 600px;
    margin: 40px auto;
  }
  
  td {
    width: 120px;
    height: 40px;
    text-align: center;
    cursor: pointer;
  }

  td > div {
    width: inherit;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  
  .active {
    outline: 2px solid #18a058;
    outline-offset: -2px;
  }
  </style>