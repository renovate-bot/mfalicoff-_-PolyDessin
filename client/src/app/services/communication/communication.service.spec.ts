import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { DrawingMesssage } from '@common/communication/drawing';
import { CommunicationService } from './communication.service';

// tslint:disable: no-empty
// tslint:disable: no-string-literal
describe('DrawingMessageService', () => {
    let httpMock: HttpTestingController;
    let service: CommunicationService;
    let baseUrl: string;
    let basicPostMessage: DrawingMesssage;
    let id: string;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
        });
        service = TestBed.inject(CommunicationService);
        httpMock = TestBed.inject(HttpTestingController);

        baseUrl = service['BASE_URL'];
    });

    beforeEach(() => {
        basicPostMessage = {
            title: 'test',
            body: {
                name: 'test',
                tags: ['tag1', 'tag2'],
                url: 'dataUrl',
            },
        };
        id = '123456789';
    });

    afterEach(() => {
        httpMock.verify();
    });

    it('1. should be created', () => {
        expect(service).toBeTruthy();
    });

    it('2. should correctly call POST when calling postImage', () => {
        service.postImage(basicPostMessage).subscribe(() => {}, fail);

        const req = httpMock.expectOne(baseUrl + '/send');
        expect(req.request.method).toBe('POST');
        req.flush(basicPostMessage);
    });

    it('3. should correctly call DELETE when calling deleteImage', () => {
        service.deleteImage(id).subscribe(() => {}, fail);
        const req = httpMock.expectOne(baseUrl + '/' + id);
        expect(req.request.method).toBe('DELETE');
        req.flush(id);
    });

    it('4. should correctly call GET when calling getImage', () => {
        service.getImages().subscribe(() => {}, fail);
        const req = httpMock.expectOne(baseUrl + '/getAllImages');
        expect(req.request.method).toBe('GET');
    });

    it('5. should correctly call Post when calling postToImgur', () => {
        const data = new FormData();
        service.postToImgur(data).subscribe(() => {}, fail);
        const req = httpMock.expectOne('https://api.imgur.com/3/image');
        expect(req.request.method).toBe('POST');
        req.flush(data);
    });
});
