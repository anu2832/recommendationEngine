import { SentimentAnalyzer } from './analyzingSentiments';
import { DatabaseService } from './dbOperation';
import { FoodService } from './rollOutService';
import { FoodSentimentCalculator } from './sentimentCalculation';

//getting top food items based on sentiment analysis
export async function getTopFoodItems(menuType?: string): Promise<any[]> {
    const dbService = new DatabaseService();
    const sentimentAnalyzer = new SentimentAnalyzer();
    const foodService = new FoodService(dbService);
    const foodSentimentCalculator = new FoodSentimentCalculator(
        dbService,
        sentimentAnalyzer,
    );

    const foodSentiments =
        await foodSentimentCalculator.calculateAllFoodSentiments(menuType);
    foodSentiments.sort((a, b) => b.averageRating - a.averageRating);

    const top5FoodItems = menuType
    ? foodSentiments.slice(0, 5)
    : foodSentiments.slice(-5);
    console.log(top5FoodItems)
    await foodService.clearRolloutTable();

    if (menuType) {
        for (const foodItem of top5FoodItems) {
            const foodDetails = await foodService.fetchFoodDetails(
                foodItem.foodId,
            );
            //console.log("for loop console",foodItem.foodId)
            await foodService.insertIntoRollout(
                foodDetails.itemId,
                foodDetails.itemName,
                foodDetails.price,
                menuType,
            );
        }
    }

    return top5FoodItems;
}
