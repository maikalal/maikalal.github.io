import { Hono } from "hono";
import { cors } from "hono/cors";

type Env = {
  BUCKET: R2Bucket;
  API_TOKEN: string;
};

const app = new Hono<{ Bindings: Env }>();

// Enable CORS for all routes
app.use("*", cors());

// Auth middleware
const authMiddleware = async (c: any, next: any) => {
  const authHeader = c.req.header("Authorization");
  const token = authHeader?.replace("Bearer ", "");
  
  if (!token || token !== c.env.API_TOKEN) {
    return c.json({ error: "Unauthorized" }, 401);
  }
  
  await next();
};

// Upload file - requires auth
app.post("/upload", authMiddleware, async (c) => {
  try {
    const formData = await c.req.formData();
    const file = formData.get("file") as File;
    
    if (!file) {
      return c.json({ error: "No file provided" }, 400);
    }
    
    // Generate unique key with original extension
    const ext = file.name.split(".").pop() || "bin";
    const key = `${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`;
    
    // Upload to R2
    await c.env.BUCKET.put(key, file.stream(), {
      httpMetadata: {
        contentType: file.type,
      },
    });
    
    // Return the URL (worker URL + /file/ + key)
    const url = `${new URL(c.req.url).origin}/file/${key}`;
    
    return c.json({ success: true, url, key });
  } catch (error) {
    console.error("Upload error:", error);
    return c.json({ error: "Upload failed" }, 500);
  }
});

// Get file - public access
app.get("/file/:key", async (c) => {
  const key = c.req.param("key");
  
  const object = await c.env.BUCKET.get(key);
  
  if (!object) {
    return c.json({ error: "File not found" }, 404);
  }
  
  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set("Cache-Control", "public, max-age=31536000");
  
  return new Response(object.body, { headers });
});

// Delete file - requires auth
app.delete("/file/:key", authMiddleware, async (c) => {
  const key = c.req.param("key");
  
  try {
    await c.env.BUCKET.delete(key);
    return c.json({ success: true });
  } catch (error) {
    return c.json({ error: "Delete failed" }, 500);
  }
});

// Health check
app.get("/", (c) => c.json({ status: "ok", service: "r2-worker" }));

export default app;
