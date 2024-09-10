import Fastify from 'fastify';
export function run(port) {
    const fastify = Fastify({
        logger: false,
    });
    fastify.get('/json-parse-request', async (request, reply) => {
        const data = JSON.parse('{"hello":"world","music":true,"number":42,"date":"2024-09-06T20:41:07.905Z"}');
        reply
            .send(data);
    });
    fastify.listen({ port }, (err, address) => {
        if (err) {
            console.error(err);
            process.exit(1);
        }
        console.log(`Fastify server running on ${address}`);
    });
}
