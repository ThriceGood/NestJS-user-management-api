import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import * as path from 'path';
import * as sharp from 'sharp';
import { profile_image_size } from '../../constants';

@Injectable()
export class ProfileImagePipe implements PipeTransform<Express.Multer.File, Promise<string>> {

  private readonly allowMimeTypes = ['image/png', 'image/jpg', 'image/jpeg', 'image/webp'];

  async transform(image: Express.Multer.File): Promise<string> {

    if (image === undefined) {
      throw new BadRequestException('Image is missing');
    }

    if (!this.allowMimeTypes.includes(image.mimetype)) {
      throw new BadRequestException(`Only file types of ${this.allowMimeTypes} allowed`);
    }

    const originalName = path.parse(image.originalname).name;
    const fileName = `${originalName}-${Date.now()}.webp`;

    await sharp(image.buffer)
      .resize(+profile_image_size)
      .webp()
      .toFile(path.join('uploads', fileName));

    return fileName;
  }
}
