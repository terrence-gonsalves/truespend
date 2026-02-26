'use server';

import { readFile } from 'fs/promises';
import { join } from 'path';

export async function getAppVersion() {
    try {
        const packageJsonPath = join(process.cwd(), 'package.json');
        const packageJsonContent = await readFile(packageJsonPath, 'utf-8');
        const packageJson = JSON.parse(packageJsonContent);
        
        return packageJson.version || '1.0.0';
    } catch (error) {
        console.error('Failed to read package.json:', error);

        return '1.0.0';
    } 
}