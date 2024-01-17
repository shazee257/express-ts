export interface IUser {
    _id?: string;
    name?: string;
    email: string;
    role: string;
    password?: string;
    fcmToken?: string;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface IPaginationResult<T> {
    data: T[];
    pagination: {
        totalItems: number;
        perPage: number;
        totalPages: number;
        currentPage: number;
        hasPrevPage: boolean;
        hasNextPage: boolean;
        prevPage: number | null;
        nextPage: number | null;
    };
}