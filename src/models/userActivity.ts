//Interface representing the activity of user
export interface UserActivity {
    username: string;
    activityType: 'login' | 'logout';
}
