export interface DrawingMesssage {
    title: string;
    body: {
        name: string;
        tags: string[];
        url: string;
        id?: number;
    };
}
