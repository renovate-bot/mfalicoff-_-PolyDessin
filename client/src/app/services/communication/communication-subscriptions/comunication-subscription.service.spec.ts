import { HttpErrorResponse } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { CommunicationService } from '@app/services/communication/communication.service';
import { DrawingMesssage } from '@common/communication/drawing';
import { of, throwError } from 'rxjs';
import { CommunicationSubscriptionService } from './communication-subscription.service';

describe('CommunicationSubscriptionService', () => {
    let service: CommunicationSubscriptionService;
    let communicationServiceSpy: jasmine.SpyObj<CommunicationService>;

    beforeEach(() => {
        communicationServiceSpy = jasmine.createSpyObj('CommunicationService', ['postImage', 'getImages', 'deleteImage', 'postToImgur']);
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [{ provide: CommunicationService, useValue: communicationServiceSpy }],
        });
        service = TestBed.inject(CommunicationSubscriptionService);
        communicationServiceSpy = TestBed.inject(CommunicationService) as jasmine.SpyObj<CommunicationService>;
        communicationServiceSpy.postImage.and.returnValue(of(''));
        communicationServiceSpy.deleteImage.and.returnValue(of(''));
        communicationServiceSpy.getImages.and.returnValue(of([]));
        communicationServiceSpy.postToImgur.and.returnValue(
            of(
                '{"data":{"id":"K3YHtKl","title":null,"description":null,"datetime":1616598851,"type":"image\\/png","animated":false,"width":511,"height":484,"size":14913,"views":0,"bandwidth":0,"vote":null,"favorite":false,"nsfw":null,"section":null,"account_url":null,"account_id":0,"is_ad":false,"in_most_viral":false,"has_sound":false,"tags":[],"ad_type":0,"ad_url":"","edited":"0","in_gallery":false,"deletehash":"NbUHtwG7yeYQEFX","name":"","link":"https:\\/\\/i.imgur.com\\/K3YHtKl.png"},"success":true,"status":200}',
            ),
        );
    });

    it('1. should be created', () => {
        expect(service).toBeTruthy();
    });

    it('2. calling postImage should return new observer', () => {
        const drawingMessage: DrawingMesssage = {
            title: '',
            body: {
                name: 'test',
                tags: ['test', 'test1'],
                url: '',
            },
        };
        service.postImage(drawingMessage);
        expect(communicationServiceSpy.postImage).toHaveBeenCalled();
    });

    it('3. calling postImage should return new observer with error message 0', () => {
        communicationServiceSpy.postImage.and.callFake(() => {
            return throwError({ status: 0, error: 'errorMessage' } as HttpErrorResponse);
        });

        const drawingMessage: DrawingMesssage = {
            title: '',
            body: {
                name: 'test',
                tags: ['test', 'test1'],
                url: '',
            },
        };
        service.postImage(drawingMessage);
        expect(communicationServiceSpy.postImage).toHaveBeenCalled();
    });

    it('4. calling postImage should return new observer with error message', () => {
        communicationServiceSpy.postImage.and.callFake(() => {
            return throwError({ status: 401, error: 'errorMessage' } as HttpErrorResponse);
        });

        const drawingMessage: DrawingMesssage = {
            title: '',
            body: {
                name: 'test',
                tags: ['test', 'test1'],
                url: '',
            },
        };
        service.postImage(drawingMessage);
        expect(communicationServiceSpy.postImage).toHaveBeenCalled();
    });

    it('5. calling deleteImage  should return new observer', () => {
        const id = 5;
        service.deleteImage(id);
        expect(communicationServiceSpy.deleteImage).toHaveBeenCalled();
    });

    it('6. calling deleteImage  should return new observer with error message 0', () => {
        communicationServiceSpy.deleteImage.and.callFake(() => {
            return throwError({ status: 0, error: 'errorMessage' } as HttpErrorResponse);
        });
        const id = 5;
        service.deleteImage(id);
        expect(communicationServiceSpy.deleteImage).toHaveBeenCalled();
    });

    it('7. calling deleteImage  should return new observer with error message', () => {
        communicationServiceSpy.deleteImage.and.callFake(() => {
            return throwError({ status: 401, error: 'errorMessage' } as HttpErrorResponse);
        });
        const id = 5;
        service.deleteImage(id);
        expect(communicationServiceSpy.deleteImage).toHaveBeenCalled();
    });

    it('8. should call getImages', () => {
        service.getImages();
        expect(communicationServiceSpy.getImages).toHaveBeenCalled();
    });

    it('9. calling getImages  should return new observer with error message 0', () => {
        communicationServiceSpy.getImages.and.callFake(() => {
            return throwError({ status: 0, error: 'errorMessage' } as HttpErrorResponse);
        });
        service.getImages();
        expect(communicationServiceSpy.getImages).toHaveBeenCalled();
    });

    it('10. calling getImages  should return new observer with error message', () => {
        communicationServiceSpy.getImages.and.callFake(() => {
            return throwError({ status: 500, error: 'errorMessage' } as HttpErrorResponse);
        });
        service.getImages();
        expect(communicationServiceSpy.getImages).toHaveBeenCalled();
    });

    it('11. should return observable', () => {
        expect(typeof service.imageDeleteEventListener()).toEqual('object');
    });

    it('12. should return observable', () => {
        expect(typeof service.imageGetterEventListener()).toEqual('object');
    });
    it('13. should return observable', () => {
        expect(typeof service.imageSaveEventListener()).toEqual('object');
    });

    it('14. calling postImageImgur  should return new observer', () => {
        const imageData: FormData = new FormData();
        imageData.append('image', ' ');
        service.postImageImgur(imageData);
        expect(communicationServiceSpy.postToImgur).toHaveBeenCalledWith(imageData);
    });

    it('15. calling postImage  should return new observer with error message', () => {
        communicationServiceSpy.postToImgur.and.callFake(() => {
            return throwError({ status: 500, error: 'errorMessage' } as HttpErrorResponse);
        });
        const imageData: FormData = new FormData();
        imageData.append('image', ' ');
        service.postImageImgur(imageData);
        expect(communicationServiceSpy.postToImgur).toHaveBeenCalledWith(imageData);
    });

    it('16. calling postImage  should return new observer with error message 0', () => {
        communicationServiceSpy.postToImgur.and.callFake(() => {
            return throwError({ status: 0, error: 'errorMessage' } as HttpErrorResponse);
        });
        const imageData: FormData = new FormData();
        imageData.append('image', ' ');
        service.postImageImgur(imageData);
        expect(communicationServiceSpy.postToImgur).toHaveBeenCalledWith(imageData);
    });
});
