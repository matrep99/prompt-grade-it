import express from 'express';
import { z } from 'zod';
import { requireAuth, requireOwnership } from '../middleware/auth.js';

const router = express.Router();

// Validation schemas
const createTestSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional()
});

// POST /api/tests - Create new test
router.post('/', requireAuth('DOCENTE'), async (req, res) => {
  try {
    const { title, description } = createTestSchema.parse(req.body);
    
    const test = await req.prisma.test.create({
      data: {
        title: title || 'Nuova verifica',
        description: description || '',
        status: 'DRAFT',
        ownerId: req.user!.userId,
        settings: {}
      }
    });

    // Create demo question
    await req.prisma.question.create({
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

    res.status(201).json({ id: test.id });
  } catch (error) {
    console.error('Create test error:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Dati non validi',
          details: error.errors
        }
      });
    }

    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Errore durante la creazione della verifica'
      }
    });
  }
});

// GET /api/tests/:id - Get test details
router.get('/:id', requireAuth(), requireOwnership, async (req, res) => {
  try {
    const test = await req.prisma.test.findUnique({
      where: { id: req.params.id },
      select: {
        id: true,
        title: true,
        description: true,
        status: true,
        settings: true,
        createdAt: true,
        updatedAt: true
      }
    });

    if (!test) {
      return res.status(404).json({
        error: {
          code: 'TEST_NOT_FOUND',
          message: 'Verifica non trovata'
        }
      });
    }

    res.json(test);
  } catch (error) {
    console.error('Get test error:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Errore durante il caricamento della verifica'
      }
    });
  }
});

// GET /api/tests/:id/questions - Get test questions
router.get('/:id/questions', requireAuth(), requireOwnership, async (req, res) => {
  try {
    const questions = await req.prisma.question.findMany({
      where: { testId: req.params.id },
      select: {
        id: true,
        questionIndex: true,
        type: true,
        prompt: true,
        options: true,
        correctAnswer: true,
        points: true,
        rubric: true
      },
      orderBy: { questionIndex: 'asc' }
    });

    res.json(questions);
  } catch (error) {
    console.error('Get questions error:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Errore durante il caricamento delle domande'
      }
    });
  }
});

export default router;