import { question } from '../../../utils/ReadLineInput';
import { socket } from '../../../utils/socket';
import { ValidationUtils } from './EmployeeInputValidator';
import {
    MenuResponse,
    FeedbackResponse,
    NotificationResponse,
    FinalListResponse,
    RolloutResponse,
    FeedbackSubmissionResponse,
    DiscardResponse,
    GiveDiscardResponse,
    VoteForMenuResponse,
    CreateProfileResponse,
    RecipeSubmissionResponse
} from './IEmployeeInterface';

export class EmployeeMenuHandlers {
    private parent: any;

    constructor(parent: any) {
        this.parent = parent;
        this.setupSocketListeners();
    }

    private setupSocketListeners() {
        socket.on('view_menu_response', this.handleViewMenuResponse.bind(this));
        socket.on('view_feedbacks_response', this.handleViewFeedback.bind(this));
        socket.on('viewNotification_response', this.handleViewNotificationResponse.bind(this));
        socket.on('show_finalList_response', this.handleShowFinalListResponse.bind(this));
        socket.on('rollout_response', this.handleRolloutResponse.bind(this));
        socket.on('giveFeedback_response', this.handleGiveFeedbackResponse.bind(this));
        socket.on('discard_response', this.handleDiscardResponse.bind(this));
        socket.on('give_discard_response', this.handleGiveDiscardResponse.bind(this));
        socket.on('vote_for_menu_response', this.handleVoteForMenuResponse.bind(this));
        socket.on('create_profile_response', this.handleCreateProfileResponse.bind(this));
    }

    public seeMenu(userId: string) {
        socket.emit('view_menu', { userId });
    }

    public voteForMenu(userId: string) {
        socket.emit('rolloutMenu', { userId });
    }

    public viewFeedbacks() {
        socket.emit('view_feedbacks');
    }

    public viewNotification(userId: string) {
        socket.emit('viewNotification', { userId });
    }

    public displayFinalMenu(userId: string) {
        socket.emit('finalizedMenu', { userId });
    }

    public async makeProfile(userId: string): Promise<void>  {
        const diet_category = await question('Are you vegetarian, non-vegetarian, or eggetarian? ');
        const spice_level = await question('Do you prefer low, medium, or high spice levels? ');
        const area = await question('Do you prefer North Indian or South Indian food? ');
        const sweet_level = await question('Do you like sweet foods? ');

        if (!ValidationUtils.isValidProfileInput(diet_category as string, spice_level as string, area as string, sweet_level as string)) {
            console.error('Provide right input for above Question !\n');
            return this.makeProfile(userId);
        }

        socket.emit('create_profile', {
            userId,
            diet_category,
            spice_level,
            area,
            sweet_level,
        });
    }

    public async ownRecipe(userId: string) {
        socket.emit('discardItems_list', { userId });
    }

    public async providingFeedback(userId: string) {
        await this.displayFinalMenu(userId);
    }

    public async giveFeedbackInput(userId: string) {
        const id = await question('Item id ');
        const feedback = await question('Item feedback ');
        const rating = await question('Item rating ');
        const mealType = await question('Which type of meal -> ');

        if (!ValidationUtils.isValidFeedbackInput(id as string, feedback as string, rating as string, mealType as string)) {
            console.error('Invalid feedback input. \n');
            return;
        }
        
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

        if (!ValidationUtils.isValidItemId(itemId as string)) {
            console.error('Invalid Item ID. ');
            return;
        }

        socket.emit('vote_for_menu', { userId, itemId });
    }

    public async submitMomsRecipe(userId: string) {
        const id = await question('Enter Id that you want to give mom\'s recipe? ');
        const dislikeReason = await question('What didn’t you like about <Food Item>? ');
        const tasteExpectations = await question('How would you like <Food Item> to taste? ');
        const message = await question('Share your mom’s recipe: ');

        if (!ValidationUtils.isValidRecipeInput(id as string, dislikeReason as string, tasteExpectations as string, message as string)) {
            console.error('Invalid recipe input. \n');
            return;
        }

        socket.emit('give_recipe', {
            userId,
            id,
            dislikeReason,
            tasteExpectations,
            message,
        });
    }

    private handleViewMenuResponse(data: MenuResponse) {
        if (data.success) {
            if (data.menu) {
                console.table(data.menu);
            } else {
                console.error('Menu data is missing.\n');
            }
        } else {
            console.error('Failed to retrieve menu: ' + data.message);
        }
        this.parent.employeeMenu(data.userId);
    }

    private handleViewFeedback(data: FeedbackResponse) {
        if (data.success) {
            if (data.feedbacks) {
                console.table(data.feedbacks);
            } else {
                console.error('Feedback data is missing.\n');
            }
        } else {
            console.error('Failed to retrieve feedbacks: ' + data.message);
        }
        this.parent.employeeMenu(data.userId);
    }

    private handleViewNotificationResponse(data: NotificationResponse) {
        if (data.success) {
            if (data.notifications) {
                console.table(data.notifications);
            } else {
                console.error('Notification data is missing. \n');
            }
        } else {
            console.error(data.message);
        }
        this.parent.employeeMenu(data.userId);
    }

    private handleShowFinalListResponse(data: FinalListResponse) {
        if (data.success) {
            if (data.finalList) {
                console.table(data.finalList);
                if (data.finalList.length > 0) {
                    this.parent.handlers.giveFeedbackInput(data.userId);
                }
            } else {
                console.error('Final list data is missing.\n');
                this.parent.employeeMenu(data.userId);
            }
        } else {
            console.error(data.message);
            this.parent.employeeMenu(data.userId);
        }
    }

    private handleRolloutResponse(data: RolloutResponse) {
        if (data.success) {
            if (data.rollOutData) {
                console.table(data.rollOutData);
                if (data.rollOutData.length > 0) {
                    this.parent.handlers.voteForItem(data.userId);
                } else {
                    console.log('No Item For vote.... \n');
                    this.parent.employeeMenu(data.userId);
                }
            } else {
                console.error('Rollout data is missing. \n');
                this.parent.employeeMenu(data.userId);
            }
        } else {
            console.error('Rollout data retrieval failed: ' + data.message);
            this.parent.employeeMenu(data.userId);
        }
    }

    private handleGiveFeedbackResponse(data: FeedbackSubmissionResponse) {
        if (data.success) {
            if (data.feedBack) {
                console.table(data.feedBack);
                console.log('Feedback submitted successfully \n');
            } else {
                console.error('Feedback data is missing. \n');
            }
        } else {
            console.error('Feedback not submitted: ' + data.message);
        }
        this.parent.employeeMenu(data.userId);
    }

    private handleDiscardResponse(data: DiscardResponse) {
        if (data.success) {
            if (data.discardedItems) {
                console.table(data.discardedItems);
                if (data.discardedItems.length > 0) {
                    this.parent.handlers.submitMomsRecipe(data.userId);
                } else {
                    console.log('Discard list is empty! \n');
                    this.parent.employeeMenu(data.userId);
                }
            } else {
                console.error('Discarded items data is missing. \n');
                this.parent.employeeMenu(data.userId);
            }
        } else {
            console.error('Failed to show the discard list: ' + data.message);
            this.parent.employeeMenu(data.userId);
        }
    }

    private handleGiveDiscardResponse(data: GiveDiscardResponse) {
        if (data.success) {
            console.log('Thank you! Your suggestions have been submitted successfully \n');
        } else {
            console.error('Failed to submit suggestions: ' + data.message);
        }
        this.parent.employeeMenu(data.userId);
    }

    private handleVoteForMenuResponse(data: VoteForMenuResponse) {
        if (data.success) {
            console.log(data.message);
        } else {
            console.error(data.message);
        }
        this.parent.employeeMenu(data.userId);
    }

    private handleCreateProfileResponse(data: CreateProfileResponse) {
        if (data.success) {
            console.log(data.message);
        } else {
            console.error(data.message);
        }
        this.parent.employeeMenu(data.userId);
    }
}
