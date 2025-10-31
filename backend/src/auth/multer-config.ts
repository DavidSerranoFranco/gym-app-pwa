import { diskStorage } from 'multer';
import { extname, join } from 'path';

export const multerStorageConfig = diskStorage({
  // 1. Dónde guardar los archivos
  destination: (req, file, cb) => {
    // __dirname se refiere al directorio actual (dist/auth)
    // Se navega hacia atrás hasta la raíz y luego a la carpeta 'uploads'
    const uploadPath = join(__dirname, '..', '..', 'uploads');
    cb(null, uploadPath);
  },
  
  // 2. Cómo nombrar los archivos
  filename: (req, file, cb) => {
    // Para evitar colisiones, se usa el ID del usuario (adjunto en 'req.user')
    // y se le añade la fecha actual + la extensión original.
    const user = (req as any).user;
    const userId = user ? user.id : 'temp';
    const randomName = `${userId}-${Date.now()}${extname(file.originalname)}`;
    cb(null, randomName);
  },
});

// 3. Un filtro para aceptar solo imágenes
export const imageFileFilter = (req, file, cb) => {
  if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
    return cb(new Error('¡Solo se permiten archivos de imagen!'), false);
  }
  cb(null, true);
};