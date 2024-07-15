import { question } from '../../../utils/rl';
import { socket } from '../../../utils/socket';
import { CHEF_MENU_CONSTANTS } from './constant';

export class ChefMenuHandlers {
    private parent: any;

    constructor(parent: any) {
        this.parent = parent;
        this.setupSocketListeners();
    }

    private setupSocketListeners() {
        socket.on(
            'create_rollout_response',
            this.handleCreateRolloutResponse.bind(this),
        );
        socket.on('see_menu_response', this.handleMenuResponse.bind(this));
        socket.on(
            'see_feedback_response',
            this.handleFeedbackResponse.bind(this),
        );
        socket.on(
            'discard_response_chef',
            this.handleDiscardResponse.bind(this),
        );
        socket.on(
            'finalizedMenu_response',
            this.handleFinalizedMenuResponse.bind(this),
        );
        socket.on(
            'get_recommendation_response',
            this.handleRecommendationResponse.bind(this),
        );
        socket.on(
            'modify_discard_list_response',
            this.handleModifyDiscardListResponse.bind(this),
        );
    }

    public async menuRollOut() {
        const menuType = await question(
            CHEF_MENU_CONSTANTS.rolledOutMenuPrompt,
        );
        socket.emit('create_rollout', { menuType });
    }

    public finalizedMenu() {
        socket.emit('selectedMenu');
    }

    public discardItemList() {
        socket.emit('allDiscardedItems');
    }

    public viewMenu() {
        socket.emit('see_menu');
    }

    public async modifyDiscardList() {
        const choice = await question(
            CHEF_MENU_CONSTANTS.modifyDiscardList.choicePrompt,
        );
        const id = await question(
            CHEF_MENU_CONSTANTS.modifyDiscardList.idPrompt,
        );

        if (choice === 'menu' || choice === 'discard') {
            socket.emit('modifyDiscardList', { choice, id });
        } else {
            console.log(CHEF_MENU_CONSTANTS.modifyDiscardList.invalidChoice);
            await this.modifyDiscardList();
        }
    }

    public seeFeedback() {
        socket.emit('see_feedback');
    }

    private handleCreateRolloutResponse(data: any) {
        if (data.success) {
            if (data.rolledOutMenu) {
                console.log(
                    CHEF_MENU_CONSTANTS.successMessages
                        .handleCreateRolloutResponse,
                );
                console.table(data.rolledOutMenu);
            }
        } else {
            console.log(
                CHEF_MENU_CONSTANTS.failureMessages
                    .handleCreateRolloutResponse + data.message,
            );
        }
        this.parent.chefMenu();
    }

    private handleMenuResponse(data: any) {
        if (data.success) {
            console.table(data.menu);
        } else {
            console.error(data.message);
        }
        this.parent.chefMenu();
    }

    private handleFeedbackResponse(data: any) {
        if (data.success) {
            console.table(data.itemFeedback);
        } else {
            console.log(
                CHEF_MENU_CONSTANTS.failureMessages.handleFeedbackResponse +
                    data.message,
            );
        }
        this.parent.chefMenu();
    }

    private handleDiscardResponse(data: any) {
        if (data.success) {
            console.table(data.message);
            console.log(data.discardItems);
        } else {
            console.log(
                CHEF_MENU_CONSTANTS.failureMessages.handleDiscardResponse +
                    data.message,
            );
        }
        this.parent.chefMenu();
    }

    private handleFinalizedMenuResponse(data: any) {
        if (data.success) {
            console.table(data.message);
        } else {
            console.log(
                CHEF_MENU_CONSTANTS.failureMessages
                    .handleFinalizedMenuResponse + data.message,
            );
        }
        this.parent.chefMenu();
    }

    private handleRecommendationResponse(data: any) {
        if (data.success) {
            console.table(data.message);
        } else {
            console.log(
                CHEF_MENU_CONSTANTS.failureMessages
                    .handleRecommendationResponse + data.message,
            );
        }
        this.parent.chefMenu();
    }

    private handleModifyDiscardListResponse(data: any) {
        console.log(data.message);
        this.parent.chefMenu();
    }
}
