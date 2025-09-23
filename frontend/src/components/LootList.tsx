import React from "react";
import LootItem from "./LootItem";
import { LootItem as LootItemType } from "../types/api";
import { useTranslation } from "react-i18next";

export interface LootListProps {
  items: LootItemType[];
  showPrices: boolean;
}

const LootList: React.FC<LootListProps> = ({ items, showPrices }) => {
  const { t } = useTranslation("loot");
  if (!items || items.length === 0) {
    return <div data-testid="loot-list-empty">{t("noItems")}</div>;
  }
  return (
    <ul data-testid="loot-list">
      {items.map((item, idx) => (
        <li key={idx}>
          <LootItem item={item} showPrice={showPrices} />
        </li>
      ))}
    </ul>
  );
};

export default LootList;
