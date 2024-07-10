import { question } from '../../../utils/rl';
import { socket } from '../../../utils/socket';

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
        const menuType = await question('Rolled Out menu:');
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
            'Do you want to delete item from menu or discard list? (menu/discard)',
        );
        const id = await question('Enter the itemId for the above operation');

        if (choice === 'menu' || choice === 'discard') {
            socket.emit('modifyDiscardList', { choice, id });
        } else {
            console.log(`Invalid choice, Please enter "menu" or "discard".`);
            await this.modifyDiscardList();
        }
    }

    public seeFeedback() {
        socket.emit('see_feedback');
    }

    private handleCreateRolloutResponse(data: any) {
        if (data.success) {
            if (data.rolledOutMenu) {
                console.log(data.message);
                console.table(data.rolledOutMenu);
            }
        } else {
            console.log('Failed to rollout: ' + data.message);
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
            console.log('Failed to retrieve feedbacks: ' + data.message);
        }
        this.parent.chefMenu();
    }

    private handleDiscardResponse(data: any) {
        if (data.success) {
            console.table(data.message);
            console.log(data.discardItems);
        } else {
            console.log('Failed to create Discard List: ' + data.message);
        }
        this.parent.chefMenu();
    }

    private handleFinalizedMenuResponse(data: any) {
        if (data.success) {
            console.table(data.message);
        } else {
            console.log('Failed to show finalized menu: ' + data.message);
        }
        this.parent.chefMenu();
    }

    private handleRecommendationResponse(data: any) {
        if (data.success) {
            console.table(data.message);
        } else {
            console.log('Failed to show the rolledOver menu: ' + data.message);
        }
        this.parent.chefMenu();
    }

    private handleModifyDiscardListResponse(data: any) {
        console.log(data.message);
        this.parent.chefMenu();
    }
}
