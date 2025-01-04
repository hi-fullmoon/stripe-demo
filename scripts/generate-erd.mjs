import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

async function generateERD() {
  try {
    console.log('Generating ERD...');
    await execAsync('PUPPETEER_SKIP_DOWNLOAD=true npx prisma generate');
    console.log('ERD generated successfully at docs/erd.svg');
  } catch (error) {
    console.error('Error generating ERD:', error);
    process.exit(1);
  }
}

generateERD();
