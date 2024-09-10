export function heavyBlockingTask() {
    let sum = 0;
    for (let i = 0; i < 1e8; i++) {
        sum += i;
    }
    return sum;
}
export function heavyNonBlockingTask(ms = 100) {
    return new Promise(resolve => setTimeout(() => resolve(ms), ms));
}
