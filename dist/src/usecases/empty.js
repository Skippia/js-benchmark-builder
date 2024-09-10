export const hooks = {
    async onInit(callbacks) {
        const context = {};
        console.log('[Hook][onInit]: Initializing context...');
        callbacks?.forEach(c => c());
        return context;
    },
    // async onRequest(_req: Request): Promise<void> {
    //   console.log('[Hook][onRequest]: Request received...')
    // },
    // async onFinish(_res: Response): Promise<void> {
    //   console.log('[Hook][onFinish]: Finishing response...')
    // },
    async onClose() {
        console.log('[Hook][onClose]: Close server...');
    },
};
export async function run(_payload, _context) {
    try {
        return 'Empty data';
    }
    catch (error) {
        return { error: 'Database query failed', details: error.message };
    }
}
