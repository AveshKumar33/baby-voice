import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    console.log('Avesh Hello World :::');
    return 'Avesh Hello World!';
  }

  processAudio(file: Express.Multer.File) {
    console.log('Audio received:', file.originalname);
    console.log('Size:', file.size);
    /** Later you can save to Mongo/GridFS here */
    return {
      message: 'Audio uploaded successfully',
      fileName: file.originalname,
      size: file.size
    };
  }
}
