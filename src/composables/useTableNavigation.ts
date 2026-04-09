import { ref, nextTick, watch } from 'vue'
import type { Ref } from 'vue'
import type { InputInst } from 'naive-ui'

interface Cell {
  row: number
  col: number
}

type TableData = string[][]

export function useTableNavigation(
  rows: number,
  cols: number,
  data: Ref<TableData>,
  getInputRef: (row: number, col: number) => InputInst | undefined,
  getWrapperRef: () => HTMLElement | null
) {
  const active = ref<Cell>({ row: 0, col: 0 })
  const editing = ref<Cell | null>(null)
  const originalValue = ref<string>('')

  watch(editing, async (newVal, oldVal) => {
    if (newVal) {
      originalValue.value = data.value[newVal.row][newVal.col]
      
      await nextTick()
      const input = getInputRef(newVal.row, newVal.col)
      setTimeout(() => {
        input?.focus()
        input?.select?.()
      }, 10)
    } else if (oldVal) {
      await nextTick()
      const wrapper = getWrapperRef()
      if (wrapper) {
        wrapper.focus()
      }
    }
  })

  const move = (key: string) => {
    const { row, col } = active.value

    switch (key) {
      case 'ArrowUp':
        active.value.row = Math.max(0, row - 1)
        break
      case 'ArrowDown':
        active.value.row = Math.min(rows - 1, row + 1)
        break
      case 'ArrowLeft':
        active.value.col = Math.max(0, col - 1)
        break
      case 'ArrowRight':
        active.value.col = Math.min(cols - 1, col + 1)
        break
    }
  }

  const startEdit = () => {
    const { row, col } = active.value
    editing.value = { row, col }
  }

  const saveEdit = () => {
    editing.value = null
  }

  const cancelEdit = () => {
    if (!editing.value) return
    const { row, col } = editing.value
    data.value[row][col] = originalValue.value
    editing.value = null
  }

  const handleKeydown = (e: KeyboardEvent) => {
    
    if (editing.value) {
      if (e.key === 'Enter') {
        e.preventDefault()
        e.stopPropagation()
        saveEdit()
      } else if (e.key === 'Escape') {
        e.preventDefault()
        e.stopPropagation()
        cancelEdit()
      }
      return
    }

    if (e.key.startsWith('Arrow')) {
      e.preventDefault()
      move(e.key)
    } else if (e.key === 'Enter') {
      e.preventDefault()
      startEdit()
    }
  }

  return {
    active,
    editing,
    handleKeydown,
    startEdit,
    saveEdit,
    cancelEdit
  }
}