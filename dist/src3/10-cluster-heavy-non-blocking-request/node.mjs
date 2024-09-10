import cluster from 'node:cluster';
import { cpus } from 'node:os';
import { runNode } from '../4-heavy-non-blocking-request/index.mjs';
const PORT = +process.env.PORT;
if (cluster.isPrimary) {
    const numCPUs = cpus().length;
    for (let i = 0; i < 4; i++) {
        cluster.fork();
    }
    cluster.on('exit', (worker) => {
        console.log(`Worker ${worker.process.pid} died`);
    });
}
else {
    runNode(PORT);
}
