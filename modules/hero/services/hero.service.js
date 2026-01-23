import { AppError } from '../../../lib/response.js';
import * as heroRepository from '../repositories/hero.repository.js';
import { validateHeroData, createHeroSchema, updateHeroSchema } from '../validators/hero.validator.js';
import logger from '../../../lib/logger.js';
import Uploads from '../../../lib/upload/uploads.js';
import { createWithUpload, updateWithUpload } from '../../../lib/upload/transactionalUpload.js';
import { prisma } from '../../../lib/prisma.js';

/**
 * Get all hero sections with pagination
 * @param {Object} options - Query options
 * @returns {Promise<Object>}
 */
export async function getAllHeroes(options = {}) {
  try {
    const result = await heroRepository.findAllHeroes(options);
    return result;
  } catch (error) {
    logger.error('Error in getAllHeroes service', { error: error.message });
    throw new AppError('Failed to fetch heroes', 500);
  }
}

/**
 * Get hero by ID
 * @param {number} id
 * @returns {Promise<Object>}
 */
export async function getHeroById(id) {
  const hero = await heroRepository.findHeroById(id);
  
  if (!hero) {
    throw new AppError('Hero not found', 404);
  }
  
  return hero;
}

/**
 * Get active hero section (public)
 * @returns {Promise<Object|null>}
 */
export async function getActiveHero() {
  try {
    const hero = await heroRepository.findActiveHero();
    return hero;
  } catch (error) {
    logger.error('Error in getActiveHero service', { error: error.message });
    throw new AppError('Failed to fetch active hero', 500);
  }
}

/**
 * Create new hero section
 * @param {Object} data - Hero data
 * @returns {Promise<Object>}
 */
export async function createHero(data) {
  // Validate input
  let validatedData;
  try {
    validatedData = validateHeroData(data, createHeroSchema);
  } catch (error) {
    // Log incoming payload together with validation errors for easier debugging
    logger.warn('Hero validation failed', { payload: data, error: error.errors });
    throw new AppError(
      error.errors?.[0]?.message || 'Invalid hero data',
      400,
      'VALIDATION_ERROR'
    );
  }

  try {
    const hero = await heroRepository.createHero(validatedData);
    logger.info('Hero created successfully', { heroId: hero.id, isActive: hero.isActive });
    return hero;
  } catch (error) {
    logger.error('Error creating hero', { error: error.message });
    throw new AppError('Failed to create hero', 500);
  }
}

/**
 * Update hero section
 * @param {number} id
 * @param {Object} data - Updated hero data
 * @returns {Promise<Object>}
 */
export async function updateHero(id, data) {
  // Check if hero exists
  await getHeroById(id);

  // Validate input
  let validatedData;
  try {
    validatedData = validateHeroData(data, updateHeroSchema);
  } catch (error) {
    logger.warn('Hero update validation failed', { heroId: id, error: error.errors });
    throw new AppError(
      error.errors?.[0]?.message || 'Invalid hero data',
      400,
      'VALIDATION_ERROR'
    );
  }

  // Remove undefined fields
  const updateData = Object.fromEntries(
    Object.entries(validatedData).filter(([_, value]) => value !== undefined)
  );

  if (Object.keys(updateData).length === 0) {
    throw new AppError('No valid fields to update', 400);
  }

  try {
    const hero = await heroRepository.updateHero(id, updateData);
    logger.info('Hero updated successfully', { heroId: id, updatedFields: Object.keys(updateData) });
    return hero;
  } catch (error) {
    logger.error('Error updating hero', { heroId: id, error: error.message });
    throw new AppError('Failed to update hero', 500);
  }
}

/**
 * Delete hero section
 * @param {number} id
 * @returns {Promise<void>}
 */
export async function deleteHero(id) {
  // Check if hero exists
  await getHeroById(id);

  try {
    // Attempt to delete associated file if any
    try {
      const hero = await heroRepository.findHeroById(id);
      if (hero && hero.source) {
        const uploads = new Uploads();
        try {
          await uploads.deleteFile(hero.source);
          logger.info('Deleted hero media file', { heroId: id, source: hero.source });
        } catch (err) {
          logger.warn('Failed to delete hero media file, continuing with DB delete', { heroId: id, source: hero.source, error: err.message });
        }
      }
    } catch (err) {
      logger.warn('Could not lookup hero media before delete', { heroId: id, error: err.message });
    }

    await heroRepository.deleteHero(id);
    logger.info('Hero deleted successfully', { heroId: id });
  } catch (error) {
    logger.error('Error deleting hero', { heroId: id, error: error.message });
    throw new AppError('Failed to delete hero', 500);
  }
}

/**
 * Set hero as active (deactivate all others)
 * @param {number} id
 * @returns {Promise<Object>}
 */
export async function setActiveHero(id) {
  const hero = await getHeroById(id);

  if (hero.isActive) {
    return hero; // Already active
  }

  try {
    const updatedHero = await heroRepository.updateHero(id, { isActive: true });
    logger.info('Hero set as active', { heroId: id });
    return updatedHero;
  } catch (error) {
    logger.error('Error setting hero as active', { heroId: id, error: error.message });
    throw new AppError('Failed to activate hero', 500);
  }
}

/**
 * Create hero with file upload (transactional pattern)
 * 1. Validate input (without source requirement)
 * 2. Insert DB record with placeholder source
 * 3. Upload file
 * 4. Update DB with uploaded file URL
 * 5. Rollback DB if upload fails
 * 
 * @param {Object} data - Hero data (title, description, isActive)
 * @param {Object} file - File object from formidable
 * @returns {Promise<Object>} - Created hero with uploaded file URL
 */
export async function createHeroWithFile(data, file) {
  // Validate input (omit source requirement since file will provide it)
  const schema = createHeroSchema.omit({ source: true });
  let validated;
  try {
    validated = validateHeroData(data, schema);
  } catch (error) {
    logger.warn('Hero validation failed (with file)', { payload: data, error: error.errors });
    throw new AppError(
      error.errors?.[0]?.message || 'Invalid hero data',
      400,
      'VALIDATION_ERROR'
    );
  }

  const uploads = new Uploads();

  return createWithUpload(
    {
      createRecord: async () => {
        // Insert DB record in transaction (deactivate others if needed)
        return prisma.$transaction(async (tx) => {
          if (validated.isActive) {
            await tx.heroSection.updateMany({
              where: { isActive: true },
              data: { isActive: false },
            });
          }
          return tx.heroSection.create({
            data: {
              title: validated.title,
              description: validated.description,
              isActive: validated.isActive || false,
              source: '', // Placeholder (Prisma requires non-null)
            },
          });
        });
      },
      uploadFile: async (file) => uploads.handleUpload(file),
      updateSource: async (id, url) =>
        prisma.heroSection.update({
          where: { id },
          data: { source: url },
        }),
      deleteRecord: async (id) =>
        prisma.heroSection.delete({ where: { id } }),
    },
    file
  );
}

/**
 * Update hero with file upload (transactional pattern)
 * 1. Validate input
 * 2. Get existing record (for revert and old file cleanup)
 * 3. Update DB record (without source)
 * 4. Upload new file
 * 5. Update DB with new file URL
 * 6. Delete old file
 * 7. Rollback DB if upload fails
 * 
 * @param {number} id - Hero ID
 * @param {Object} data - Update data (title, description, isActive)
 * @param {Object} file - File object from formidable
 * @returns {Promise<Object>} - Updated hero with new file URL
 */
export async function updateHeroWithFile(id, data, file) {
  // Validate input (omit source requirement)
  const schema = updateHeroSchema.omit({ source: true });
  let validated;
  try {
    validated = validateHeroData(data, schema);
  } catch (error) {
    logger.warn('Hero update validation failed (with file)', { heroId: id, payload: data, error: error.errors });
    throw new AppError(
      error.errors?.[0]?.message || 'Invalid hero data',
      400,
      'VALIDATION_ERROR'
    );
  }

  // Remove undefined fields
  const updateData = Object.fromEntries(
    Object.entries(validated).filter(([_, value]) => value !== undefined)
  );

  if (Object.keys(updateData).length === 0) {
    throw new AppError('No valid fields to update', 400);
  }

  const uploads = new Uploads();

  return updateWithUpload(
    {
      getExisting: async (id) => {
        const hero = await prisma.heroSection.findUnique({ where: { id } });
        if (!hero) throw new AppError('Hero not found', 404);
        return hero;
      },
      updateRecord: async (id, data) => {
        // Update DB in transaction (handle isActive logic)
        return prisma.$transaction(async (tx) => {
          if (data.isActive) {
            await tx.heroSection.updateMany({
              where: { isActive: true, id: { not: id } },
              data: { isActive: false },
            });
          }
          return tx.heroSection.update({
            where: { id },
            data,
          });
        });
      },
      uploadFile: async (file) => uploads.handleUpload(file),
      updateSource: async (id, url) =>
        prisma.heroSection.update({
          where: { id },
          data: { source: url },
        }),
      revertRecord: async (id, snapshot) => {
        // Revert to previous state
        await prisma.$transaction(async (tx) => {
          await tx.heroSection.update({
            where: { id },
            data: {
              title: snapshot.title,
              description: snapshot.description,
              isActive: snapshot.isActive,
              source: snapshot.source,
            },
          });
          // Restore previous active heroes
          if (snapshot.isActive) {
            await tx.heroSection.updateMany({
              where: { isActive: true, id: { not: id } },
              data: { isActive: false },
            });
          }
        });
      },
      deleteFile: async (url) => uploads.deleteFile(url),
    },
    id,
    updateData,
    file
  );
}
