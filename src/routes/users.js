const express = require('express')
const bcrypt = require('bcryptjs')
const User = require('../models/User')
const authenticateToken = require('../middleware/auth')
const { validateUserUpdate, handleValidation } = require('../middleware/validation')

const router = express.Router()

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Get all users (Admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *         description: Number of users per page
 *     responses:
 *       200:
 *         description: List of users retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 users:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/User'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     total:
 *                       type: integer
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 */
router.get('/', authenticateToken, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Admin access required',
      })
    }

    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 10

    const users = await User.findAll()
    
    // Simple pagination
    const startIndex = (page - 1) * limit
    const endIndex = page * limit
    const paginatedUsers = users.slice(startIndex, endIndex)

    res.json({
      users: paginatedUsers,
      pagination: {
        page,
        limit,
        total: users.length,
        totalPages: Math.ceil(users.length / limit),
      },
    })
  } catch (error) {
    console.error('Get users error:', error)
    res.status(500).json({
      error: 'Server error',
      message: 'An error occurred while fetching users',
    })
  }
})

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: Get user by ID
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: User ID
 *     responses:
 *       200:
 *         description: User retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Can only access own profile or admin required
 *       404:
 *         description: User not found
 */
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params

    // Users can only access their own profile unless they're admin
    if (req.user.role !== 'admin' && req.user.userId !== parseInt(id)) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'You can only access your own profile',
      })
    }

    const user = await User.findById(id)
    if (!user) {
      return res.status(404).json({
        error: 'User not found',
        message: 'User with the specified ID does not exist',
      })
    }

    res.json(user)
  } catch (error) {
    console.error('Get user error:', error)
    res.status(500).json({
      error: 'Server error',
      message: 'An error occurred while fetching user',
    })
  }
})

/**
 * @swagger
 * /api/users/{id}:
 *   put:
 *     summary: Update user by ID
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: User ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 minLength: 3
 *                 maxLength: 30
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 minLength: 6
 *             example:
 *               username: newusername
 *               email: newemail@example.com
 *     responses:
 *       200:
 *         description: User updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Can only update own profile or admin required
 *       404:
 *         description: User not found
 */
router.put('/:id', authenticateToken, validateUserUpdate, handleValidation, async (req, res) => {
  try {
    const { id } = req.params

    // Users can only update their own profile unless they're admin
    if (req.user.role !== 'admin' && req.user.userId !== parseInt(id)) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'You can only update your own profile',
      })
    }

    const { username, email, password } = req.body
    const updateData = {}

    if (username) {
      // Check if username is already taken
      const existingUser = await User.findByUsername(username)
      if (existingUser && existingUser.id !== parseInt(id)) {
        return res.status(400).json({
          error: 'Username already exists',
          message: 'A user with this username already exists',
        })
      }
      updateData.username = username
    }

    if (email) {
      // Check if email is already taken
      const existingUser = await User.findByEmail(email)
      if (existingUser && existingUser.id !== parseInt(id)) {
        return res.status(400).json({
          error: 'Email already exists',
          message: 'A user with this email already exists',
        })
      }
      updateData.email = email
    }

    if (password) {
      const saltRounds = 10
      updateData.password = await bcrypt.hash(password, saltRounds)
    }

    const updatedUser = await User.updateById(id, updateData)
    if (!updatedUser) {
      return res.status(404).json({
        error: 'User not found',
        message: 'User with the specified ID does not exist',
      })
    }

    res.json({
      message: 'User updated successfully',
      user: updatedUser,
    })
  } catch (error) {
    console.error('Update user error:', error)
    res.status(500).json({
      error: 'Server error',
      message: 'An error occurred while updating user',
    })
  }
})

/**
 * @swagger
 * /api/users/{id}:
 *   delete:
 *     summary: Delete user by ID (Admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: User ID
 *     responses:
 *       200:
 *         description: User deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 *       404:
 *         description: User not found
 */
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params

    // Only admin can delete users
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Admin access required to delete users',
      })
    }

    // Prevent admin from deleting themselves
    if (req.user.userId === parseInt(id)) {
      return res.status(400).json({
        error: 'Invalid operation',
        message: 'You cannot delete your own account',
      })
    }

    const deleted = await User.deleteById(id)
    if (!deleted) {
      return res.status(404).json({
        error: 'User not found',
        message: 'User with the specified ID does not exist',
      })
    }

    res.json({
      message: 'User deleted successfully',
    })
  } catch (error) {
    console.error('Delete user error:', error)
    res.status(500).json({
      error: 'Server error',
      message: 'An error occurred while deleting user',
    })
  }
})

/**
 * @swagger
 * /api/users/stats:
 *   get:
 *     summary: Get user statistics (Admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User statistics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalUsers:
 *                   type: integer
 *                 adminUsers:
 *                   type: integer
 *                 regularUsers:
 *                   type: integer
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 */
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Admin access required',
      })
    }

    const stats = await User.getUserStats()
    res.json(stats)
  } catch (error) {
    console.error('Get user stats error:', error)
    res.status(500).json({
      error: 'Server error',
      message: 'An error occurred while fetching user statistics',
    })
  }
})

module.exports = router
