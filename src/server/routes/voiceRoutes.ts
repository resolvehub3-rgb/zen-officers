import { Router, Response } from 'express';
import { z } from 'zod';
import { authenticate, AuthRequest } from '../middleware/auth.ts';
import { transcribeAudio } from '../services/geminiSpeech.ts';

export const voiceRouter = Router();

const transcribeSchema = z.object({
  audioBase64: z.string().min(10),
  mimeType: z.string().optional(),
});

// POST /api/v1/voice/transcribe
voiceRouter.post('/transcribe', authenticate, async (req: AuthRequest, res: Response) => {
  const parse = transcribeSchema.safeParse(req.body);
  if (!parse.success) {
    return res.status(400).json({ success: false, errors: parse.error.format() });
  }

  try {
    const text = await transcribeAudio(parse.data.audioBase64, parse.data.mimeType || 'audio/webm');
    return res.json({
      success: true,
      data: {
        transcription: text,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      message: 'Failed to transcribe audio note: ' + err.message,
    });
  }
});
