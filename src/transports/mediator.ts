import type { Context, Hooks } from './types'

/* eslint-disable ts/no-unsafe-function-type */
export class Mediator {
  targetMethod: 'GET' | 'POST'
  targetPath: string
  run: Function
  hooks: Hooks
  context: Context

  private constructor(
    { method, path, run, hooks }:
    { method: 'GET' | 'POST', path: string, run: Function, hooks: Hooks },
  ) {
    this.targetMethod = method
    this.targetPath = path
    this.run = run
    this.hooks = hooks
    this.context = {}
  }

  async runHook(hookName: keyof Hooks, callbacks?: [Function]): Promise<void | Context> {
    const hook = this.hooks[hookName]

    if (hook) {
      if (hookName === 'onInit') {
        return await (hook as Function)(callbacks)
      }
      await (hook as Function)()
    }
  }

  static initialize(
    { method, path, hooks, run }:
     { method: 'GET' | 'POST', path: string, hooks: Hooks, run: Function },
  ) {
    return new Mediator({ method, path, run, hooks })
  }

  async handleRequest(
    path: string,
    method: string,
    payload: false | unknown,
  ): Promise<unknown> {
    if (this.targetMethod === method && this.targetPath === path) {
      await this.runHook('onRequest')

      const result = this.run(payload, this.context)

      await this.runHook('onFinish')

      return result
    }
    throw new Error('Endpoint not found')
  }
}
