import { Controller, Get } from '@nestjs/common';
import { EventsService } from '../events/events.service';

@Controller('stats')
export class StatsController {
  constructor(private readonly eventsService: EventsService) {}

  @Get()
  async getDashboardStats() {
    return await this.eventsService.getStats();
  }
}
