import { Request, Response, NextFunction } from 'express';
import { db } from '../db';
import logger from '../logger';

export const getCatalogData = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    const requestId = Date.now().toString(36); // unique request trace ID
    logger.info(`[${requestId}] 📦 getCatalogData() called`);
    try {
        const [
            categoriesResult,
            finishTypesResult,
            occasionTypesResult,
        ] = await Promise.all([
            db.query(
                "SELECT category_id AS id, name FROM categories ORDER BY name"
            ),
            db.query(
                "SELECT finish_type_id AS id, name FROM finish_types ORDER BY name"
            ),
            db.query(
                "SELECT occasion_type_id AS id, name FROM occasion_types ORDER BY name"
            ),
        ]);

        res.status(200).json({
            categories: categoriesResult[0],
            finish_types: finishTypesResult[0],
            occasion_types: occasionTypesResult[0],
        });
    } catch (error) {
        logger.error(
            `[${requestId}] ❌ DB Error in getCatalogData(): ${(error as Error).message}`,
        );
        console.error("Error fetching catalog data:", error);
        // Standardized error response
        res.status(500).json({
            message: 'Database error while fetching catalogData',
            details: (error as Error).message,
        });
        next(error);
    }
};