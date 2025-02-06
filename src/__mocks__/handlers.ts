import { http, HttpResponse } from 'msw';

import { Event } from '../types';
import { events } from './response/events.json' assert { type: 'json' };

// ! HARD
// ! 각 응답에 대한 MSW 핸들러를 작성해주세요. GET 요청은 이미 작성되어 있는 events json을 활용해주세요.
export const mockApiHandlers = [
  http.get('/api/events', () => {
    return HttpResponse.json({ events });
  }),

  http.post('/api/events', async ({ request }) => {
    const newEvent = (await request.json()) as Event;
    newEvent.id = String(events.length + 1);

    return HttpResponse.json(newEvent, { status: 201 });
  }),

  http.put('/api/events/:id', async ({ params, request }) => {
    const updatedEvent = (await request.json()) as Event;
    const eventIndex = events.findIndex((event) => event.id === params.id);

    if (eventIndex === -1) {
      return new HttpResponse(null, { status: 404 });
    }

    events[eventIndex] = updatedEvent;
    return HttpResponse.json({ event: updatedEvent });
  }),

  http.delete('/api/events/:id', ({ params }) => {
    const eventIndex = events.findIndex((event) => event.id === params.id);

    if (eventIndex === -1) {
      return new HttpResponse(null, { status: 404 });
    }

    events.splice(eventIndex, 1);
    return new HttpResponse(null, { status: 204 });
  }),
];
