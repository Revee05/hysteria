import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma.js';
import { respondSuccess, respondError } from '../../../../lib/response.js';
import { requireAuthWithPermission } from '../../../../lib/helper/permission.helper.js';
import logger from '../../../../lib/logger.js';

/**
 * GET /api/admin/user-statuses
 * Fetch all available user statuses
 * Required permission: users.read
 */
export async function GET(request) {
  try {
    // Require authentication and 'status.get' permission
    const user = await requireAuthWithPermission(request, 'status.get');

    const statuses = await prisma.userStatus.findMany({
      select: {
        id: true,
        key: true,
        name: true,
        description: true,
        createdAt: true,
        _count: {
          select: {
            users: true,
          },
        },
      },
      orderBy: {
        key: 'asc',
      },
    });

    return respondSuccess({ statuses });
  } catch (error) {
    logger.error('Error fetching user statuses', { error: error && error.message ? error.message : error })
    return respondError(error)
  }
}

/**
 * POST /api/admin/user-statuses
 * Create a new user status
 * Required permission: status.create
 */
export async function POST(request) {
  try {
    const user = await requireAuthWithPermission(request, 'status.create');
    
    const body = await request.json();
    const { key, name, description } = body;

    // Validation
    if (!key || !name) {
      return respondError(
        { message: 'Key and name are required' },
        { status: 400 }
      );
    }

    // Check if key already exists
    const existing = await prisma.userStatus.findUnique({
      where: { key },
    });

    if (existing) {
      return respondError(
        { message: 'Status key already exists' },
        { status: 409 }
      );
    }

    const status = await prisma.userStatus.create({
      data: {
        key: key.toUpperCase().trim(),
        name: name.trim(),
        description: description?.trim() || null,
      },
      select: {
        id: true,
        key: true,
        name: true,
        description: true,
        createdAt: true,
      },
    });

    logger.info('User status created', {
      statusId: status.id,
      key: status.key,
      createdBy: user.id,
    });

    return respondSuccess(status, { status: 201 });
  } catch (error) {
    logger.error('Error creating user status', { error: error && error.message ? error.message : error });
    return respondError(error);
  }
}

/**
 * PUT /api/admin/user-statuses
 * Update an existing user status
 * Required permission: status.update
 */
export async function PUT(request) {
  try {
    const user = await requireAuthWithPermission(request, 'status.update');
    
    const body = await request.json();
    const { id, key, name, description } = body;

    if (!id) {
      return respondError(
        { message: 'Status ID is required' },
        { status: 400 }
      );
    }

    // Check if status exists
    const existing = await prisma.userStatus.findUnique({
      where: { id: parseInt(id) },
    });

    if (!existing) {
      return respondError(
        { message: 'Status not found' },
        { status: 404 }
      );
    }

    // If key is being changed, check for conflicts
    if (key && key !== existing.key) {
      const keyConflict = await prisma.userStatus.findUnique({
        where: { key: key.toUpperCase().trim() },
      });

      if (keyConflict) {
        return respondError(
          { message: 'Status key already exists' },
          { status: 409 }
        );
      }
    }

    const updateData = {};
    if (key) updateData.key = key.toUpperCase().trim();
    if (name) updateData.name = name.trim();
    if (description !== undefined) updateData.description = description?.trim() || null;

    const status = await prisma.userStatus.update({
      where: { id: parseInt(id) },
      data: updateData,
      select: {
        id: true,
        key: true,
        name: true,
        description: true,
        createdAt: true,
      },
    });

    logger.info('User status updated', {
      statusId: status.id,
      updatedBy: user.id,
    });

    return respondSuccess(status);
  } catch (error) {
    logger.error('Error updating user status', { error: error && error.message ? error.message : error });
    return respondError(error);
  }
}

/**
 * DELETE /api/admin/user-statuses?id=<statusId>
 * Delete a user status
 * Required permission: status.delete
 */
export async function DELETE(request) {
  try {
    const user = await requireAuthWithPermission(request, 'status.delete');
    
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return respondError(
        { message: 'Status ID is required' },
        { status: 400 }
      );
    }

    // Check if status exists and has users
    const status = await prisma.userStatus.findUnique({
      where: { id: parseInt(id) },
      include: {
        _count: {
          select: {
            users: true,
            histories: true,
          },
        },
      },
    });

    if (!status) {
      return respondError(
        { message: 'Status not found' },
        { status: 404 }
      );
    }

    if (status._count.users > 0) {
      return respondError(
        { message: `Cannot delete status. ${status._count.users} user(s) are currently using this status` },
        { status: 409 }
      );
    }

    if (status._count.histories > 0) {
      return respondError(
        { message: `Cannot delete status. This status has ${status._count.histories} historical record(s)` },
        { status: 409 }
      );
    }

    await prisma.userStatus.delete({
      where: { id: parseInt(id) },
    });

    logger.info('User status deleted', {
      statusId: parseInt(id),
      deletedBy: user.id,
    });

    return respondSuccess({ message: 'Status deleted successfully' });
  } catch (error) {
    logger.error('Error deleting user status', { error: error && error.message ? error.message : error });
    return respondError(error);
  }
}
