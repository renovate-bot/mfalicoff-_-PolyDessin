import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { DrawingMesssage } from '@common/communication/drawing';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class CommunicationService {
    private readonly BASE_URL: string = 'http://localhost:3000/api/image';

    constructor(private http: HttpClient) {}

    postImage(message: DrawingMesssage): Observable<string> {
        return this.http.post(this.BASE_URL + '/send', message, { responseType: 'text' });
    }

    getImages(): Observable<DrawingMesssage[]> {
        return this.http.get<DrawingMesssage[]>(this.BASE_URL + '/getAllImages');
    }

    deleteImage(id: string): Observable<string> {
        return this.http.delete(this.BASE_URL + '/' + id, { responseType: 'text' });
    }

    postToImgur(image: FormData): Observable<string> {
        const headers = new HttpHeaders({
            Authorization: 'Client-ID a4073e54632e22a',
        });

        return this.http.post('https://api.imgur.com/3/image', image, { headers, responseType: 'text' });
    }
}
