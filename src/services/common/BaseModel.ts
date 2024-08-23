import { Document, Model, model, Schema } from "mongoose";
import { getAggregatedPaginatedData, getPaginatedData, mongooseAggregatePlugin, MongoosePaginateModel, mongoosePlugin, PaginatedData } from "mongoose-pagination-v2";

export interface GetPaginationParams {
    page?: number;
    limit?: number;
}

export interface GetAllParams extends GetPaginationParams {
    query?: object;
}

export interface GetAllAggregatedParams extends GetPaginationParams {
    query?: any[];
}

export interface PaginatedResult<T> {
    data: T[];
    pagination: any;
}

export default class BaseModel<T extends Document> {
    private model!: MongoosePaginateModel<T>;

    constructor(name: string, schema: Schema) {
        this.initializeModel(name, schema);
    }

    private initializeModel(name: string, schema: Schema): void {
        this.registerPlugins(schema);
        const model = this.compileModel(name, schema);
        this.setModel(model);
    }

    private registerPlugins(schema: Schema): void {
        schema.plugin(mongoosePlugin);
        schema.plugin(mongooseAggregatePlugin);
    }

    private compileModel(name: string, schema: Schema): Model<T> {
        return model<T>(name, schema);
    }

    private setModel(model: Model<T>): void {
        this.model = model;
    }

    // Create a document
    create(obj: Partial<T>): Promise<T> {
        return this.model.create(obj);
    }

    // Get a document by query
    getOne(query: any): Promise<T | null> {
        return this.model.findOne(query).exec();
    }

    // Get all documents with pagination
    async getAll({ query, page, limit }: GetAllParams): Promise<PaginatedData<T>> {
        const { data, pagination } = await getPaginatedData({
            model: this.model,
            query,
            page,
            limit
        });

        return { data, pagination };
    }

    // Get all documents with aggregation and pagination
    async getAllAggregated({ query, page, limit }: GetAllAggregatedParams): Promise<PaginatedData<T>> {
        const { data, pagination } = await getAggregatedPaginatedData({
            model: this.model,
            query,
            page,
            limit,
        });

        return { data: data as T[], pagination };
    }

    // Update a document by ID
    updateById(id: string, obj: Partial<T>): Promise<T | null> {
        return this.model.findByIdAndUpdate(id, obj, { new: true }).exec();
    }

    // Delete a document by ID
    deleteById(id: string): Promise<T | null> {
        return this.model.findByIdAndDelete(id).exec();
    }
}
