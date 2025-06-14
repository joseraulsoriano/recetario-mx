import { NextResponse } from 'next/server';
import formidable from 'formidable';
import fs from 'fs';
import path from 'path';
import type { IncomingForm, Fields, Files, File } from 'formidable';

export const config = {
  api: {
    bodyParser: false,
  },
};

export async function POST(req: Request) {
  const form = formidable({ multiples: false, uploadDir: './public/uploads', keepExtensions: true });
  return new Promise((resolve, reject) => {
    form.parse(req as any, (err: any, fields: Fields, files: Files) => {
      if (err) {
        reject(NextResponse.json({ error: 'Error al subir archivo' }, { status: 500 }));
        return;
      }
      const file = files.image as File;
      if (!file) {
        resolve(NextResponse.json({ error: 'No se envió archivo' }, { status: 400 }));
        return;
      }
      // Guardar la ruta relativa
      const filePath = `/uploads/${path.basename(file.filepath)}`;
      resolve(NextResponse.json({ imagePath: filePath }));
    });
  });
} 