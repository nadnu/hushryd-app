const { executeQuery } = require('../config/database');

async function createUserSessionsTable() {
  try {
    console.log('🚀 Creating user_sessions table...');

    // Create user_sessions table
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS user_sessions (
        id VARCHAR(36) PRIMARY KEY,
        user_id VARCHAR(36) NOT NULL,
        user_type ENUM('user', 'admin') NOT NULL DEFAULT 'user',
        token VARCHAR(500),
        ip_address VARCHAR(45),
        user_agent TEXT,
        device_type VARCHAR(50),
        device_name VARCHAR(255),
        location VARCHAR(255),
        login_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        logout_at TIMESTAMP NULL,
        last_activity TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        is_active BOOLEAN DEFAULT TRUE,
        expires_at TIMESTAMP NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_user_id (user_id),
        INDEX idx_user_type (user_type),
        INDEX idx_login_at (login_at),
        INDEX idx_is_active (is_active),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `;

    await executeQuery(createTableQuery);
    console.log('✅ User sessions table created successfully');

    // Check if table was created
    const checkTable = await executeQuery(`
      SELECT COUNT(*) as count 
      FROM information_schema.tables 
      WHERE table_schema = DATABASE() 
      AND table_name = 'user_sessions'
    `);

    if (checkTable[0].count > 0) {
      console.log('✅ User sessions table exists in database');
    } else {
      console.log('❌ User sessions table was not created');
    }

  } catch (error) {
    console.error('❌ Error creating user_sessions table:', error);
    // If foreign key constraint fails, try without it
    if (error.message.includes('foreign key')) {
      try {
        console.log('⚠️  Retrying without foreign key constraint...');
        const createTableQueryNoFK = `
          CREATE TABLE IF NOT EXISTS user_sessions (
            id VARCHAR(36) PRIMARY KEY,
            user_id VARCHAR(36) NOT NULL,
            user_type ENUM('user', 'admin') NOT NULL DEFAULT 'user',
            token VARCHAR(500),
            ip_address VARCHAR(45),
            user_agent TEXT,
            device_type VARCHAR(50),
            device_name VARCHAR(255),
            location VARCHAR(255),
            login_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            logout_at TIMESTAMP NULL,
            last_activity TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            is_active BOOLEAN DEFAULT TRUE,
            expires_at TIMESTAMP NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            INDEX idx_user_id (user_id),
            INDEX idx_user_type (user_type),
            INDEX idx_login_at (login_at),
            INDEX idx_is_active (is_active)
          ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        `;
        await executeQuery(createTableQueryNoFK);
        console.log('✅ User sessions table created without foreign key constraint');
      } catch (retryError) {
        console.error('❌ Error creating user_sessions table (retry):', retryError);
      }
    }
  }
}

// Run the script
if (require.main === module) {
  createUserSessionsTable()
    .then(() => {
      console.log('✅ Script completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Script failed:', error);
      process.exit(1);
    });
}

module.exports = { createUserSessionsTable };

