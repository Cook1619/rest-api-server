// In-memory user storage (In production, use a real database)
let users = [
  {
    id: 1,
    username: 'admin',
    email: 'admin@example.com',
    password: '$2a$10$XOPbrlUPQdwdJUpSrIF6X.LbE14qsMmKGhM1A8W9iqaG3vv1BD7WS', // password123
    role: 'admin',
    createdAt: new Date().toISOString(),
  },
]

let nextUserId = 2

class User {
  static async findAll() {
    return users.map(user => {
      const { password, ...userWithoutPassword } = user
      return userWithoutPassword
    })
  }

  static async findById(id) {
    const user = users.find(u => u.id === parseInt(id))
    if (!user) return null
    
    const { password, ...userWithoutPassword } = user
    return userWithoutPassword
  }

  static async findByEmail(email) {
    return users.find(u => u.email === email)
  }

  static async findByUsername(username) {
    return users.find(u => u.username === username)
  }

  static async create(userData) {
    const newUser = {
      id: nextUserId++,
      ...userData,
      role: userData.role || 'user',
      createdAt: new Date().toISOString(),
    }
    
    users.push(newUser)
    
    const { password, ...userWithoutPassword } = newUser
    return userWithoutPassword
  }

  static async updateById(id, userData) {
    const userIndex = users.findIndex(u => u.id === parseInt(id))
    if (userIndex === -1) return null

    users[userIndex] = {
      ...users[userIndex],
      ...userData,
      updatedAt: new Date().toISOString(),
    }

    const { password, ...userWithoutPassword } = users[userIndex]
    return userWithoutPassword
  }

  static async deleteById(id) {
    const userIndex = users.findIndex(u => u.id === parseInt(id))
    if (userIndex === -1) return false

    users.splice(userIndex, 1)
    return true
  }

  static async getUserStats() {
    return {
      totalUsers: users.length,
      adminUsers: users.filter(u => u.role === 'admin').length,
      regularUsers: users.filter(u => u.role === 'user').length,
    }
  }
}

module.exports = User
