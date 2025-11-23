import { Body, Controller, Post, HttpCode, HttpStatus } from '@nestjs/common';
import { EventsService } from './events.service';

// temp then goes to dto folder
class CreateEventDto {
  type: string;
  payload: Record<string, any>;
}

@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() body: CreateEventDto) {
    // SWITCHED TO BUFFERED MODE
    return await this.eventsService.createEventBuffered(
      body.type,
      body.payload,
    );
  }
}
