export const EMPLOYEE_MENU_CONSTANTS = {
    title: 'Employee operations: ',
    options: [
        '|----------|----------------------------|',
        '|  Option  |       Description          |',
        '|----------|----------------------------|',
        '|    1     | See menu                   |',
        '|    2     | Vote for Menu              |',
        '|    3     | Provide feedback           |',
        '|    4     | View Feedback              |',
        '|    5     | View Notification          |',
        '|    6     | Create your Profile        |',
        '|    7     | Enter discard item Feedback|',
        '|    8     | Logout                     |',
        '|----------|----------------------------|',
    ],
    chooseOptionPrompt: 'Choose an option: ',
    invalidOption: 'Invalid option',
};

export const EmployeeMenuOptions = {
    seeMenu: '1',
    voteForMenu: '2',
    providingFeedback: '3',
    viewFeedbacks: '4',
    viewNotification: '5',
    makeProfile: '6',
    ownRecipe: '7',
    logOut: '8',
};

export const SOCKET_EVENTS = {
    VIEW_MENU: 'view_menu',
    VIEW_FEEDBACKS: 'view_feedbacks',
    VIEW_NOTIFICATION: 'viewNotification',
    SHOW_FINAL_LIST: 'show_finalList',
    ROLLOUT_MENU: 'rolloutMenu',
    GIVE_FEEDBACK: 'give_feedBack',
    DISCARD_ITEMS_LIST: 'discardItems_list',
    VOTE_FOR_MENU: 'vote_for_menu',
    CREATE_PROFILE: 'create_profile',
    GIVE_RECIPE: 'give_recipe',
};

export const QUESTION_PROMPTS = {
    DIET_CATEGORY: 'Are you vegetarian, non-vegetarian, or eggetarian?',
    SPICE_LEVEL: 'Do you prefer low, medium, or high spice levels?',
    AREA_PREFERENCE: 'Do you prefer North Indian or South Indian food?',
    SWEET_LEVEL: 'Do you like sweet foods?',
    ITEM_ID: 'Item id ',
    ITEM_FEEDBACK: 'Item feedback ',
    ITEM_RATING: 'Item rating ',
    MEAL_TYPE: 'Which type of meal -> ',
    MOMS_RECIPE_ID: 'Enter Id that you want to give moms recipe? ',
    DISLIKE_REASON: 'What didn’t you like about <Food Item>? ',
    TASTE_EXPECTATIONS: 'How would you like <Food Item> to taste? ',
    MOMS_RECIPE_MESSAGE: 'Share your mom’s recipe: ',
};

export const ERROR_MESSAGES = {
    RETRIEVE_MENU: 'Failed to retrieve menu: ',
    RETRIEVE_FEEDBACKS: 'Failed to retrieve feedbacks: ',
    RETRIEVE_NOTIFICATIONS: 'Failed to retrieve notifications: ',
    FINAL_LIST_EMPTY: 'Final list is empty there is no item for feedback',
    NO_ITEMS_FOR_VOTE: 'No Item For vote....',
    RETRIEVE_ROLLOUT: 'Rollout data retrieval failed: ',
    SUBMIT_FEEDBACK: 'Feedback not submitted: ',
    SHOW_DISCARD_LIST: 'Failed to show the discard list',
    SUBMIT_SUGGESTIONS: 'Failed',
};

export const SUCCESS_MESSAGES = {
    FEEDBACK_SUBMITTED: 'Feedback submitted successfully',
    SUBMIT_SUGGESTIONS:
        'Thank you! Your suggestions have been submitted successfully',
    RETRIEVE_ROLLOUT: 'Rollout data retrieval successful!',
    CREATE_PROFILE: 'Profile created successfully',
};

export const INFO_MESSAGES = {
    NOTIFICATION: ' Notification',
    FINAL_LIST: 'Final List',
    ROLLOUT_TABLE: '            Rollout Table Data:            ',
    DISCARD_LIST: 'Discard List',
};
