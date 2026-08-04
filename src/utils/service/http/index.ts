import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs'; // To convert observable to promise

@Injectable()
export class HttpClientService {
  constructor(private readonly _http: HttpService) {}

  async get<T>(url: string, params?: any, headers?: any): Promise<T> {
    try {
      const response = await firstValueFrom(
        this._http.get(url, { params, headers }),
      );
      return response.data;
    } catch (error) {
      console.error('Error during GET request:', error);
      throw new InternalServerErrorException(error);
    }
  }

  async post<T>(url: string, data: any, headers?: any): Promise<T> {
    try {
      const response = await firstValueFrom(
        this._http.post(url, data, { headers }),
      );
      return response.data;
    } catch (error) {
      console.error('Error during POST request:', error);
      throw new InternalServerErrorException(error);
    }
  }

  async patch<T>(url: string, data: any, headers?: any): Promise<T> {
    try {
      const response = await firstValueFrom(
        this._http.patch(url, data, { headers }),
      );
      return response.data;
    } catch (error) {
      console.error('Error during PUT request:', error);
      throw new InternalServerErrorException(error);
    }
  }

  async put<T>(url: string, data: any, headers?: any): Promise<T> {
    try {
      const response = await firstValueFrom(
        this._http.put(url, data, { headers }),
      );
      return response.data;
    } catch (error) {
      console.error('Error during PUT request:', error);
      throw new InternalServerErrorException(error);
    }
  }

  async delete<T>(url: string, headers?: any): Promise<T> {
    try {
      const response = await firstValueFrom(
        this._http.delete(url, { headers }),
      );
      return response.data;
    } catch (error) {
      console.error('Error during DELETE request:', error);
      throw new InternalServerErrorException(error);
    }
  }
}
