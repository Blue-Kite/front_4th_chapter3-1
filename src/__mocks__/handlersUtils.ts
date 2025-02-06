import { http, HttpResponse } from 'msw';

import { server } from '../setupTests';
import { Event } from '../types';

// ! Hard
// ! 이벤트는 생성, 수정 되면 fetch를 다시 해 상태를 업데이트 합니다. 이를 위한 제어가 필요할 것 같은데요. 어떻게 작성해야 테스트가 병렬로 돌아도 안정적이게 동작할까요?
// ! 아래 이름을 사용하지 않아도 되니, 독립적이게 테스트를 구동할 수 있는 방법을 찾아보세요. 그리고 이 로직을 PR에 설명해주세요.
export const setupMockHandlerCreation = (initEvents = [] as Event[]) => {
  const events: Event[] = [...initEvents];

  server.use(
    http.get('/api/events', () => {
      return HttpResponse.json({ events });
    }),

    http.post('/api/events', async ({ request }) => {
      const data = (await request.json()) as Event;
      const newEvent = {
        ...data,
        id: String(events.length + 1),
      };
      events.push(newEvent);
      return HttpResponse.json({ event: newEvent }, { status: 201 });
    })
  );
};

export const setupMockHandlerUpdating = (initEvents: Event[] = []) => {
  const events: Event[] = [...initEvents];

  server.use(
    http.get('/api/events', () => {
      return HttpResponse.json({ events });
    }),

    http.put('/api/events/:id', async ({ params, request }) => {
      const updatedEvent = (await request.json()) as Event;
      const eventIndex = events.findIndex((event) => event.id === params.id);

      if (eventIndex === -1) return new HttpResponse(null, { status: 404 });

      events[eventIndex] = updatedEvent;
      return HttpResponse.json({ event: updatedEvent });
    })
  );

  return { events };
};

export const setupMockHandlerDeletion = (initEvents: Event[] = []) => {
  const events: Event[] = [...initEvents];

  server.use(
    http.get('/api/events', () => {
      return HttpResponse.json({ events });
    }),

    http.delete('/api/events/:id', ({ params }) => {
      const index = events.findIndex((event) => event.id === params.id);
      events.splice(index, 1);
      return new HttpResponse(null, { status: 204 });
    })
  );

  return { events };
};
