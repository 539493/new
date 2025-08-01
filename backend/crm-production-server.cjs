const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Хранилище данных (в продакшене можно подключить базу данных)
let users = [];
let tickets = [];
let userStats = {
  total: 0,
  tutors: 0,
  students: 0,
  active: 0,
  inactive: 0,
  suspended: 0,
  newThisMonth: 0
};

let ticketStats = {
  total: 0,
  open: 0,
  inProgress: 0,
  resolved: 0,
  closed: 0,
  urgent: 0,
  high: 0,
  medium: 0,
  low: 0
};

// Middleware для проверки API ключа
const checkApiKey = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const expectedKey = 'Bearer crm_539493_2024_auth_token_secure_key';
  
  if (!authHeader || authHeader !== expectedKey) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized - Invalid API key'
    });
  }
  
  next();
};

// API Routes

// Создание пользователя
app.post('/api/users', checkApiKey, (req, res) => {
  try {
    const userData = req.body;
    const newUser = {
      id: `user_${Date.now()}`,
      name: userData.name,
      email: userData.email,
      type: userData.type,
      status: 'active',
      phone: userData.phone,
      joinDate: userData.joinDate,
      lastActive: new Date().toISOString(),
      subjects: userData.subjects || ['Общие предметы'],
      rating: 0,
      totalStudents: 0
    };
    
    users.push(newUser);
    
    // Обновляем статистику
    userStats.total = users.length;
    if (newUser.type === 'tutor') {
      userStats.tutors++;
    } else {
      userStats.students++;
    }
    userStats.active++;
    userStats.newThisMonth++;
    
    console.log('✅ User created in CRM:', newUser);
    
    res.json({
      success: true,
      data: newUser
    });
  } catch (error) {
    console.error('❌ Error creating user:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Получение списка пользователей
app.get('/api/users', checkApiKey, (req, res) => {
  try {
    const { limit = 10, page = 1, type, status } = req.query;
    
    let filteredUsers = [...users];
    
    if (type) {
      filteredUsers = filteredUsers.filter(user => user.type === type);
    }
    
    if (status) {
      filteredUsers = filteredUsers.filter(user => user.status === status);
    }
    
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + parseInt(limit);
    const paginatedUsers = filteredUsers.slice(startIndex, endIndex);
    
    res.json({
      success: true,
      data: {
        data: paginatedUsers,
        total: filteredUsers.length,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(filteredUsers.length / limit)
      }
    });
  } catch (error) {
    console.error('❌ Error getting users:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Получение списка тикетов
app.get('/api/tickets', checkApiKey, (req, res) => {
  try {
    const { limit = 10, page = 1, status, priority } = req.query;
    
    let filteredTickets = [...tickets];
    
    if (status) {
      filteredTickets = filteredTickets.filter(ticket => ticket.status === status);
    }
    
    if (priority) {
      filteredTickets = filteredTickets.filter(ticket => ticket.priority === priority);
    }
    
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + parseInt(limit);
    const paginatedTickets = filteredTickets.slice(startIndex, endIndex);
    
    res.json({
      success: true,
      data: {
        data: paginatedTickets,
        total: filteredTickets.length,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(filteredTickets.length / limit)
      }
    });
  } catch (error) {
    console.error('❌ Error getting tickets:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Создание тикета
app.post('/api/tickets', checkApiKey, (req, res) => {
  try {
    const ticketData = req.body;
    const newTicket = {
      id: `ticket_${Date.now()}`,
      title: ticketData.title,
      description: ticketData.description,
      status: 'open',
      priority: ticketData.priority,
      category: ticketData.category,
      createdBy: ticketData.createdBy,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      tags: ticketData.tags || []
    };
    
    tickets.push(newTicket);
    
    // Обновляем статистику
    ticketStats.total = tickets.length;
    ticketStats.open++;
    if (newTicket.priority === 'urgent') ticketStats.urgent++;
    else if (newTicket.priority === 'high') ticketStats.high++;
    else if (newTicket.priority === 'medium') ticketStats.medium++;
    else ticketStats.low++;
    
    console.log('✅ Ticket created in CRM:', newTicket);
    
    res.json({
      success: true,
      data: newTicket
    });
  } catch (error) {
    console.error('❌ Error creating ticket:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Статистика пользователей
app.get('/api/users/stats', checkApiKey, (req, res) => {
  try {
    res.json({
      success: true,
      data: userStats
    });
  } catch (error) {
    console.error('❌ Error getting user stats:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Статистика тикетов
app.get('/api/tickets/stats', checkApiKey, (req, res) => {
  try {
    res.json({
      success: true,
      data: ticketStats
    });
  } catch (error) {
    console.error('❌ Error getting ticket stats:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'CRM Production Server is running',
    timestamp: new Date().toISOString(),
    users: users.length,
    tickets: tickets.length
  });
});

// Запуск сервера
app.listen(PORT, () => {
  console.log(`🚀 CRM Production Server running on port ${PORT}`);
  console.log(`📡 Server accessible at:`);
  console.log(`  - Local: http://localhost:${PORT}`);
  console.log(`  - API Base: http://localhost:${PORT}/api`);
  console.log(`  - Health Check: http://localhost:${PORT}/api/health`);
  console.log(`  - API Key: crm_539493_2024_auth_token_secure_key`);
}); 