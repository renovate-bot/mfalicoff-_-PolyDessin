import { HttpResponse } from '@app/classes/http-response';

describe('Response', () => {
    it('1. should instantiate object', () => {
        const newResponse = new HttpResponse(true, 'test');
        expect(newResponse.isSuccess).toBe(true);
        expect(newResponse.message).toBe('test');
    });
});
