# Database Migration Guide: Neon to AWS RDS

## Overview
This guide will help you migrate your complete database from Neon PostgreSQL to AWS RDS PostgreSQL.

## Prerequisites

### 1. AWS RDS Setup
Before running the migration, you need to:

1. **Create AWS RDS PostgreSQL Instance**
   - Go to AWS Console → RDS
   - Create new PostgreSQL database
   - Note down the endpoint, username, password, and database name

2. **Get RDS Connection String**
   ```
   postgresql://username:password@your-rds-endpoint:5432/database_name
   ```

### 2. Environment Setup
Add your RDS connection string to environment variables:

**Option A: Add to .env file**
```bash
RDS_DATABASE_URL="postgresql://username:password@your-rds-endpoint:5432/database_name"
```

**Option B: Set environment variable**
```bash
export RDS_DATABASE_URL="postgresql://username:password@your-rds-endpoint:5432/database_name"
```

## Migration Steps

### Step 1: Check Current Neon Data
```bash
node check-neon-data.js
```
This will show you what data exists in your Neon database.

### Step 2: Run Migration
```bash
node migrate-neon-to-rds.js
```

### Step 3: Verify Migration
After migration completes, update your `.env` file to use RDS:
```bash
# Comment out Neon URL
# DATABASE_URL="postgresql://neondb_owner:npg_HelXW2BJo9Kj@ep-steep-flower-ad8g8g9h-pooler.c-2.us-east-1.aws.neon.tech/Crm?sslmode=require"

# Add RDS URL
DATABASE_URL="postgresql://username:password@your-rds-endpoint:5432/database_name"
```

### Step 4: Test Application
```bash
npm start
```

## What Gets Migrated

The migration script transfers all data in the correct order:

1. **Core Data**
   - Colleges
   - College Domains
   - Users
   - Admin Profiles

2. **Academic Data**
   - Classes
   - Subjects
   - Teachers
   - Students

3. **Admission Data**
   - Admissions
   - Admission Team

4. **Assessment Data**
   - Exams
   - Exam Results

5. **Financial Data**
   - Fees
   - Payments

6. **Communication Data**
   - Notices
   - Complaints

## Migration Features

- ✅ **Complete Data Transfer**: All tables and relationships
- ✅ **Foreign Key Respect**: Data imported in correct order
- ✅ **Upsert Operations**: Handles duplicates gracefully
- ✅ **Error Handling**: Detailed error reporting
- ✅ **Progress Tracking**: Real-time migration status
- ✅ **Data Validation**: Ensures data integrity
- ✅ **Backup Creation**: Exports data to JSON file

## Troubleshooting

### Common Issues

1. **Connection Error**
   ```
   Error: Connection refused
   ```
   **Solution**: Check your RDS endpoint and security groups

2. **Authentication Error**
   ```
   Error: Authentication failed
   ```
   **Solution**: Verify username/password in connection string

3. **Database Not Found**
   ```
   Error: Database does not exist
   ```
   **Solution**: Create the database in RDS first

4. **Permission Error**
   ```
   Error: Permission denied
   ```
   **Solution**: Ensure RDS user has CREATE/INSERT permissions

### Security Groups
Make sure your RDS security group allows connections from your IP:
- Type: PostgreSQL
- Port: 5432
- Source: Your IP address or 0.0.0.0/0 (for testing only)

## Post-Migration Checklist

- [ ] All data migrated successfully
- [ ] Application connects to RDS
- [ ] Login functionality works
- [ ] Dashboard displays correct data
- [ ] Fee management shows real data
- [ ] Subject performance shows real data
- [ ] All CRUD operations work

## Rollback Plan

If you need to rollback to Neon:
1. Change `DATABASE_URL` back to Neon in `.env`
2. Restart the application
3. Your Neon data remains unchanged

## Support

If you encounter issues:
1. Check the migration logs for specific errors
2. Verify your RDS connection string
3. Ensure RDS security groups are configured correctly
4. Test RDS connection independently using a PostgreSQL client