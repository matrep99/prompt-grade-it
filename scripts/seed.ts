import { prisma } from '../src/lib/prisma.js';
import { randomBytes } from 'crypto';

async function main()
{
  const email = 'docente@example.com';
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing)
  {
    console.log('Docente demo già presente:', existing.id);
    return;
  }
  const user = await prisma.user.create({
    data: {
      email,
      passwordHash: randomBytes(32).toString('hex'),
      role: 'DOCENTE'
    }
  });
  console.log('Creato docente demo:', user.id);
}

main().then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1); });