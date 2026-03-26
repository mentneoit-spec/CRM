# AWS RDS Connection Troubleshooting Guide

## Current Issue
❌ **Connection Failed**: Can't reach database server at `gvs-crm-db.ckpo6eeug5v4.us-east-1.rds.amazonaws.com:5432`

## Quick Fix Steps

### 1. Fix Connection String (Missing Database Name)
```bash
node fix-rds-connection.js
```
Your current connection string is missing the database name at the end.

### 2. Check RDS Instance Status
Go to AWS Console → RDS → Databases → `gvs-crm-db`
- **Status should be**: `Available`
- **If not**: Start the instance

### 3. Security Group Configuration
**Most Common Issue**: Security group not allowing your IP

#### Check Security Group:
1. Go to AWS Console → RDS → Databases → `gvs-crm-db`
2. Click on "Connectivity & security" tab
3. Click on the security group link
4. Check "Inbound rules"

#### Required Inbound Rule:
- **Type**: PostgreSQL
- **Port**: 5432
- **Source**: Your IP address or `0.0.0.0/0` (for testing only)

#### Add Your IP:
1. Click "Edit inbound rules"
2. Click "Add rule"
3. Type: PostgreSQL
4. Port: 5432
5. Source: My IP (AWS will auto-detect)
6. Save rules

### 4. Database Creation
Make sure the database exists in your RDS instance:

#### Option A: Using pgAdmin or similar tool
1. Connect to RDS instance
2. Create database (e.g., `crm`, `college_db`)

#### Option B: Using psql command line
```bash
psql -h gvs-crm-db.ckpo6eeug5v4.us-east-1.rds.amazonaws.com -U gvs-crm-db -p 5432
CREATE DATABASE crm;
```

### 5. Test Connection
```bash
node test-rds-connection.js
```

## Common Connection String Formats

### Correct Format:
```
postgresql://username:password@endpoint:5432/database_name
```

### Your Fixed Format Should Be:
```
postgresql://gvs-crm-db:CrmProject2026!@gvs-crm-db.ckpo6eeug5v4.us-east-1.rds.amazonaws.com:5432/DATABASE_NAME
```

## Step-by-Step AWS Console Checks

### 1. RDS Instance Status
- AWS Console → RDS → Databases
- Find `gvs-crm-db`
- Status should be "Available"
- Endpoint should match your connection string

### 2. Security Groups
- Click on your RDS instance
- Go to "Connectivity & security" tab
- Click on security group name
- Check inbound rules for PostgreSQL (port 5432)

### 3. Parameter Groups
- Check if custom parameter group is used
- Ensure it allows connections

### 4. Subnet Groups
- Ensure RDS is in public subnet if connecting from internet
- Or ensure VPC allows connection from your location

## Testing Commands

### Test Basic Connectivity:
```bash
telnet gvs-crm-db.ckpo6eeug5v4.us-east-1.rds.amazonaws.com 5432
```

### Test PostgreSQL Connection:
```bash
psql -h gvs-crm-db.ckpo6eeug5v4.us-east-1.rds.amazonaws.com -U gvs-crm-db -p 5432 -d postgres
```

### Test with Node.js:
```bash
node test-rds-connection.js
```

## Migration Process After Fix

Once connection is working:

1. **Test Connection**: `node test-rds-connection.js`
2. **Run Migration**: `node migrate-neon-to-rds.js`
3. **Update App Config**: Change `DATABASE_URL` in `.env` to RDS
4. **Test Application**: `npm start`

## Emergency Rollback

If migration fails, you can always rollback:
1. Change `DATABASE_URL` back to Neon in `.env`
2. Restart application
3. Your Neon data remains unchanged

## Support Checklist

Before asking for help, please verify:
- [ ] RDS instance is running (Status: Available)
- [ ] Security group allows your IP on port 5432
- [ ] Database name exists in RDS instance
- [ ] Connection string includes database name
- [ ] Credentials are correct
- [ ] Can connect using psql or pgAdmin

## Next Steps

1. Run `node fix-rds-connection.js` to fix the connection string
2. Check AWS Console for RDS status and security groups
3. Test connection with `node test-rds-connection.js`
4. Once successful, run migration with `node migrate-neon-to-rds.js`