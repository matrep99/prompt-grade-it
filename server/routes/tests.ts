import express from 'express';
import { z } from 'zod';
import { requireAuth, requireOwnership } from '../middleware/auth.js';
import { prisma } from '../../src/lib/prisma.js';

const router = express.Router();

// Validation schemas
const CreateTestSchema = z.object({
  title: z.string().min(1).default('Nuova verifica'),
  description: z.string().optional()
});

const isDev = process.env.NODE_ENV !== 'production';

// POST /api/tests - Create new test
router.post('/', requireAuth('DOCENTE', { allowDevBypass: true }), async (req, res) => {
  try {
    const parse = CreateTestSchema.safeParse(req.body ?? {});
    if (!parse.success)
    {
      return res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: 'Dati non validi' } });
    }

    const user = req.user;
    if (!user && !isDev)
    {
      return res.status(401).json({ error: { code: 'UNAUTHENTICATED', message: 'Accesso non autorizzato' } });
    }

    // ownerId in dev: usa docente demo
    let ownerId = user?.userId;
    if (!ownerId && isDev)
    {
      const demo = await prisma.user.findFirst({ where: { role: 'DOCENTE' } });
      if (!demo)
      {
        return res.status(500).json({ error: { code: 'NO_DEMO_TEACHER', message: 'Docente demo assente (eseguire npm run db:seed)' } });
      }
      ownerId = demo.id;
    }

    const { title, description } = parse.data;

    const result = await prisma.$transaction(async (tx) =>
    {
      const test = await tx.test.create({
        data: {
          title,
          description: description ?? '',
          status: 'DRAFT',
          ownerId: ownerId!,
          settings: {}
        },
        select: { id: true }
      });

      await tx.question.create({
        data: {
          testId: test.id,
          questionIndex: 0,
          type: 'MCQ',
          prompt: 'Domanda di esempio: Qual è la capitale d\'Italia?',
          options: ['Roma', 'Milano', 'Torino', 'Napoli'],
          correctAnswer: { selected: 0 },
          points: 1
        }
      });

      return test;
    });

    return res.status(201).json({ id: result.id });
  } catch (err: any) {
    // Mappa errori Prisma comuni
    const pcode = err?.code;
    if (pcode === 'P2002')
    {
      return res.status(409).json({ error: { code: 'CONFLICT', message: 'Conflitto dati' } });
    }
    if (pcode === 'P2003')
    {
      return res.status(400).json({ error: { code: 'FK_CONSTRAINT', message: 'Relazione non valida (owner mancante?)' } });
    }

    console.error('POST /api/tests error:', err);
    return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Errore interno durante la creazione della verifica' } });
  }
});

// GET /api/tests/:id - Get test details
router.get('/:id', requireAuth(), async (req, res) => {
  try {
    const { id } = req.params;
    const user = req.user;

    const test = await prisma.test.findFirst({
      where: { id, ...(user?.role === 'ADMIN' ? {} : { ownerId: user?.userId }) },
      select: { id: true, title: true, description: true, status: true, createdAt: true, updatedAt: true }
    });

    if (!test)
    {
      return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Verifica non trovata' } });
    }

    return res.json(test);
  } catch (e) {
    console.error('GET /api/tests/:id error:', e);
    return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Errore nel caricamento' } });
  }
});

// GET /api/tests/:id/questions - Get test questions
router.get('/:id/questions', requireAuth(), async (req, res) => {
  try {
    const { id } = req.params;
    const user = req.user;

    const test = await prisma.test.findFirst({
      where: { id, ...(user?.role === 'ADMIN' ? {} : { ownerId: user?.userId }) },
      select: { id: true }
    });
    if (!test)
    {
      return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Verifica non trovata' } });
    }

    const questions = await prisma.question.findMany({
      where: { testId: id },
      orderBy: { questionIndex: 'asc' },
      select: { id: true, questionIndex: true, type: true, prompt: true, options: true, correctAnswer: true, points: true }
    });

    return res.json(questions);
  } catch (e) {
    console.error('GET /api/tests/:id/questions error:', e);
    return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Errore nel caricamento domande' } });
  }
});

export default router;