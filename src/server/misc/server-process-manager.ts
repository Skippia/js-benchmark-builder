import { type ChildProcessWithoutNullStreams, spawn } from 'node:child_process'
import process from 'node:process'
import type { THostEnvironment, TTransportTypeUnion, TUsecaseTypeUnion } from './types'

export class ServerProcessManager {
  private readonly hostEnvironment: THostEnvironment
  childProcess: ChildProcessWithoutNullStreams | null = null

  constructor(
    private readonly transport: TTransportTypeUnion,
    private readonly usecase: TUsecaseTypeUnion,
    private readonly cores: number,
  ) {
    this.hostEnvironment = transport === 'bun' ? 'bun' : 'node'
  }

  start(): Promise<ChildProcessWithoutNullStreams> {
    if (this.childProcess) {
      return Promise.resolve(this.childProcess)
    }

    return new Promise((resolve) => {
      this.childProcess = spawn(this.hostEnvironment, [
        './dist/server/main.js',
        '-t',
        this.transport,
        '-u',
        this.usecase,
        '-cores',
        String(this.cores),
      ], {
        detached: true,
      })

      this.childProcess.stdout.on('data', (data) => {
        const stdoutInfo = data.toString()

        if (!stdoutInfo.startsWith('[Hook]')) console.log(stdoutInfo)

        if (stdoutInfo.includes('server running on')) {
          resolve(this.childProcess!)
        }
      })

      this.childProcess.stderr.on('data', (data) => {
        console.error('stderr', data.toString())
      })

      this.childProcess.on('close', (code) => {
        console.log(`Child process exited with code ${code}`)
        this.childProcess = null
      })
    })
  }

  /**
   * @description Carefully stops the process
   */
  stop(signal: Parameters<typeof process.on>[0] & NodeJS.Signals) {
    if (this.isRunning) {
      this.childProcess!.on('close', (_code) => {
        this.childProcess = null
      })

      console.log(`Kill child process with pid=${this.childProcess!.pid}`)
      // Kill this process
      process.kill(this.childProcess!.pid!, signal)
    }
    else {
      console.log('No child process to stop.')
    }
  }

  on(...args: Parameters<typeof process.on>) {
    this.childProcess?.on(args[0].toString(), args[1])
  }

  get isRunning() {
    return !!(this.childProcess?.pid && !this.childProcess.killed)
  }
}
