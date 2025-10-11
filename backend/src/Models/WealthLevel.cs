namespace AiLootGenerator.RestApi.Models
{
    /// <summary>
    /// Defines the six-tier wealth system for loot quality.
    /// </summary>
    public enum WealthLevel
    {
        /// <summary>
        /// Junk items, lowest tier (1-12 pennies).
        /// </summary>
        Rubbish = 1,

        /// <summary>
        /// Peasant scraps, basic items (13-60 pennies).
        /// </summary>
        Poor = 2,

        /// <summary>
        /// Everyday goods, standard quality (61-240 pennies).
        /// </summary>
        Common = 3,

        /// <summary>
        /// Merchant spoils, valuable items (241-1200 pennies).
        /// </summary>
        Wealthy = 4,

        /// <summary>
        /// Opulent treasures, rare magic items (1201-3600 pennies).
        /// </summary>
        Noble = 5,

        /// <summary>
        /// Legendary artifacts, ultimate treasures (3601+ pennies).
        /// </summary>
        Treasure = 6
    }
}