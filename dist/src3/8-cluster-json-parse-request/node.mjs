import cluster from 'node:cluster';
// import { cpus } from 'node:os'
import { runNode } from '../2-json-parse-request/index.mjs';
const PORT = process.env.PORT || 3000;
if (cluster.isPrimary) {
    // Fork workers based on the number of cores available.
    // const numCPUs = cpus().length
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
