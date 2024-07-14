import { question } from '../../../utils/rl';
import { socket } from '../../../utils/socket';

export class EmployeeMenuHandlers {
    private parent: any;

    constructor(parent: any) {
        this.parent = parent;
        this.setupSocketListeners();
    }

    private setupSocketListeners() {
        socket.on('view_menu_response', this.handleViewMenuResponse.bind(this));
        socket.on(
            'view_feedbacks_response',
            this.handleViewFeedback.bind(this),
        );
        socket.on(
            'viewNotification_response',
            this.handleViewNotificationResponse.bind(this),
        );
        socket.on(
            'show_finalList_response',
            this.handleShowFinalListResponse.bind(this),
        );
        socket.on('rollout_response', this.handleRolloutResponse.bind(this));
        socket.on(
            'giveFeedback_response',
            this.handleGiveFeedbackResponse.bind(this),
        );
        socket.on('discard_response', this.handleDiscardResponse.bind(this));
        socket.on(
            'give_discard_response',
            this.handleGiveDiscardResponse.bind(this),
        );
        socket.on(
            'vote_for_menu_response',
            this.handleVoteForMenuResponse.bind(this),
        );
        socket.on(
            'create_profile_response',
            this.handleCreateProfileResponse.bind(this),
        );
        // socket.on(
        //     'discardItems_list_response',
        //     this.handleDiscardResponse.bind(this),
        // );
    }

    public seeMenu(userId: string) {
        socket.emit('view_menu', { userId });
    }

    public voteForMenu(userId: string) {
        console.log('inside the rollout');
        socket.emit('rolloutMenu', { userId });
    }

    public viewFeedbacks() {
        console.log('hiii');
        socket.emit('view_feedbacks');
    }

    public viewNotification(userId: string) {
        socket.emit('viewNotification', { userId });
    }

    public displayFinalMenu(userId: string) {
        socket.emit('finalizedMenu', { userId });
    }

    public async makeProfile(userId: string) {
        const diet_category = await question(
            'Are you vegetarian, non-vegetarian, or eggetarian?',
        );
        const spice_level = await question(
            'Do you prefer low, medium, or high spice levels?',
        );
        const area = await question(
            'Do you prefer North Indian or South Indian food?',
        );
        const sweet_level = await question('Do you like sweet foods?');

        socket.emit('create_profile', {
            userId,
            diet_category,
            spice_level,
            area,
            sweet_level,
        });
    }

    public async ownRecipe(userId: string) {
        console.log('hii ')
        socket.emit('discardItems_list', { userId });
    }

    public async providingFeedback(userId: string) {
        this.displayFinalMenu(userId);
    }

    public async giveFeedbackInput(userId: string) {
        const id = await question('Item id ');
        const feedback = await question('Item feedback ');
        const rating = await question('Item rating ');
        const mealType = await question('Which type of meal -> ');
        socket.emit('give_feedBack', {
            itemId: id,
            message: feedback,
            userId: userId,
            rating: rating,
            mealType: mealType,
        });
    }

    public async voteForItem(userId: string) {
        const itemId = await question('Enter Item Id that you want to vote:  ');
        socket.emit('vote_for_menu', { userId: userId, itemId: itemId });
    }
    public async submitMomsRecipe(userId: string) {
        const id = await question(
            'Enter Id that you want to give moms recipe? ',
        );
        const dislikeReason = await question(
            'What didn’t you like about <Food Item>? ',
        );
        const tasteExpectations = await question(
            'How would you like <Food Item> to taste? ',
        );
        const message = await question('Share your mom’s recipe: ');
        socket.emit('give_recipe', {
            userId: userId,
            id: id,
            dislikeReason: dislikeReason,
            tasteExpectations: tasteExpectations,
            message: message,
        });
    }

    private handleViewMenuResponse(data: any) {
        if (data.success) {
            console.table(data.menu);
        } else {
            console.log('Failed to retrieve menu: ' + data.message);
        }
        this.parent.employeeMenu(data.userId);
    }

    private handleViewFeedback(data: any) {
        console.log(data);
        if (data.success) {
            console.table(data.feedbacks);
        } else {
            console.log('Failed to retrieve feedbacks: ' + data.message);
        }
        this.parent.employeeMenu(data.userId);
    }

    private handleViewNotificationResponse(data: any) {
        if (data.success) {
            console.log(' Notification');
            console.table(data.notifications);
        } else {
            console.error(data.message);
        }
        this.parent.employeeMenu(data.userId);
    }

    private handleShowFinalListResponse(data: any) {
        console.log('Final List');
        if (data.success) {
            console.table(data.finalList);
            if (data.finalList.length > 0) {
                this.parent.handlers.giveFeedbackInput(data.userId);
                console.log(
                    'Final list is empty there is no item for feedback',
                );
            }
        } else {
            console.error(data.message);
        }
        this.parent.employeeMenu(data.userId);
    }

    private handleRolloutResponse(data: any) {
        if (data.success) {
            console.log('Rollout data retrieval successful!');
            if (data.rollOutData) {
                console.log('            Rollout Table Data:            ');
                console.table(data.rollOutData);
                if (data.rollOutData.length > 0) {
                    this.parent.handlers.voteForItem(data.userId);
                } else {
                    console.log('No Item For vote....');
                }
            }
        } else {
            console.error('Rollout data retrieval failed:', data.message);
        }
        this.parent.employeeMenu(data.userId);
    }

    private handleGiveFeedbackResponse(data: any) {
        if (data.success) {
            console.table(data.feedBack);
            console.log('Feedback submitted successfully');
        } else {
            console.error('Feedback not submitted:', data);
        }
    }

    private handleDiscardResponse(data: any) {
        if (data.success) {
            console.log('Discard List');
            console.table(data.discardedItems);
            if (data.discardedItems.length > 0) {
                this.parent.handlers.submitMomsRecipe(data.userId);
            } else {
                console.log('Discard list is empty!');
            }
        } else {
            console.error('Failed to show the discard list', data);
        }
    }

    private handleGiveDiscardResponse(data: any) {
        if (data.success) {
            console.log(
                'Thank you! Your suggestions have been submitted successfully',
            );
        } else {
            console.error('Failed', data);
        }
        this.parent.employeeMenu(data.userId);
    }

    private handleVoteForMenuResponse(data: any) {
        console.log(data);
        if (data.success) {
            console.log(data.message);
        } else {
            console.error(data.message);
        }
        this.parent.employeeMenu(data.userId);
    }

    private handleCreateProfileResponse(data: any) {
        if (data.success) {
            console.log('Your profile is created');
        } else {
            console.error(data.message);
        }
        this.parent.employeeMenu(data.userId);
    }
}
