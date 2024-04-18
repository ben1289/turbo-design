import { ref, watch } from 'vue'
import { ElLoading } from 'element-plus'
import type { Ref } from 'vue'

export function useElLoading(loading: Ref, dom: HTMLElement) {
  const loadingInstance = ref<any>(null)
  watch(loading, (isLoading) => {
    if (isLoading) {
      loadingInstance.value = ElLoading.service({ target: dom })
    } else {
      loadingInstance.value?.close()
    }
  })
}
