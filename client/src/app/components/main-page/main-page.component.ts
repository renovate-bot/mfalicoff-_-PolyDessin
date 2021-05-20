import { Component } from '@angular/core';
import { AutoSaveService } from '@app/services/auto-save/auto-save.service';
import { IndexService } from '@app/services/index/index.service';
import { Message } from '@common/communication/message';
import { BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
    selector: 'app-main-page',
    templateUrl: './main-page.component.html',
    styleUrls: ['./main-page.component.scss'],
})
export class MainPageComponent {
    trayIsVisible: boolean = false;

    message: BehaviorSubject<string> = new BehaviorSubject<string>('');
    readonly title: string = 'LOG2990';
    constructor(private basicService: IndexService, private autoSaveService: AutoSaveService) {}

    sendTimeToServer(): void {
        const newTimeMessage: Message = {
            title: 'Hello from the client',
            body: 'Time is : ' + new Date().toString(),
        };
        // Important de ne pas oublier "subscribe" ou l'appel ne sera jamais lancé puisque personne l'observe
        this.basicService.basicPost(newTimeMessage).subscribe();
    }

    getMessagesFromServer(): void {
        this.basicService
            .basicGet()
            // Cette étape transforme le Message en un seul string
            .pipe(
                map((message: Message) => {
                    return `${message.title} ${message.body}`;
                }),
            )
            .subscribe(this.message);
    }

    ifImageStored(): boolean {
        return this.autoSaveService.isImageStored();
    }

    loadSavedImage(): void {
        this.autoSaveService.loadImage();
    }

    clearImage(): void {
        this.autoSaveService.clearImage();
    }
}
