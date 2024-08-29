export function heavyNonBlockingTask(): Promise<{ result: string }> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ result: 'Heavy non-blocking task completed' })
    }, 1000)
  })
}
