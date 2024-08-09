export class DatabaseError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'DatabaseError';
    }
}

export class ProfileNotFoundError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'ProfileNotFoundError';
    }
}

export class VoteAlreadyCastError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'VoteAlreadyCastError';
    }

}

export class MenuItemNotFoundError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'MenuItemNotFoundError';
    }
}

export class NotificationError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'NotificationError';
    }
}

export class ItemNotFoundInDiscardListError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'ItemNotFoundInDiscardListError';
    }
}

export class ItemNotFoundError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'ItemNotFoundError';
    }
}

export class OperationNotAllowedError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'OperationNotAllowedError';
    }
}

export class InvalidChoiceError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'InvalidChoiceError';
    }
}

export class AuthenticationError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'AuthenticationError';
    }
}

export class RegistrationError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'RegistrationError';
    }
}

export class ItemOperationError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'ItemOperationError';
    }
}