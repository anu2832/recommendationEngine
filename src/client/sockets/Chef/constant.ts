export const CHEF_MENU_CONSTANTS = {
    title: 'Chef operations:',
    separator: '---------------------------------------',
    options: [
        '|  Option  |       Description         |',
        '|    1     |   View Menu               |',
        '|    2     |   RollOut Menu            |',
        '|    3     |   Finalize Menu           |',
        '|    4     |   List of Discarded items |',
        '|    5     |   Modify Discard List     |',
        '|    6     |   See feedback            |',
        '|    7     |   Logout                  |',
    ],
    chooseOptionPrompt: 'Choose an option: ',
    invalidOption: 'Invalid option',
    rolledOutMenuPrompt: 'Rolled Out menu:',
    modifyDiscardList: {
        choicePrompt:
            'Do you want to delete item from menu or discard list? (menu/discard)',
        idPrompt: 'Enter the itemId for the above operation',
        invalidChoice: 'Invalid choice, Please enter "menu" or "discard".',
    },
    successMessages: {
        handleCreateRolloutResponse: 'Menu rolled out successfully.',
        handleFeedbackResponse: 'Feedback retrieved successfully.',
        handleDiscardResponse: 'Discard List created successfully.',
        handleFinalizedMenuResponse: 'Finalized menu displayed successfully.',
        handleRecommendationResponse: 'RolledOver menu displayed successfully.',
    },
    failureMessages: {
        handleCreateRolloutResponse: 'Failed to rollout: ',
        handleFeedbackResponse: 'Failed to retrieve feedbacks: ',
        handleDiscardResponse: 'Failed to create Discard List: ',
        handleFinalizedMenuResponse: 'Failed to show finalized menu: ',
        handleRecommendationResponse: 'Failed to show the rolledOver menu: ',
    },
};
