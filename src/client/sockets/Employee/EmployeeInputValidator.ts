// utils/ValidationUtils.ts

export class ValidationUtils {
    static isValidUserId(userId: string): boolean {
        return typeof userId === 'string' && userId.trim().length > 0;
    }

    static isValidProfileInput(dietCategory: string, spiceLevel: string, area: string, sweetLevel: string): boolean {
        const validDietCategories = ['vegetarian', 'non-vegetarian', 'eggetarian'];
        const validSpiceLevels = ['low', 'medium', 'high'];
        const validAreas = ['North Indian', 'South Indian'];

        return validDietCategories.includes(dietCategory.trim().toLowerCase()) &&
            validSpiceLevels.includes(spiceLevel.trim().toLowerCase()) &&
            validAreas.includes(area.trim().toLowerCase()) &&
            typeof sweetLevel === 'string';
    }

    static isValidFeedbackInput(id: string, feedback: string, rating: string, mealType: string): boolean {
        return ValidationUtils.isValidItemId(id) &&
            typeof feedback === 'string' && feedback.trim().length > 0 &&
            !isNaN(parseInt(rating)) &&
            typeof mealType === 'string';
    }

    static isValidItemId(itemId: string): boolean {
        return typeof itemId === 'string' && itemId.trim().length > 0;
    }

    static isValidRecipeInput(id: string, dislikeReason: string, tasteExpectations: string, message: string): boolean {
        return ValidationUtils.isValidItemId(id) &&
            typeof dislikeReason === 'string' &&
            typeof tasteExpectations === 'string' &&
            typeof message === 'string';
    }
}
