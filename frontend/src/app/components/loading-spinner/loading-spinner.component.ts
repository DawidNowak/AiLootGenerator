import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TranslatePipe } from '../../pipes/translate.pipe';

@Component({
    selector: 'app-loading-spinner',
    standalone: true,
    imports: [
        CommonModule,
        MatProgressSpinnerModule,
        TranslatePipe
    ],
    templateUrl: './loading-spinner.component.html',
    styleUrl: './loading-spinner.component.scss'
})
export class LoadingSpinnerComponent {
    @Input() isLoading: boolean = false;
    @Input() message: string = '';
    @Input() size: number = 50;
    @Input() strokeWidth: number = 4;
    @Input() color: 'primary' | 'accent' | 'warn' = 'primary';
    @Input() showMessage: boolean = true;

    getDefaultMessage(): string {
        return this.message || 'loading.default';
    }
}