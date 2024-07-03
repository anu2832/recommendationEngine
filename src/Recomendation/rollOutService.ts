import { DatabaseService } from './dbOperation';

export class FoodService {
    private dbService: DatabaseService;

    constructor(dbService: DatabaseService) {
        this.dbService = dbService;
    }

    //Fetch details of a specific food item
    async fetchFoodDetails(foodId: string): Promise<any> {
        return await this.dbService.fetchFoodDetails(foodId);
    }

    //Clears all entries in the rollout table
    async clearRolloutTable(): Promise<void> {
        console.log('clearing rollout tbl');
        await this.dbService.clearRolloutTable();
    }

    //Inserting a food item into the rollout table
    async insertIntoRollout(
        foodId: string,
        name: string,
        price: string,
        mealType: string,
    ): Promise<void> {
        await this.dbService.insertIntoRollout(foodId, name, price, mealType);
    }
}
