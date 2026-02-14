# Quick MongoDB Atlas Setup (5 minutes)

## Step 1: Create MongoDB Atlas Account

1. Go to https://www.mongodb.com/cloud/atlas/register
2. Sign up for free account
3. Verify your email

## Step 2: Create Free Cluster

1. After login, click **"Build a Database"**
2. Choose **FREE** (M0) tier
3. Select a cloud provider (AWS, Google Cloud, or Azure)
4. Choose a region close to you
5. Name your cluster (e.g., "Cluster0")
6. Click **"Create"** (takes 3-5 minutes)

## Step 3: Create Database User

1. Go to **"Database Access"** (left sidebar)
2. Click **"Add New Database User"**
3. Choose **"Password"** authentication
4. Username: `pdsuser` (or any username)
5. Password: Create a strong password (save it!)
6. Database User Privileges: **"Read and write to any database"**
7. Click **"Add User"**

## Step 4: Whitelist IP Address

1. Go to **"Network Access"** (left sidebar)
2. Click **"Add IP Address"**
3. Click **"Allow Access from Anywhere"** (for development/testing)
   - Or add your specific IP: `0.0.0.0/0`
4. Click **"Confirm"**

## Step 5: Get Connection String

1. Go to **"Database"** (left sidebar)
2. Click **"Connect"** on your cluster
3. Choose **"Connect your application"**
4. Driver: **Node.js**, Version: **5.5 or later**
5. Copy the connection string (looks like):
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
6. Replace `<username>` with your database username
7. Replace `<password>` with your database password
8. Add database name at the end: `/pds?retryWrites=true&w=majority`

**Final connection string should look like:**
```
mongodb+srv://pdsuser:yourpassword@cluster0.xxxxx.mongodb.net/pds?retryWrites=true&w=majority
```

## Step 6: Update Backend .env

Update `backend/.env`:
```env
MONGODB_URI=mongodb+srv://pdsuser:yourpassword@cluster0.xxxxx.mongodb.net/pds?retryWrites=true&w=majority
```

## Done! ✅

Now you can start your backend server and it will connect to MongoDB Atlas.
