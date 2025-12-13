import axios from 'axios';
import FormData from 'form-data';
import { isSuccessfulResponse } from '../../util';
import { ImageAnalyzeModel } from '../image/imageModel';
import { Generate3DModel } from './thirdPartyModel';

const baseUrl = 'https://api.thirdparty.com';
const gen3DUrl = baseUrl + '/generate-3d';
const analyzeUrl = baseUrl + '/analyze';
const captionUrl = baseUrl + '/caption';

export const ThirdPartyService = {
  async gen3DFromImage(file: Express.Multer.File): Promise<File> {
    const form = new FormData();
    form.append('image', file.buffer, {
      filename: file.originalname,
      contentType: file.mimetype,
    });
    const res = await axios.post(analyzeUrl, form, {
      headers: form.getHeaders(),
    });

    if (res && isSuccessfulResponse(res)) {
      const data: Generate3DModel = res.data;
      return Promise.resolve(data.file);
    }
    return Promise.reject('Failed to generate 3D model');
  },
  async analyzeImage(file: Express.Multer.File): Promise<any> {
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
      if (data.is_nsfw)
        throw { status: 422, message: 'Media file is not approved!' };
    }
    return Promise.resolve({});
  },
};
