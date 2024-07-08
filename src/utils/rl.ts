import * as readline from 'readline';
import util from 'util';

//Creates a readline interface for reading input
export const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});
export function question(query:string) { return new Promise((resolve)=> rl.question(query,resolve));}
