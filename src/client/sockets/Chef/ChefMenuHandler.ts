import { question } from '../../../utils/ReadLineInput';
import { socket } from '../../../utils/socket';
import { CHEF_MENU_CONSTANTS } from './ChefConstants';
import {
    RolloutResponse,
    MenuResponse,
    FeedbackResponse,
    DiscardResponse,
    FinalizedMenuResponse,
    RecommendationResponse,
    ModifyDiscardListResponse
} from './IChefInterface';

export class ChefMenuHandlers {
    private parent: any;

    constructor(parent: any) {
        this.parent = parent;
        this.setupSocketListeners();
    }

    private setupSocketListeners() {
        socket.on('create_rollout_response', this.handleCreateRolloutResponse.bind(this));
        socket.on('see_menu_response', this.handleMenuResponse.bind(this));
        socket.on('see_feedback_response', this.handleFeedbackResponse.bind(this));
        socket.on('discard_response_chef', this.handleDiscardResponse.bind(this));
        socket.on('finalizedMenu_response', this.handleFinalizedMenuResponse.bind(this));
        socket.on('get_recommendation_response', this.handleRecommendationResponse.bind(this));
        socket.on('modify_discard_list_response', this.handleModifyDiscardListResponse.bind(this));
    }

    public async menuRollOut(): Promise<void> {
        const menuType = await question(CHEF_MENU_CONSTANTS.rolledOutMenuPrompt);
        socket.emit('create_rollout', { menuType });
    }

    public finalizedMenu(): void {
        socket.emit('selectedMenu');
    }

    public discardItemList(): void {
        socket.emit('allDiscardedItems');
    }

    public viewMenu(): void {
        socket.emit('see_menu');
    }

    public async modifyDiscardList(): Promise<void> {
        const choice = await question(CHEF_MENU_CONSTANTS.modifyDiscardList.choicePrompt);
        const id = await question(CHEF_MENU_CONSTANTS.modifyDiscardList.idPrompt);

        if (choice === 'menu' || choice === 'discard') {
            socket.emit('modifyDiscardList', { choice, id });
        } else {
            console.log(CHEF_MENU_CONSTANTS.modifyDiscardList.invalidChoice);
            await this.modifyDiscardList();
        }
    }

    public seeFeedback(): void {
        socket.emit('see_feedback');
    }

    private handleCreateRolloutResponse(data: RolloutResponse): void {
        if (data.success) {
            if (data.rolledOutMenu) {
                console.log(CHEF_MENU_CONSTANTS.successMessages.handleCreateRolloutResponse);
                console.table(data.rolledOutMenu);
            }
        } else {
            console.log(CHEF_MENU_CONSTANTS.failureMessages.handleCreateRolloutResponse + data.message);
        }
        this.parent.chefMenu();
    }

    private handleMenuResponse(data: MenuResponse): void {
        if (data.success) {
            if (data.menu) {
                console.table(data.menu);
            } else {
                console.log('Menu data is missing.\n');
            }
        } else {
            console.error(data.message);
        }
        this.parent.chefMenu();
    }

    private handleFeedbackResponse(data: FeedbackResponse): void {
        if (data.success) {
            if (data.itemFeedback) {
                console.table(data.itemFeedback);
            } else {
                console.log('Feedback data is missing.\n');
            }
        } else {
            console.log(CHEF_MENU_CONSTANTS.failureMessages.handleFeedbackResponse + data.message);
        }
        this.parent.chefMenu();
    }

    private handleDiscardResponse(data: DiscardResponse): void {
        if (data.success) {
            console.table(data.message);
            if (data.discardItems) {
                console.log(data.discardItems);
            } else {
                console.log('Discard items data is missing.\n');
            }
        } else {
            console.log(CHEF_MENU_CONSTANTS.failureMessages.handleDiscardResponse + data.message);
        }
        this.parent.chefMenu();
    }

    private handleFinalizedMenuResponse(data: FinalizedMenuResponse): void {
        if (data.success) {
            console.table(data.message);
        } else {
            console.log(CHEF_MENU_CONSTANTS.failureMessages.handleFinalizedMenuResponse + data.message);
        }
        this.parent.chefMenu();
    }

    private handleRecommendationResponse(data: RecommendationResponse): void {
        if (data.success) {
            console.table(data.message);
        } else {
            console.log(CHEF_MENU_CONSTANTS.failureMessages.handleRecommendationResponse + data.message);
        }
        this.parent.chefMenu();
    }

    private handleModifyDiscardListResponse(data: ModifyDiscardListResponse): void {
        console.log(data.message);
        this.parent.chefMenu();
    }
}
