const { MongoClient } = require('mongodb');
const crypto = require('crypto'); // 💡 Built into Node.js, no install needed!

// Node 24 will inject the environment variables natively via the terminal flag
const uri = process.env.MONGODB_URI;

if (!uri) {
  console.error("❌ MONGODB_URI is missing. Make sure to run from the root folder with the --env-file flag!");
  process.exit(1);
}

const client = new MongoClient(uri);

async function setupDatabase() {
  try {
    await client.connect();
    console.log("📡 Connected to MongoDB Cluster...");
    
    const db = client.db("AlGloryThm");

    // ==========================================
    // 1. LEADS COLLECTION
    // ==========================================
    console.log("⏳ Setting up 'leads' collection...");
    const leads = db.collection('leads');
    await leads.createIndex({ email: 1 });
    await leads.createIndex({ createdAt: -1 });
    await leads.createIndex({ leadStatus: 1, createdAt: -1 });

    // ==========================================
    // 2. BLOGS COLLECTION
    // ==========================================
    console.log("⏳ Setting up 'blogs' collection...");
    const blogs = db.collection('blogs');
    await blogs.createIndex({ slug: 1 }, { unique: true });
    await blogs.createIndex({ published: 1, createdAt: -1 });

    // ==========================================
    // 3. USERS COLLECTION
    // ==========================================
    console.log("⏳ Setting up 'users' collection...");
    const users = db.collection('users');
    await users.createIndex({ email: 1 }, { unique: true });

    const ownerExists = await users.findOne({ email: "contact@alglorythm.com" });
    if (!ownerExists) {
      await users.insertOne({
        id: crypto.randomUUID(), // 💡 Native UUID generation
        name: "Kanishka Verma",
        email: "contact@alglorythm.com",
        role: "OWNER",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      console.log("👤 Created initial owner account.");
    }

    // ==========================================
    // 4. HACKATHON INVITES
    // ==========================================
    console.log("⏳ Setting up 'hackathon_invites' collection...");
    const invites = db.collection('hackathon_invites');
    await invites.createIndex({ token: 1 }, { unique: true });
    await invites.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });

    // ==========================================
    // 5. COMMENTS
    // ==========================================
    console.log("⏳ Setting up 'comments' collection...");
    const comments = db.collection('comments');
    await comments.createIndex({ blogId: 1, createdAt: -1 }); 

    console.log("✅ AlGloryThm database schema and indexes successfully initialized!");

  } catch (error) {
    console.error("🔥 Error setting up database:", error);
  } finally {
    await client.close();
  }
}

setupDatabase();