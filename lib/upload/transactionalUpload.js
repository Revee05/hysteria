import logger from '../logger.js';

/**
 * Create with upload pattern:
 * 1. Insert DB record first (with placeholder/empty source)
 * 2. Upload file
 * 3. Update DB with file URL
 * 4. If upload fails, delete DB record (rollback)
 * 
 * @param {Object} options
 * @param {Function} options.createRecord - async () => createdRecord (should return record with id)
 * @param {Function} options.uploadFile - async (file) => { url, ... }
 * @param {Function} options.updateSource - async (id, url) => updatedRecord
 * @param {Function} options.deleteRecord - async (id) => void
 * @param {Object} file - File to upload
 * @returns {Promise<Object>} - Final record with uploaded file URL
 */
export async function createWithUpload({ createRecord, uploadFile, updateSource, deleteRecord }, file) {
  // Step 1: Insert DB record first
  let created;
  try {
    created = await createRecord();
  } catch (dbErr) {
    logger.error('createWithUpload: DB insert failed', { error: dbErr && (dbErr.stack || dbErr.message) });
    throw dbErr;
  }

  // Step 2: Upload file
  let uploadResult;
  try {
    uploadResult = await uploadFile(file);
  } catch (uploadErr) {
    logger.error('createWithUpload: File upload failed after DB insert, removing record', {
      error: uploadErr && (uploadErr.stack || uploadErr.message),
      recordId: created?.id,
    });
    
    // Rollback: delete DB record
    try {
      if (created && created.id != null) {
        await deleteRecord(created.id);
        logger.info('createWithUpload: Successfully rolled back DB record after upload failure', { recordId: created.id });
      }
    } catch (delErr) {
      logger.error('createWithUpload: Failed to delete record after upload failure', {
        error: delErr && (delErr.stack || delErr.message),
        recordId: created?.id,
      });
    }
    
    throw uploadErr;
  }

  // Step 3: Update DB with file URL
  try {
    const updated = await updateSource(created.id, uploadResult.url);
    logger.info('createWithUpload: Successfully created record with uploaded file', { recordId: created.id, url: uploadResult.url });
    return updated;
  } catch (updateErr) {
    logger.error('createWithUpload: Failed to update source URL after upload', {
      error: updateErr && (updateErr.stack || updateErr.message),
      recordId: created.id,
    });
    throw updateErr;
  }
}

/**
 * Update with upload pattern:
 * 1. Get existing record (for revert and old file cleanup)
 * 2. Update DB record (without changing source)
 * 3. Upload new file
 * 4. Update DB with new file URL
 * 5. Delete old file
 * 6. If upload fails, revert DB changes
 * 
 * @param {Object} options
 * @param {Function} options.getExisting - async (id) => existingRecord
 * @param {Function} options.updateRecord - async (id, data) => updatedRecord (data excludes source)
 * @param {Function} options.uploadFile - async (file) => { url, ... }
 * @param {Function} options.updateSource - async (id, url) => updatedRecord
 * @param {Function} options.revertRecord - async (id, snapshot) => void
 * @param {Function} options.deleteFile - async (url) => void
 * @param {number} id - Record ID to update
 * @param {Object} data - Update data (excludes source)
 * @param {Object} file - New file to upload
 * @returns {Promise<Object>} - Final updated record
 */
export async function updateWithUpload({ getExisting, updateRecord, uploadFile, updateSource, revertRecord, deleteFile }, id, data, file) {
  // Step 1: Get existing record for revert and old file cleanup
  let existing;
  try {
    existing = await getExisting(id);
  } catch (err) {
    logger.error('updateWithUpload: Failed to get existing record', { error: err && (err.stack || err.message), id });
    throw err;
  }

  // Step 2: Update DB record (without source)
  let updated;
  try {
    updated = await updateRecord(id, data);
  } catch (dbErr) {
    logger.error('updateWithUpload: DB update failed', { error: dbErr && (dbErr.stack || dbErr.message), id });
    throw dbErr;
  }

  // Step 3: Upload new file
  let uploadResult;
  try {
    uploadResult = await uploadFile(file);
  } catch (uploadErr) {
    logger.error('updateWithUpload: File upload failed after DB update, attempting revert', {
      error: uploadErr && (uploadErr.stack || uploadErr.message),
      id,
    });
    
    // Rollback: revert DB changes
    try {
      await revertRecord(id, existing);
      logger.info('updateWithUpload: Successfully reverted DB record after upload failure', { id });
    } catch (revertErr) {
      logger.error('updateWithUpload: Failed to revert record after upload failure', {
        error: revertErr && (revertErr.stack || revertErr.message),
        id,
      });
    }
    
    throw uploadErr;
  }

  // Step 4: Update DB with new file URL
  try {
    const final = await updateSource(id, uploadResult.url);
    
    // Step 5: Delete old file (non-blocking, continue even if fails)
    if (existing.source && existing.source !== uploadResult.url) {
      try {
        await deleteFile(existing.source);
        logger.info('updateWithUpload: Successfully deleted old file', { oldSource: existing.source, id });
      } catch (delErr) {
        logger.warn('updateWithUpload: Failed to delete old file (non-critical)', {
          error: delErr && (delErr.stack || delErr.message),
          oldSource: existing.source,
          id,
        });
      }
    }
    
    logger.info('updateWithUpload: Successfully updated record with new file', { id, url: uploadResult.url });
    return final;
  } catch (updateErr) {
    logger.error('updateWithUpload: Failed to update source URL after upload', {
      error: updateErr && (updateErr.stack || updateErr.message),
      id,
    });
    throw updateErr;
  }
}
