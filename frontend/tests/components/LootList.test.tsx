import { render, screen } from "@testing-library/react";
import LootList from "../../src/components/LootList";
import { LootItem } from "../../src/types/api";
import { WealthLevel } from "../../src/types";

const mockItems: LootItem[] = [
  {
    name: "Jungfreud Tabard",
    description: "A tabard in Ubersreik colors, slightly worn.",
    valueInPennies: 120,
    wealthLevel: WealthLevel.Common,
  },
  {
    name: "Wolf Pelt",
    description: "A Ghur-enchanted wolf pelt, faintly magical.",
    valueInPennies: 5000,
    wealthLevel: WealthLevel.Noble,
  },
];

describe("LootList", () => {
  it("renders empty state when no items", () => {
    render(<LootList items={[]} showPrices={true} />);
    expect(screen.getByTestId("loot-list-empty")).toBeInTheDocument();
  });

  it("renders a list of loot items", () => {
    render(<LootList items={mockItems} showPrices={true} />);
    expect(screen.getByTestId("loot-list")).toBeInTheDocument();
    expect(screen.getAllByRole("listitem").length).toBe(mockItems.length);
  });

  it("passes showPrices prop to LootItem", () => {
    render(<LootList items={mockItems} showPrices={false} />);
    // LootItem is a composite, so we check for absence of price text
    // (Assumes LootItem renders price only if showPrice is true)
    expect(
      screen.queryByText(/gold|shilling|penny|crown/i)
    ).not.toBeInTheDocument();
  });
});
