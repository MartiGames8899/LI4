import { execSync } from 'child_process';

console.log('Setting up database...');

try {
  console.log('Running Prisma db push...');
  execSync('npx prisma db push --skip-generate', { stdio: 'inherit' });

  console.log('Generating Prisma client...');
  execSync('npx prisma generate', { stdio: 'inherit' });

  console.log('Running seed...');
  execSync('npx prisma db seed', { stdio: 'inherit' });

  console.log('✅ Database setup completed!');
} catch (error) {
  console.error('❌ Error setting up database:', error.message);
  process.exit(1);
}
