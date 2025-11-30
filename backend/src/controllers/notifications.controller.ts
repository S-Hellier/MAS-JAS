import { Request, Response } from 'express';
import { DatabaseService } from '../services/database.service';

/**
 * Calculate how many days before expiration to notify user
 * Uses rule-based logic based on shelf life duration
 * 
 * Logic:
 * - Very short shelf life (≤3 days): Notify 1 day before
 * - Short shelf life (4-7 days): Notify 2 days before
 * - Medium shelf life (8-30 days): Notify 3 days before
 * - Long shelf life (31-90 days): Notify 7 days before (1 week)
 * - Very long shelf life (90+ days): Notify 14 days before (2 weeks)
 */
function calculateNotificationThreshold(daysUntilExpiration: number): number {
  if (daysUntilExpiration <= 3) return 1;        // Very short: 1 day before
  if (daysUntilExpiration <= 7) return 2;        // Short: 2 days before
  if (daysUntilExpiration <= 30) return 3;       // Medium: 3 days before
  if (daysUntilExpiration <= 90) return 7;       // Long: 1 week before
  return 14;                                      // Very long: 2 weeks before
}

/**
 * Get items that need expiration notifications
 * 
 * @route GET /api/v1/notifications/expiring
 * @returns Items that should trigger notifications based on rule-based thresholds
 */
export const getExpiringItems = async (req: Request, res: Response) => {
  try {
    const userId = req.headers['x-user-id'] as string || 'default-user';
    const dbService = DatabaseService.getInstance();

    // Get all user's pantry items
    const allItems = await dbService.getPantryItems(userId, {});

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Process each item to determine if it needs a notification
    const itemsNeedingNotification = [];

    for (const item of allItems.items) {
      const expirationDate = new Date(item.expirationDate);
      expirationDate.setHours(0, 0, 0, 0);

      // Calculate days until expiration
      const daysUntilExpiration = Math.ceil(
        (expirationDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
      );

      // Skip already expired items (they're handled separately)
      if (daysUntilExpiration < 0) continue;

      // Skip items expiring far in the future (more than 30 days)
      if (daysUntilExpiration > 30) continue;

      // Use rule-based logic to determine if user should be notified NOW
      const notificationThreshold = calculateNotificationThreshold(daysUntilExpiration);

      // Should we notify? (if days until expiration <= threshold)
      if (daysUntilExpiration <= notificationThreshold) {
        itemsNeedingNotification.push({
          id: item.id,
          name: item.name,
          brand: item.brand,
          category: item.category,
          quantity: item.quantity,
          unit: item.unit,
          expirationDate: item.expirationDate,
          daysUntilExpiration,
          urgency: daysUntilExpiration === 0 ? 'today' : 
                   daysUntilExpiration === 1 ? 'tomorrow' : 
                   daysUntilExpiration <= 3 ? 'urgent' : 'soon',
          message: generateNotificationMessage(item.name, daysUntilExpiration)
        });
      }
    }

    // Sort by urgency (soonest expiration first)
    itemsNeedingNotification.sort((a, b) => a.daysUntilExpiration - b.daysUntilExpiration);

    res.status(200).json({
      success: true,
      data: {
        items: itemsNeedingNotification,
        count: itemsNeedingNotification.length
      }
    });

  } catch (error) {
    console.error('Error getting expiring items:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get expiring items'
    });
  }
};

/**
 * Generate a user-friendly notification message
 */
function generateNotificationMessage(productName: string, daysUntilExpiration: number): string {
  if (daysUntilExpiration === 0) {
    return `⚠️ ${productName} expires TODAY! Use it soon.`;
  } else if (daysUntilExpiration === 1) {
    return `⏰ ${productName} expires TOMORROW. Plan to use it!`;
  } else if (daysUntilExpiration <= 3) {
    return `📅 ${productName} expires in ${daysUntilExpiration} days. Use soon!`;
  } else {
    return `🔔 ${productName} will expire in ${daysUntilExpiration} days. Plan ahead!`;
  }
}

