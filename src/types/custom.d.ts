declare module '@google/generative-ai';
declare module 'nodemailer'
declare module 'passport-github2'
declare module 'axios'
declare module 'helmet'
declare module 'morgan'
declare module 'cookie-parser'
declare module 'express-rate-limit'
declare module 'node-fetch'
declare module 'canvas' {
    export function createCanvas(width: number, height: number): Canvas;
    
    export interface Canvas {
        width: number; // Add width property
        height: number; // Add height property
        getContext(contextType: '2d'): CanvasRenderingContext2D;
        toBuffer(format: 'image/png', options?: any): Buffer;
        // Add other methods or properties you use if needed
    }

    export interface CanvasRenderingContext2D {
        fillStyle: string;
        fillRect(x: number, y: number, width: number, height: number): void;
        font: string;
        textAlign: string;
        textBaseline: string;
        fillText(text: string, x: number, y: number): void;
        // Add other methods you use if needed
    }

    export function loadImage(url: string): Promise<any>;
    export function registerFont(path: string, options?: any): void;
}
