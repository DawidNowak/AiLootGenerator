# Testing Contracts: UI Layout and Visual Improvements

## Test Strategy Overview

This document defines the testing approach for UI layout changes, focusing on responsive behavior, component functionality, and visual consistency.

## Unit Testing Contracts

### WealthSelectorComponent Tests

```typescript
describe("WealthSelectorComponent - Icon Removal", () => {
  let component: WealthSelectorComponent;
  let fixture: ComponentFixture<WealthSelectorComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [WealthSelectorComponent],
      imports: [MaterialModule, ReactiveFormsModule],
    });
  });

  it("should not render icons in dropdown options", () => {
    component.showIcons = false;
    fixture.detectChanges();

    const iconElements = fixture.debugElement.queryAll(By.css(".wealth-icon"));
    expect(iconElements.length).toBe(0);
  });

  it("should display penny ranges below dropdown", () => {
    component.showPennyRanges = true;
    fixture.detectChanges();

    const pennyRangeElement = fixture.debugElement.query(
      By.css(".penny-range-display")
    );
    expect(pennyRangeElement).toBeTruthy();
    expect(pennyRangeElement.nativeElement.textContent).toContain("pennies");
  });

  it("should maintain form validation with simplified display", () => {
    component.required = true;
    component.wealthLevelControl.setValue(null);

    expect(component.wealthLevelControl.invalid).toBeTruthy();
    expect(component.wealthLevelControl.hasError("required")).toBeTruthy();
  });
});
```

### LootListComponent Tests

```typescript
describe("LootListComponent - List Layout", () => {
  let component: LootListComponent;
  let fixture: ComponentFixture<LootListComponent>;

  it("should display items in vertical list format", () => {
    const mockItems = createMockLootItems(3);
    component.items = mockItems;
    component.layout = "list";
    fixture.detectChanges();

    const listContainer = fixture.debugElement.query(
      By.css(".loot-items-grid")
    );
    const computedStyle = getComputedStyle(listContainer.nativeElement);

    expect(computedStyle.display).toBe("flex");
    expect(computedStyle.flexDirection).toBe("column");
  });

  it("should preserve all item information in list format", () => {
    const mockItem = createMockLootItem();
    component.items = [mockItem];
    fixture.detectChanges();

    const itemElement = fixture.debugElement.query(By.css("app-loot-item"));
    const itemComponent = itemElement.componentInstance;

    expect(itemComponent.item).toEqual(mockItem);
    expect(itemComponent.showPrice).toBe(component.showPrices);
    expect(itemComponent.showFullBreakdown).toBe(component.showFullBreakdown);
  });
});
```

### LootGeneratorComponent Tests

```typescript
describe("LootGeneratorComponent - Responsive Layout", () => {
  let component: LootGeneratorComponent;
  let fixture: ComponentFixture<LootGeneratorComponent>;
  let breakpointObserver: BreakpointObserver;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        { provide: BreakpointObserver, useValue: mockBreakpointObserver },
      ],
    });
    breakpointObserver = TestBed.inject(BreakpointObserver);
  });

  it("should use stacked layout on mobile viewports", () => {
    // Mock mobile breakpoint
    spyOn(breakpointObserver, "observe").and.returnValue(of({ matches: true }));
    component.ngOnInit();
    fixture.detectChanges();

    const container = fixture.debugElement.query(
      By.css(".responsive-container")
    );
    const computedStyle = getComputedStyle(container.nativeElement);

    expect(computedStyle.gridTemplateColumns).toBe("1fr");
  });

  it("should use side-by-side layout on desktop viewports", () => {
    // Mock desktop breakpoint
    spyOn(breakpointObserver, "observe").and.returnValue(
      of({ matches: false })
    );
    component.ngOnInit();
    fixture.detectChanges();

    const container = fixture.debugElement.query(
      By.css(".responsive-container")
    );
    const computedStyle = getComputedStyle(container.nativeElement);

    expect(computedStyle.gridTemplateColumns).toContain("400px 1fr");
  });
});
```

## Integration Testing Contracts

### Responsive Layout Integration

```typescript
describe("Responsive Layout Integration", () => {
  let app: AppComponent;
  let generator: LootGeneratorComponent;
  let lootList: LootListComponent;

  it("should maintain layout consistency across components", async () => {
    // Test mobile layout
    await setViewportSize(400, 800);

    expect(generator.isMobile).toBeTruthy();
    expect(lootList.layout).toBe("list");

    const formSection = fixture.debugElement.query(
      By.css(".generation-section")
    );
    const resultsSection = fixture.debugElement.query(
      By.css(".results-section")
    );

    // Verify stacked layout (form above results)
    expect(formSection.nativeElement.offsetTop).toBeLessThan(
      resultsSection.nativeElement.offsetTop
    );
  });

  it("should transition smoothly between breakpoints", async () => {
    // Start mobile
    await setViewportSize(400, 800);
    fixture.detectChanges();

    // Transition to desktop
    await setViewportSize(1200, 800);
    fixture.detectChanges();

    // Verify layout changed appropriately
    expect(generator.isMobile).toBeFalsy();

    const container = fixture.debugElement.query(
      By.css(".responsive-container")
    );
    const computedStyle = getComputedStyle(container.nativeElement);
    expect(computedStyle.gridTemplateColumns).toContain("400px 1fr");
  });
});
```

### Cross-Component Communication

```typescript
describe("Component Communication", () => {
  it("should maintain data flow with new layouts", () => {
    const mockLootItems = createMockLootItems(5);

    generator.onLootGenerated(mockLootItems);
    fixture.detectChanges();

    expect(lootList.items).toEqual(mockLootItems);
    expect(lootList.items.length).toBe(5);
  });

  it("should preserve wealth selector functionality", () => {
    const wealthSelector = fixture.debugElement.query(
      By.css("app-wealth-selector")
    );
    const mockWealthLevel = WealthLevel.MODERATE;

    wealthSelector.triggerEventHandler("selectionChange", mockWealthLevel);

    expect(generator.selectedWealthLevel).toBe(mockWealthLevel);
  });
});
```

## Visual Regression Testing Contracts

### Screenshot Testing

```typescript
describe("Visual Regression", () => {
  const screenshotOptions = {
    threshold: 0.2,
    includeAA: false,
  };

  it("should match mobile layout screenshot", async () => {
    await setViewportSize(375, 667);
    fixture.detectChanges();

    await expectAsync(fixture.nativeElement).toMatchScreenshot(
      "mobile-layout",
      screenshotOptions
    );
  });

  it("should match desktop layout screenshot", async () => {
    await setViewportSize(1024, 768);
    fixture.detectChanges();

    await expectAsync(fixture.nativeElement).toMatchScreenshot(
      "desktop-layout",
      screenshotOptions
    );
  });

  it("should match wealth selector without icons", async () => {
    const wealthSelector = fixture.debugElement.query(
      By.css("app-wealth-selector")
    );

    await expectAsync(wealthSelector.nativeElement).toMatchScreenshot(
      "wealth-selector-no-icons",
      screenshotOptions
    );
  });
});
```

## Accessibility Testing Contracts

### A11y Compliance Tests

```typescript
describe("Accessibility Compliance", () => {
  it("should maintain ARIA labels for wealth selector", () => {
    const selectElement = fixture.debugElement.query(By.css("mat-select"));

    expect(selectElement.nativeElement.getAttribute("aria-label")).toBeTruthy();
    expect(selectElement.nativeElement.getAttribute("role")).toBe("combobox");
  });

  it("should use semantic HTML for loot list", () => {
    component.items = createMockLootItems(3);
    fixture.detectChanges();

    const listElement = fixture.debugElement.query(By.css('[role="list"]'));
    const listItems = fixture.debugElement.queryAll(
      By.css('[role="listitem"]')
    );

    expect(listElement).toBeTruthy();
    expect(listItems.length).toBe(3);
  });

  it("should maintain keyboard navigation", async () => {
    const wealthSelector = fixture.debugElement.query(By.css("mat-select"));

    wealthSelector.nativeElement.focus();
    await sendKeys("{ArrowDown}");

    expect(document.activeElement).toBe(wealthSelector.nativeElement);
  });
});
```

## Performance Testing Contracts

### Layout Performance

```typescript
describe("Layout Performance", () => {
  it("should complete responsive transitions under 300ms", async () => {
    const startTime = performance.now();

    await setViewportSize(400, 800);
    fixture.detectChanges();
    await fixture.whenStable();

    await setViewportSize(1024, 768);
    fixture.detectChanges();
    await fixture.whenStable();

    const endTime = performance.now();
    expect(endTime - startTime).toBeLessThan(300);
  });

  it("should not cause layout thrashing during resize", () => {
    const layoutMeasurements = [];

    spyOn(HTMLElement.prototype, "getBoundingClientRect").and.callFake(() => {
      layoutMeasurements.push(performance.now());
      return {
        width: 100,
        height: 100,
        top: 0,
        left: 0,
        bottom: 100,
        right: 100,
      };
    });

    // Simulate multiple rapid resizes
    for (let i = 0; i < 10; i++) {
      setViewportSize(800 + i * 10, 600);
      fixture.detectChanges();
    }

    // Should not trigger excessive layout measurements
    expect(layoutMeasurements.length).toBeLessThan(20);
  });
});
```

## Test Data Setup

### Mock Data Generators

```typescript
function createMockLootItems(count: number): LootItem[] {
  return Array.from({ length: count }, (_, index) => ({
    id: `item-${index}`,
    name: `Mock Item ${index + 1}`,
    description: `Description for item ${index + 1}`,
    value: { pennies: 100 + index * 50 },
    rarity: "common",
    type: "misc",
  }));
}

function createMockLootItem(): LootItem {
  return {
    id: "test-item-1",
    name: "Test Sword",
    description: "A basic testing sword",
    value: { pennies: 150 },
    rarity: "common",
    type: "weapon",
  };
}
```

### Test Utilities

```typescript
async function setViewportSize(width: number, height: number): Promise<void> {
  Object.defineProperty(window, "innerWidth", { value: width, writable: true });
  Object.defineProperty(window, "innerHeight", {
    value: height,
    writable: true,
  });
  window.dispatchEvent(new Event("resize"));
  return new Promise((resolve) => setTimeout(resolve, 100));
}

const mockBreakpointObserver = {
  observe: jasmine.createSpy("observe").and.returnValue(of({ matches: false })),
  isMatched: jasmine.createSpy("isMatched").and.returnValue(false),
};
```
