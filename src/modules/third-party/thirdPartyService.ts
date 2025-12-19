import axios from 'axios';
import FormData from 'form-data';
import { isSuccessfulResponse } from '../../util';
import { Generate3DModel, ImageAnalyzeModel } from './thirdPartyModel';

const baseUrl = 'https://zipppier-henry-bananas.ngrok-free.dev';
const gen3DUrl = baseUrl + '/generate3d';
const analyzeUrl = baseUrl + '/analyze';
const captionUrl = baseUrl + '/caption';

export const ThirdPartyService = {
  async gen3DFromImage(file: Express.Multer.File): Promise<File> {
    const form = new FormData();
    form.append('image', file.buffer, {
      filename: file.originalname,
      contentType: file.mimetype,
    });
    const res = await axios.post(gen3DUrl, form, {
      headers: form.getHeaders(),
    });

    if (res && isSuccessfulResponse(res)) {
      const data: File = res.data;
      return Promise.resolve(data);
    }
    return Promise.reject('Failed to generate 3D model');
  },

  async isValidImage(file: Express.Multer.File): Promise<boolean> {
    const form = new FormData();
    form.append('image', file.buffer, {
      filename: file.originalname,
      contentType: file.mimetype,
    });

    const analyze = await axios.post(analyzeUrl, form, {
      headers: form.getHeaders(),
    });

    if (analyze && isSuccessfulResponse(analyze)) {
      const data: ImageAnalyzeModel = analyze.data;
      if (data.is_nsfw) return Promise.resolve(false);
    }
    return Promise.resolve(true);
  },
};
