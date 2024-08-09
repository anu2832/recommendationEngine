// ItemValidations.ts

export function isValidPrice(price: string): boolean {
    return !isNaN(parseFloat(price)) && parseFloat(price) > 0;
}

export function isValidAvailability(availability: string): boolean {
    return ['available', 'not available'].includes(availability.toLowerCase());
}

export function isValidMealTime(mealTime: string): boolean {
    return ['breakfast', 'lunch', 'dinner'].includes(mealTime.toLowerCase());
}

export function isValidDietCategory(dietCategory: string): boolean {
    return ['veg', 'non-veg', 'eggetarian'].includes(dietCategory.toLowerCase());
}

export function isValidSpiceLevel(spiceLevel: string): boolean {
    return ['low', 'medium', 'high'].includes(spiceLevel.toLowerCase());
}

export function isValidRegion(region: string): boolean {
    return ['north', 'south'].includes(region.toLowerCase());
}

export function isValidSweetDish(sweetDish: string): boolean {
    return ['yes', 'no'].includes(sweetDish.toLowerCase());
}
