import { App } from 'uWebSockets.js'

// Create a new instance of uWebSockets.js HTTP
const port = +process.env.PORT
const app = App()

app.get('/empty-request', (res, _req) => {
  res.end('Empty request')
}).listen(port, (token) => {
  if (token) {
    console.log(`Secret server running on http://localhost:${port}`)
  }
  else {
    console.log(`Failed to listen to port ${port}`)
  }
})
