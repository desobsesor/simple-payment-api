import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('App')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) { }

  @Get()
  @ApiOperation({ summary: 'Get welcome message to start using the app', description: 'Returns a message indicating that the API service is running' })
  @ApiResponse({ status: 200, description: 'Welcome message successfully obtained' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  getAppStarted(): string {
    return this.appService.getAppStarted();
  }
}
