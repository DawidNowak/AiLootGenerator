# Contract Tests: WealthLevel Extension

**Date**: October 11, 2025  
**Feature**: 005-i-want-to  
**Phase**: 1 - Design & Contracts

## Test Strategy

These contract tests will be created to validate the API changes for the WealthLevel extension. All tests should initially **FAIL** since the implementation doesn't exist yet (TDD approach).

## Backend Contract Tests

### WealthLevelEnumTests.cs

```csharp
using Microsoft.VisualStudio.TestTools.UnitTesting;
using AiLootGenerator.RestApi.Models;

[TestClass]
public class WealthLevelEnumTests
{
    [TestMethod]
    public void WealthLevel_ShouldHaveSixValues()
    {
        // Arrange & Act
        var values = Enum.GetValues<WealthLevel>();

        // Assert
        Assert.AreEqual(6, values.Length, "WealthLevel should have exactly 6 values");
    }

    [TestMethod]
    public void WealthLevel_TreasureTier_ShouldHaveValue6()
    {
        // Arrange & Act
        var treasureValue = (int)WealthLevel.Treasure;

        // Assert
        Assert.AreEqual(6, treasureValue, "Treasure tier should have integer value 6");
    }

    [TestMethod]
    public void WealthLevel_AllValues_ShouldBeSequential()
    {
        // Arrange & Act
        var expectedValues = new[] { 1, 2, 3, 4, 5, 6 };
        var actualValues = Enum.GetValues<WealthLevel>()
            .Cast<WealthLevel>()
            .Select(w => (int)w)
            .OrderBy(v => v)
            .ToArray();

        // Assert
        CollectionAssert.AreEqual(expectedValues, actualValues,
            "WealthLevel values should be sequential integers from 1 to 6");
    }
}
```

### LootGenerationServiceTests.cs

```csharp
using Microsoft.VisualStudio.TestTools.UnitTesting;
using AiLootGenerator.RestApi.Services;
using AiLootGenerator.RestApi.Models;

[TestClass]
public class LootGenerationServiceTests
{
    private LootGenerationService _service;

    [TestInitialize]
    public void Setup()
    {
        _service = new LootGenerationService(/* dependencies */);
    }

    [TestMethod]
    public async Task GenerateLoot_TreasureTier_ShouldReturnHighValueItems()
    {
        // Arrange
        var request = new GenerationRequest
        {
            WealthLevel = WealthLevel.Treasure,
            Location = "Dragon's Hoard",
            Count = 5
        };

        // Act
        var result = await _service.GenerateLootAsync(request);

        // Assert
        Assert.IsTrue(result.Items.All(item => item.Value >= 3601),
            "All Treasure tier items should have value >= 3601 pennies");
    }

    [TestMethod]
    public async Task GenerateLoot_NobleTier_ShouldRespectUpdatedRange()
    {
        // Arrange
        var request = new GenerationRequest
        {
            WealthLevel = WealthLevel.Noble,
            Location = "Noble's Treasury",
            Count = 10
        };

        // Act
        var result = await _service.GenerateLootAsync(request);

        // Assert
        Assert.IsTrue(result.Items.All(item => item.Value >= 1201 && item.Value <= 3600),
            "All Noble tier items should have value between 1201-3600 pennies");
    }
}
```

### LootControllerTests.cs

```csharp
using Microsoft.VisualStudio.TestTools.UnitTesting;
using Microsoft.AspNetCore.Mvc;
using AiLootGenerator.RestApi.Controllers;
using AiLootGenerator.RestApi.Models;

[TestClass]
public class LootControllerTests
{
    private LootController _controller;

    [TestInitialize]
    public void Setup()
    {
        _controller = new LootController(/* dependencies */);
    }

    [TestMethod]
    public async Task GenerateLoot_TreasureTier_ShouldReturn200()
    {
        // Arrange
        var request = new GenerationRequest
        {
            WealthLevel = WealthLevel.Treasure,
            Location = "Ancient Vault"
        };

        // Act
        var result = await _controller.GenerateLoot(request);

        // Assert
        Assert.IsInstanceOfType(result, typeof(OkObjectResult));
    }

    [TestMethod]
    public async Task GenerateLoot_InvalidWealthLevel_ShouldReturn400()
    {
        // Arrange
        var request = new GenerationRequest
        {
            WealthLevel = (WealthLevel)7, // Invalid value
            Location = "Somewhere"
        };

        // Act
        var result = await _controller.GenerateLoot(request);

        // Assert
        Assert.IsInstanceOfType(result, typeof(BadRequestObjectResult));
    }
}
```

## Frontend Contract Tests

### wealth-level.model.spec.ts

```typescript
import { WealthLevel } from "./wealth-level.model";

describe("WealthLevel", () => {
  it("should have exactly 6 values", () => {
    const values = Object.values(WealthLevel).filter(
      (v) => typeof v === "number"
    );
    expect(values).toHaveLength(6);
  });

  it("should include Treasure tier with value 6", () => {
    expect(WealthLevel.Treasure).toBe(6);
  });

  it("should have sequential integer values from 1 to 6", () => {
    const expectedValues = [1, 2, 3, 4, 5, 6];
    const actualValues = Object.values(WealthLevel)
      .filter((v) => typeof v === "number")
      .sort();

    expect(actualValues).toEqual(expectedValues);
  });
});
```

### wealth-selector.component.spec.ts

```typescript
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { WealthSelectorComponent } from "./wealth-selector.component";
import { WealthLevel } from "../../models/wealth-level.model";

describe("WealthSelectorComponent", () => {
  let component: WealthSelectorComponent;
  let fixture: ComponentFixture<WealthSelectorComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [WealthSelectorComponent],
      imports: [
        /* Angular Material imports */
      ],
    });

    fixture = TestBed.createComponent(WealthSelectorComponent);
    component = fixture.componentInstance;
  });

  it("should display 6 wealth level options", () => {
    fixture.detectChanges();

    const options = fixture.debugElement.queryAll(By.css("mat-option"));
    expect(options).toHaveLength(6);
  });

  it("should include Treasure tier option", () => {
    fixture.detectChanges();

    const treasureOption = fixture.debugElement.query(
      By.css('mat-option[value="6"]')
    );
    expect(treasureOption).toBeTruthy();
    expect(treasureOption.nativeElement.textContent).toContain("Treasure");
  });

  it("should emit Treasure tier when selected", () => {
    spyOn(component.selectionChange, "emit");

    component.onSelectionChange(WealthLevel.Treasure);

    expect(component.selectionChange.emit).toHaveBeenCalledWith(
      WealthLevel.Treasure
    );
  });
});
```

## Integration Tests

### LootGenerationIntegrationTests.cs

```csharp
using Microsoft.VisualStudio.TestTools.UnitTesting;
using Microsoft.AspNetCore.Mvc.Testing;
using System.Net.Http.Json;

[TestClass]
public class LootGenerationIntegrationTests
{
    private WebApplicationFactory<Program> _factory;
    private HttpClient _client;

    [TestInitialize]
    public void Setup()
    {
        _factory = new WebApplicationFactory<Program>();
        _client = _factory.CreateClient();
    }

    [TestMethod]
    public async Task POST_GenerateLoot_TreasureTier_ReturnsHighValueItems()
    {
        // Arrange
        var request = new
        {
            wealthLevel = 6,
            location = "Dragon's Hoard",
            count = 5
        };

        // Act
        var response = await _client.PostAsJsonAsync("/api/loot/generate", request);
        var result = await response.Content.ReadFromJsonAsync<LootGenerationResponse>();

        // Assert
        response.EnsureSuccessStatusCode();
        Assert.IsTrue(result.Items.All(item => item.Value >= 3601));
    }

    [TestMethod]
    public async Task GET_WealthLevels_ReturnsSixLevels()
    {
        // Act
        var response = await _client.GetAsync("/api/loot/wealth-levels");
        var result = await response.Content.ReadFromJsonAsync<WealthLevelsResponse>();

        // Assert
        response.EnsureSuccessStatusCode();
        Assert.AreEqual(6, result.WealthLevels.Length);

        var treasureTier = result.WealthLevels.FirstOrDefault(w => w.Value == 6);
        Assert.IsNotNull(treasureTier);
        Assert.AreEqual("Treasure", treasureTier.Name);
    }
}
```

## End-to-End Tests

### loot-generation.e2e.spec.ts

```typescript
import { test, expect } from "@playwright/test";

test.describe("Wealth Level Selection", () => {
  test("should display Treasure tier in dropdown", async ({ page }) => {
    await page.goto("/");

    await page.click('[data-testid="wealth-selector"]');

    const treasureOption = page.locator("mat-option", { hasText: "Treasure" });
    await expect(treasureOption).toBeVisible();
  });

  test("should generate treasure tier loot", async ({ page }) => {
    await page.goto("/");

    // Select Treasure tier
    await page.click('[data-testid="wealth-selector"]');
    await page.click('mat-option:has-text("Treasure")');

    // Fill location and generate
    await page.fill('[data-testid="location-input"]', "Ancient Vault");
    await page.click('[data-testid="generate-button"]');

    // Verify high-value items generated
    await expect(page.locator('[data-testid="loot-items"]')).toBeVisible();

    const itemValues = await page
      .locator('[data-testid="item-value"]')
      .allTextContents();
    const numericValues = itemValues.map((v) => parseInt(v.replace(/\D/g, "")));

    expect(numericValues.every((value) => value >= 3601)).toBeTruthy();
  });
});
```

## Test Execution Order

1. **Unit Tests**: Run first to validate individual components
2. **Integration Tests**: Run second to validate API contracts
3. **Frontend Component Tests**: Run third to validate UI behavior
4. **End-to-End Tests**: Run last to validate complete user workflows

## Expected Initial Results

**All tests should FAIL initially** because:

- WealthLevel.Treasure doesn't exist yet
- Backend doesn't handle value 6
- Frontend doesn't display Treasure option
- Loot generation doesn't support new tier

This follows TDD methodology: write failing tests first, then implement to make them pass.

---

**Contract Tests Complete**: All test specifications defined and ready for implementation
