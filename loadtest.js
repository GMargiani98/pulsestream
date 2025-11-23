import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  // The Attack Plan
  stages: [
    { duration: '10s', target: 500 }, // Ramp up to 500 users
    { duration: '30s', target: 500 }, // Stay at 500 users (Hammer time)
    { duration: '5s', target: 0 }, // Cool down
  ],
  thresholds: {
    http_req_duration: ['p(95)<200'], // 95% of requests should be faster than 200ms
  },
};

export default function () {
  const payload = JSON.stringify({
    type: 'click',
    payload: {
      page: '/home',
      user_id: Math.floor(Math.random() * 10000),
    },
  });

  const params = {
    headers: {
      'Content-Type': 'application/json',
    },
  };

  // Hit the endpoint
  const res = http.post('http://localhost:3000/events', payload, params);

  // Verify response was 201 Created
  check(res, {
    'status is 201': (r) => r.status === 201,
  });

  sleep(0.1); // Wait 100ms between clicks (simulating human behavior slightly)
}
