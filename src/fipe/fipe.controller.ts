import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { FipeService } from './fipe.service';

@Controller('fipe')
@ApiTags('FIPE')
export class FipeController {
  constructor(private readonly fipeService: FipeService) {}

  @Get(':tipo/marcas')
  @ApiOperation({ summary: 'Listar marcas FIPE' })
  @ApiParam({
    name: 'tipo',
    enum: ['carros', 'motos', 'caminhoes'],
    description: 'Tipo de veículo',
  })
  @ApiResponse({ status: 200, description: 'Lista de marcas FIPE' })
  @ApiResponse({ status: 500, description: 'Erro ao buscar dados FIPE' })
  async getMarcas(@Param('tipo') tipo: string) {
    return this.fipeService.getMarcas(tipo);
  }

  @Get(':tipo/marcas/:marca/modelos')
  @ApiOperation({ summary: 'Listar modelos FIPE de uma marca' })
  @ApiParam({ name: 'tipo', enum: ['carros', 'motos', 'caminhoes'] })
  @ApiParam({ name: 'marca', description: 'Código da marca FIPE' })
  @ApiResponse({ status: 200, description: 'Lista de modelos FIPE' })
  async getModelos(@Param('tipo') tipo: string, @Param('marca') marca: string) {
    return this.fipeService.getModelos(tipo, marca);
  }

  @Get(':tipo/marcas/:marca/modelos/:modelo/anos')
  @ApiOperation({ summary: 'Listar anos disponíveis de um modelo FIPE' })
  @ApiParam({ name: 'tipo', enum: ['carros', 'motos', 'caminhoes'] })
  @ApiParam({ name: 'marca', description: 'Código da marca FIPE' })
  @ApiParam({ name: 'modelo', description: 'Código do modelo FIPE' })
  @ApiResponse({ status: 200, description: 'Lista de anos disponíveis' })
  async getAnos(
    @Param('tipo') tipo: string,
    @Param('marca') marca: string,
    @Param('modelo') modelo: string,
  ) {
    return this.fipeService.getAnos(tipo, marca, modelo);
  }

  @Get(':tipo/marcas/:marca/modelos/:modelo/anos/:ano')
  @ApiOperation({ summary: 'Obter detalhes e valor FIPE' })
  @ApiParam({ name: 'tipo', enum: ['carros', 'motos', 'caminhoes'] })
  @ApiParam({ name: 'marca', description: 'Código da marca FIPE' })
  @ApiParam({ name: 'modelo', description: 'Código do modelo FIPE' })
  @ApiParam({ name: 'ano', description: 'Ano do veículo (ex: 2024-1)' })
  @ApiResponse({
    status: 200,
    description: 'Detalhes completos e valor FIPE',
    schema: {
      example: {
        Valor: 'R$ 58.000,00',
        Marca: 'Fiat',
        Modelo: 'Palio 1.0 Fire',
        AnoModelo: 2024,
        Combustivel: 'Gasolina',
        CodigoFipe: '001340-2',
        MesReferencia: 'janeiro de 2024',
      },
    },
  })
  async getValor(
    @Param('tipo') tipo: string,
    @Param('marca') marca: string,
    @Param('modelo') modelo: string,
    @Param('ano') ano: string,
  ) {
    return this.fipeService.getValor(tipo, marca, modelo, ano);
  }
}
