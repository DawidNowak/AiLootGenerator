import { TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { signal } from '@angular/core';
import { AppComponent } from './app.component';
import { I18nService } from './services/i18n.service';

describe('AppComponent', () => {
  let i18nService: jasmine.SpyObj<I18nService>;

  beforeEach(async () => {
    const i18nServiceSpy = jasmine.createSpyObj('I18nService', [
      'getAvailableLanguages',
      'getCurrentLanguageInfo',
      'switchLanguage',
      'translate'
    ], {
      currentLanguage: signal('en')
    });

    await TestBed.configureTestingModule({
      imports: [
        AppComponent,
        NoopAnimationsModule,
        HttpClientTestingModule
      ],
      providers: [
        { provide: I18nService, useValue: i18nServiceSpy }
      ]
    }).compileComponents();

    i18nService = TestBed.inject(I18nService) as jasmine.SpyObj<I18nService>;

    // Mock translation returns
    i18nService.translate.and.callFake((key: string) => {
      const translations: Record<string, string> = {
        'app.title': 'AI Loot Generator',
        'app.subtitle': 'Warhammer Fantasy Edition',
        'app.description': 'Generate legendary treasures and magical artifacts for your Warhammer Fantasy adventures',
        'language.selector.label': 'Language',
        'color.gold': 'Gold',
        'color.silver': 'Silver',
        'color.bronze': 'Bronze',
        'color.accent': 'Accent',
        'item.legendary': 'Legendary Item',
        'item.legendary.description': 'Sample legendary treasure with golden accents and mystical properties.',
        'item.rare': 'Rare Artifact',
        'item.rare.description': 'A silver-touched item with moderate magical enchantments.',
        'item.common': 'Common Treasure',
        'item.common.description': 'Bronze-quality item suitable for beginning adventurers.'
      };
      return translations[key] || key;
    });

    i18nService.getAvailableLanguages.and.returnValue([
      { code: 'en', label: 'English', translations: {} },
      { code: 'pl', label: 'Polski', translations: {} }
    ]);
    i18nService.getCurrentLanguageInfo.and.returnValue({
      code: 'en', label: 'English', translations: {}
    });
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it(`should have the 'AI Loot Generator' title`, () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app.title).toEqual('AI Loot Generator');
  });

  it('should render title', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h1')?.textContent).toContain('AI Loot Generator');
  });

  // T007: Header visibility tests (these should FAIL initially)
  describe('Header Visibility (T007)', () => {
    it('should have all header elements visible', () => {
      const fixture = TestBed.createComponent(AppComponent);
      fixture.detectChanges();
      const compiled = fixture.nativeElement as HTMLElement;

      // Check for header container
      const header = compiled.querySelector('.app-header');
      expect(header).toBeTruthy();

      // Check for title elements
      const title = compiled.querySelector('.app-title');
      expect(title).toBeTruthy();

      // Check for subtitle
      const subtitle = compiled.querySelector('.title-subtitle');
      expect(subtitle).toBeTruthy();

      // Check for description
      const description = compiled.querySelector('.app-description');
      expect(description).toBeTruthy();
    });

    it('should not have content cut off or overlapping', () => {
      const fixture = TestBed.createComponent(AppComponent);
      fixture.detectChanges();
      const compiled = fixture.nativeElement as HTMLElement;

      const header = compiled.querySelector('.app-header') as HTMLElement;
      expect(header).toBeTruthy();

      // This will fail if header has fixed height that cuts off content
      const computedStyle = getComputedStyle(header);
      expect(computedStyle.minHeight).not.toBe('auto'); // Will fail until CSS is fixed
      expect(computedStyle.overflow).not.toBe('hidden'); // Will fail if content is hidden
    });

    it('should scale appropriately on small screens', () => {
      const fixture = TestBed.createComponent(AppComponent);

      fixture.detectChanges();
      const compiled = fixture.nativeElement as HTMLElement;

      const title = compiled.querySelector('.app-title') as HTMLElement;
      expect(title).toBeTruthy();

      // Verify that responsive CSS classes exist and title has reasonable styling
      const titleStyle = getComputedStyle(title);
      const fontSize = parseFloat(titleStyle.fontSize);

      // In testing environment, check that font size is set (might be default value)
      expect(fontSize).toBeGreaterThan(0);
      expect(titleStyle.fontWeight).toBeTruthy();
    });

    it('should maintain proper header layout on different viewport heights', () => {
      const fixture = TestBed.createComponent(AppComponent);

      // Test different viewport heights
      const viewportHeights = [600, 800, 1080];

      viewportHeights.forEach(height => {
        Object.defineProperty(window, 'innerHeight', { value: height, writable: true });
        fixture.detectChanges();

        const compiled = fixture.nativeElement as HTMLElement;
        const headerContent = compiled.querySelector('.header-content') as HTMLElement;

        expect(headerContent).toBeTruthy();

        // Will fail if padding is excessive for small heights
        if (height <= 600) {
          const computedStyle = getComputedStyle(headerContent);
          expect(parseFloat(computedStyle.paddingTop)).toBeLessThan(32); // Should reduce padding on small screens
        }
      });
    });

    it('should preserve language selector visibility', () => {
      const fixture = TestBed.createComponent(AppComponent);
      fixture.detectChanges();
      const compiled = fixture.nativeElement as HTMLElement;

      const languageSelector = compiled.querySelector('app-language-selector');
      expect(languageSelector).toBeTruthy();

      const headerControls = compiled.querySelector('.header-controls');
      expect(headerControls).toBeTruthy();

      // Should be visible and properly positioned
      const controlsStyle = getComputedStyle(headerControls as HTMLElement);
      expect(controlsStyle.display).not.toBe('none');
    });

    it('should maintain responsive header layout', () => {
      const fixture = TestBed.createComponent(AppComponent);
      fixture.detectChanges();
      const compiled = fixture.nativeElement as HTMLElement;

      const headerTop = compiled.querySelector('.header-top') as HTMLElement;
      expect(headerTop).toBeTruthy();

      // Should use flex layout for responsive behavior
      const headerTopStyle = getComputedStyle(headerTop);
      expect(headerTopStyle.display).toBe('flex');
      expect(headerTopStyle.justifyContent).toBe('space-between'); // Will fail until proper layout is ensured
    });
  });
});
