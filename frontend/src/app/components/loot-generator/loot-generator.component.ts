import { Component, signal, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { BreakpointObserver, Breakpoints, LayoutModule } from '@angular/cdk/layout';
import { Subject, takeUntil } from 'rxjs';
import { LootFormComponent, LootGeneratedEvent } from '../loot-form/loot-form.component';
import { LootListComponent } from '../loot-list/loot-list.component';
import { ErrorMessageComponent, ErrorInfo } from '../error-message/error-message.component';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { LootItem } from '../../models/loot-item.interface';

@Component({
    selector: 'app-loot-generator',
    standalone: true,
    imports: [
        CommonModule,
        LayoutModule,
        MatCheckboxModule,
        LootFormComponent,
        LootListComponent,
        ErrorMessageComponent,
        TranslatePipe
    ],
    templateUrl: './loot-generator.component.html',
    styleUrl: './loot-generator.component.scss'
})
export class LootGeneratorComponent implements OnInit, OnDestroy {
    private readonly breakpointObserver = inject(BreakpointObserver);
    private readonly destroy$ = new Subject<void>();

    // Generated loot state
    generatedLoot = signal<LootItem[]>([]);
    showPriceDetails = signal<boolean>(true);
    currentError = signal<ErrorInfo | null>(null);

    // Responsive state
    isMobile = signal<boolean>(false);
    isDesktop = signal<boolean>(true);

    ngOnInit(): void {
        // Set up responsive breakpoint observing
        this.breakpointObserver
            .observe(['(max-width: 768px)'])
            .pipe(takeUntil(this.destroy$))
            .subscribe(result => {
                this.isMobile.set(result.matches);
                this.isDesktop.set(!result.matches);
            });
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    /**
     * Handle successful loot generation
     */
    onLootGenerated(event: LootGeneratedEvent): void {
        this.generatedLoot.set(event.items);
        this.currentError.set(null);
    }

    /**
     * Handle loot generation errors
     */
    onLootGenerationError(error: string): void {
        this.currentError.set({
            message: error,
            type: 'error',
            code: 'GEN_ERROR',
            details: 'Failed to generate loot. Please try again.',
            timestamp: new Date(),
            retryable: true
        });
        console.error('Loot generation error:', error);
    }

    /**
     * Handle price display toggle
     */
    onPriceToggleChange(showDetailed: boolean): void {
        this.showPriceDetails.set(showDetailed);
    }

    /**
     * Handle error dismissal
     */
    onErrorDismiss(): void {
        this.currentError.set(null);
    }

    /**
     * Handle error retry
     */
    onErrorRetry(): void {
        this.currentError.set(null);
        // The retry will be handled by triggering a new generation through the form
    }
}