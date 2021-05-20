import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { HttpResponse } from '@app/classes/http-response';
import { CommunicationService } from '@app/services/communication/communication.service';
import { DrawingMesssage } from '@common/communication/drawing';
import { Observable, Subject } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class CommunicationSubscriptionService {
    isDrawingSaving: boolean = false;
    imageSaveSubject: Subject<HttpResponse> = new Subject<HttpResponse>();
    imageDeleteSubject: Subject<HttpResponse> = new Subject<HttpResponse>();
    imageGetterSubject: Subject<HttpResponse> = new Subject<HttpResponse>();
    imagePostImgurSubject: Subject<HttpResponse> = new Subject<HttpResponse>();

    constructor(private communicationService: CommunicationService) {}

    postImage(image: DrawingMesssage): void {
        this.isDrawingSaving = true;
        this.communicationService.postImage(image).subscribe({
            next: (response: string) => {
                this.isDrawingSaving = false;
                this.emitSaveImageSubjectEvent(new HttpResponse(true, 'Le dessin est enregistre'));
            },
            error: (error: HttpErrorResponse) => {
                const message = error.status === 0 ? 'Le serveur est pas disponible' : error.error;
                this.emitSaveImageSubjectEvent(new HttpResponse(false, message));
                this.isDrawingSaving = false;
            },
        });
    }

    deleteImage(id: number): void {
        this.communicationService.deleteImage(id.toString()).subscribe({
            next: (response: string) => {
                this.emitDeleteImageSubjectEvent(new HttpResponse(true, 'Le dessin est suprime', response));
            },
            error: (error: HttpErrorResponse) => {
                const message = error.status === 0 ? 'Le serveur est pas disponible' : error.error;
                this.emitDeleteImageSubjectEvent(new HttpResponse(false, message));
            },
        });
    }

    getImages(): void {
        this.communicationService.getImages().subscribe({
            next: (response: DrawingMesssage[]) => {
                this.emitGetterImageSubjectEvent(new HttpResponse(true, '', undefined, response));
            },
            error: (error: HttpErrorResponse) => {
                const message = error.status === 0 ? 'Le serveur est pas disponible' : error.error;
                this.emitDeleteImageSubjectEvent(new HttpResponse(false, message));
            },
        });
    }

    postImageImgur(image: FormData): void {
        this.communicationService.postToImgur(image).subscribe({
            next: (response: string) => {
                const jsonResponse = JSON.parse(response);
                this.emitPostImgurSubjectEvent(new HttpResponse(true, 'Le dessin est enregistre', undefined, undefined, jsonResponse.data.link));
            },
            error: (error: HttpErrorResponse) => {
                const message = error.status === 0 ? 'Erreur de connexion' : error.message;
                this.emitPostImgurSubjectEvent(new HttpResponse(false, message));
            },
        });
    }

    emitSaveImageSubjectEvent(response: HttpResponse): void {
        this.imageSaveSubject.next(response);
    }

    imageSaveEventListener(): Observable<HttpResponse> {
        return this.imageSaveSubject.asObservable();
    }

    emitDeleteImageSubjectEvent(response: HttpResponse): void {
        this.imageDeleteSubject.next(response);
    }

    imageDeleteEventListener(): Observable<HttpResponse> {
        return this.imageDeleteSubject.asObservable();
    }

    emitGetterImageSubjectEvent(response: HttpResponse): void {
        this.imageGetterSubject.next(response);
    }

    imageGetterEventListener(): Observable<HttpResponse> {
        return this.imageGetterSubject.asObservable();
    }

    imagePostImgurEventListener(): Observable<HttpResponse> {
        return this.imagePostImgurSubject.asObservable();
    }

    emitPostImgurSubjectEvent(response: HttpResponse): void {
        this.imagePostImgurSubject.next(response);
    }
}
