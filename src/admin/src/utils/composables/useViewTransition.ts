export default function useViewTransition(callback: () => void) {
  function startViewTransition() {
    if (!('startViewTransition' in document) || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      callback()
      return
    }
    return (document as any).startViewTransition(async () => {
      await Promise.resolve(callback())
    })
  }

  return {
    startViewTransition,
  }
}
