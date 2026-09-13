const prisma = require('../config/db');
const { logActivity } = require('../services/activityService');

// Get assignments (for logged-in student, or mentor's assigned list)
const getAssignments = async (req, res) => {
  try {
    const { status, studentId, page = 1, limit = 20 } = req.query;
    const pageNum = Math.max(1, parseInt(page, 10));
    const take = Math.max(1, Math.min(100, parseInt(limit, 10)));
    const skip = (pageNum - 1) * take;

    const where = {};

    if (req.user.role === 'STUDENT') {
      where.studentId = req.user.id;
    } else if (studentId) {
      where.studentId = studentId;
    }

    if (status && status !== 'All') {
      where.status = status;
    }

    const [assignments, total] = await Promise.all([
      prisma.assignment.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: {
          question: {
            select: { id: true, title: true, topic: true, difficulty: true, platform: true },
          },
          assignedBy: {
            select: { id: true, name: true, role: true },
          },
          student: {
            select: { id: true, name: true, email: true },
          },
        },
      }),
      prisma.assignment.count({ where }),
    ]);

    // Update overdue assignments dynamically
    const now = new Date();
    const updatedAssignments = assignments.map((a) => {
      let currentStatus = a.status;
      if (currentStatus !== 'COMPLETED' && a.deadline && new Date(a.deadline) < now) {
        currentStatus = 'OVERDUE';
      }
      return { ...a, status: currentStatus };
    });

    return res.status(200).json({
      data: updatedAssignments,
      page: pageNum,
      limit: take,
      total,
      totalPages: Math.ceil(total / take) || 1,
    });
  } catch (err) {
    return res.status(500).json({ message: 'Failed to fetch assignments', error: err.message });
  }
};

// Create an assignment (Mentor / Admin)
const createAssignment = async (req, res) => {
  try {
    const { questionId, studentId, deadline } = req.body;

    if (!questionId || !studentId) {
      return res.status(400).json({ message: 'Question ID and Student ID are required' });
    }

    const student = await prisma.user.findUnique({ where: { id: studentId } });
    if (!student || student.role !== 'STUDENT') {
      return res.status(404).json({ message: 'Student not found' });
    }

    const question = await prisma.question.findUnique({ where: { id: questionId } });
    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    const assignment = await prisma.assignment.create({
      data: {
        questionId,
        studentId,
        assignedById: req.user.id,
        deadline: deadline ? new Date(deadline) : null,
        status: 'ASSIGNED',
      },
      include: {
        question: { select: { id: true, title: true } },
        student: { select: { id: true, name: true } },
      },
    });

    await logActivity({
      userId: studentId,
      action: 'QUESTION_ASSIGNED',
      questionId,
      metadata: { assignedBy: req.user.name, title: question.title },
    });

    return res.status(201).json({
      message: 'Assignment created successfully',
      assignment,
    });
  } catch (err) {
    return res.status(500).json({ message: 'Failed to create assignment', error: err.message });
  }
};

// Update assignment status
const updateAssignment = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, deadline } = req.body;

    const assignment = await prisma.assignment.findUnique({ where: { id } });
    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    // Students can update their own status (e.g. IN_PROGRESS, COMPLETED)
    if (req.user.role === 'STUDENT' && assignment.studentId !== req.user.id) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    const updated = await prisma.assignment.update({
      where: { id },
      data: {
        ...(status ? { status } : {}),
        ...(deadline && ['MENTOR', 'ADMIN'].includes(req.user.role) ? { deadline: new Date(deadline) } : {}),
      },
    });

    return res.status(200).json({ message: 'Assignment updated successfully', assignment: updated });
  } catch (err) {
    return res.status(500).json({ message: 'Failed to update assignment', error: err.message });
  }
};

// Delete assignment
const deleteAssignment = async (req, res) => {
  try {
    const { id } = req.params;
    const assignment = await prisma.assignment.findUnique({ where: { id } });

    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    if (!['MENTOR', 'ADMIN'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Only mentors or admins can delete assignments' });
    }

    await prisma.assignment.delete({ where: { id } });

    return res.status(200).json({ message: 'Assignment deleted successfully' });
  } catch (err) {
    return res.status(500).json({ message: 'Failed to delete assignment', error: err.message });
  }
};

module.exports = {
  getAssignments,
  createAssignment,
  updateAssignment,
  deleteAssignment,
};
