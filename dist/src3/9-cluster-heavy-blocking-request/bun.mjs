import cluster from 'node:cluster';
// import { cpus } from 'node:os'
import { run as runBun } from '../4-heavy-blocking-request/bun.mjs';
const PORT = process.env.PORT || 3000;
if (cluster.isPrimary) {
    // const numCPUs = cpus().length
    for (let i = 0; i < 3; i++) {
        cluster.fork();
    }
    cluster.on('exit', (worker) => {
        console.log(`Worker ${worker.process.pid} died`);
    });
}
else {
    runBun(PORT);
}
