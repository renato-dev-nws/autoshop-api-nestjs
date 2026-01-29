import { Injectable, HttpException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { AxiosResponse } from 'axios';

@Injectable()
export class FipeService {
  private readonly baseUrl = process.env.FIPE_BASE_URL || 'https://parallelum.com.br/fipe/api/v1';

  constructor(
    private readonly httpService: HttpService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async getMarcas(tipo: string): Promise<any> {
    const cacheKey = `fipe:${tipo}:marcas`;
    const cached = await this.cacheManager.get(cacheKey);

    if (cached) {
      return cached;
    }

    try {
      const response = await firstValueFrom<AxiosResponse>(
        this.httpService.get(`${this.baseUrl}/${tipo}/marcas`),
      );

      // Cache por 24 horas (86400 segundos)
      await this.cacheManager.set(cacheKey, response.data, 86400000);

      return response.data;
    } catch (error) {
      throw new HttpException(
        error.response?.data || 'Erro ao buscar marcas FIPE',
        error.response?.status || 500,
      );
    }
  }

  async getModelos(tipo: string, marca: string): Promise<any> {
    const cacheKey = `fipe:${tipo}:${marca}:modelos`;
    const cached = await this.cacheManager.get(cacheKey);

    if (cached) {
      return cached;
    }

    try {
      const response = await firstValueFrom<AxiosResponse>(
        this.httpService.get(`${this.baseUrl}/${tipo}/marcas/${marca}/modelos`),
      );

      await this.cacheManager.set(cacheKey, response.data, 86400000);

      return response.data;
    } catch (error) {
      throw new HttpException(
        error.response?.data || 'Erro ao buscar modelos FIPE',
        error.response?.status || 500,
      );
    }
  }

  async getAnos(tipo: string, marca: string, modelo: string): Promise<any> {
    const cacheKey = `fipe:${tipo}:${marca}:${modelo}:anos`;
    const cached = await this.cacheManager.get(cacheKey);

    if (cached) {
      return cached;
    }

    try {
      const response = await firstValueFrom<AxiosResponse>(
        this.httpService.get(`${this.baseUrl}/${tipo}/marcas/${marca}/modelos/${modelo}/anos`),
      );

      await this.cacheManager.set(cacheKey, response.data, 86400000);

      return response.data;
    } catch (error) {
      throw new HttpException(
        error.response?.data || 'Erro ao buscar anos FIPE',
        error.response?.status || 500,
      );
    }
  }

  async getValor(tipo: string, marca: string, modelo: string, ano: string): Promise<any> {
    const cacheKey = `fipe:${tipo}:${marca}:${modelo}:${ano}`;
    const cached = await this.cacheManager.get(cacheKey);

    if (cached) {
      return cached;
    }

    try {
      const response = await firstValueFrom<AxiosResponse>(
        this.httpService.get(
          `${this.baseUrl}/${tipo}/marcas/${marca}/modelos/${modelo}/anos/${ano}`,
        ),
      );

      await this.cacheManager.set(cacheKey, response.data, 86400000);

      return response.data;
    } catch (error) {
      throw new HttpException(
        error.response?.data || 'Erro ao buscar valor FIPE',
        error.response?.status || 500,
      );
    }
  }
}
