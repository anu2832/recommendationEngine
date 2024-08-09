import * as readline from 'readline';

export const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});
export function question(query: string) {
    return new Promise(resolve => rl.question(query, resolve));
}
